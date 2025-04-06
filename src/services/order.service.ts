import {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  Prisma,
  PrismaClient,
  ShippingMethod,
  ShippingStatus,
} from '@prisma/client';
import { ApiError } from '../middlewares/error.middleware';

const prisma = new PrismaClient();

export class OrderService {
  static async findAll(params: {
    skip?: number;
    take?: number;
    userId?: string;
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
    shippingStatus?: ShippingStatus;
    startDate?: Date | string;
    endDate?: Date | string;
    orderBy?: string;
  }) {
    const {
      skip = 0,
      take = 10,
      userId,
      status,
      paymentStatus,
      shippingStatus,
      startDate,
      endDate,
      orderBy = 'createdAt',
    } = params;

    const where: Prisma.OrderWhereInput = {};
    if (userId) {
      where.userId = userId;
    }
    if (status) {
      where.status = status;
    }
    if (paymentStatus) {
      where.paymentStatus = paymentStatus;
    }
    if (shippingStatus) {
      where.shippingStatus = shippingStatus;
    }
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    const [orderByField, order] = orderBy.split('_');
    const orderByObj: any = {};
    orderByObj[orderByField] = order === 'asc' ? 'asc' : 'desc';

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take,
        orderBy: orderByObj,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          address: true,
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  images: {
                    where: { isMain: true },
                    take: 1,
                  },
                },
              },
            },
          },
        },
      }),
      prisma.order.count({
        where,
      }),
    ]);

    return {
      orders,
      meta: {
        total,
        skip,
        take,
        pages: Math.ceil(total / take),
      },
    };
  }

  static async findById(id: string) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        address: true,
        items: {
          include: {
            product: {
              include: {
                images: {
                  where: { isMain: true },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw ApiError.notFound('Order not found');
    }

    return order;
  }

  static async create(data: {
    userId: string;
    addressId: string;
    paymentMethod: PaymentMethod;
    shippingMethod: ShippingMethod;
    shippingCost: number;
    notes?: string;
    items: {
      productId: string;
      quantity: number;
    }[];
  }) {
    // Verify the user exists
    const user = await prisma.user.findUnique({
      where: { id: data.userId },
    });

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    // Verify the address exists and belongs to the user
    const address = await prisma.address.findFirst({
      where: {
        id: data.addressId,
        userId: data.userId,
      },
    });

    if (!address) {
      throw ApiError.notFound(
        'Address not found or does not belong to the user'
      );
    }

    // Verify the payment method is valid
    let subtotal = 0;
    const orderItems: Prisma.OrderItemCreateManyOrderInput[] = [];

    for (const item of data.items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        throw ApiError.notFound(`Product with ID ${item.productId} not found`);
      }

      if (product.stock < item.quantity) {
        throw ApiError.badRequest(
          `Not enough stock for product ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`
        );
      }

      // Calculate the price with discount if applicable
      const price = product.discount
        ? Math.round(product.price * (1 - product.discount / 100))
        : product.price;

      subtotal += price * item.quantity;
      orderItems.push({
        productId: product.id,
        quantity: item.quantity,
        price: price,
      });
    }

    // Calculate total
    const total = subtotal + data.shippingCost;

    // Create the order and order items
    return prisma.$transaction(async (tx) => {
      // Create the order
      const order = await tx.order.create({
        data: {
          userId: data.userId,
          addressId: data.addressId,
          paymentMethod: data.paymentMethod,
          shippingMethod: data.shippingMethod,
          shippingCost: data.shippingCost,
          subtotal,
          total,
          notes: data.notes,
          status: 'PENDING',
          paymentStatus: 'PENDING',
          shippingStatus: 'PENDING',
          items: {
            create: orderItems,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          address: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      // Update the stock of each product
      for (const item of data.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      return order;
    });
  }

  static async updateStatus(
    id: string,
    data: {
      status?: OrderStatus;
      paymentStatus?: PaymentStatus;
      shippingStatus?: ShippingStatus;
      trackingNumber?: string;
      notes?: string;
    }
  ) {
    try {
      return await prisma.order.update({
        where: { id },
        data,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          address: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw ApiError.notFound('Order not found');
      }
      throw error;
    }
  }

  static async cancelOrder(id: string) {
    // Search for the order
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!order) {
      throw ApiError.notFound('Order not found');
    }

    // Only update if status is PENDING or PROCESSING
    if (order.status !== 'PENDING' && order.status !== 'PROCESSING') {
      throw ApiError.badRequest(
        `Cannot cancel order in ${order.status} status`
      );
    }

    // Use the transaction to ensure atomicity
    return prisma.$transaction(async (tx) => {
      // Restore stock for each product
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        });
      }

      // Update status of the order
      return tx.order.update({
        where: { id },
        data: {
          status: 'CANCELED',
          paymentStatus: order.paymentStatus === 'PAID' ? 'REFUNDED' : 'FAILED',
          shippingStatus:
            order.shippingStatus === 'SHIPPED'
              ? 'RETURNED'
              : order.shippingStatus,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          address: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    });
  }

  static async getUserOrders(
    userId: string,
    params: {
      skip?: number;
      take?: number;
      status?: OrderStatus;
    }
  ) {
    const { skip = 0, take = 20, status } = params;

    const where: Prisma.OrderWhereInput = { userId };

    if (status) {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          address: true,
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  images: {
                    where: { isMain: true },
                    take: 1,
                  },
                },
              },
            },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return {
      orders,
      meta: {
        total,
        skip,
        take,
        pages: Math.ceil(total / take),
      },
    };
  }
}
