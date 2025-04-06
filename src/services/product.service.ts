import { Prisma, PrismaClient } from '@prisma/client';
import { ApiError } from '../middlewares/error.middleware';
import slugify from 'slugify';

const prisma = new PrismaClient();

export class ProductService {
  static async findAll(params: {
    skip?: number;
    take?: number;
    categoryId?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    orderBy?: string;
    isFeatured?: boolean;
  }) {
    const {
      skip = 0,
      take = 20,
      categoryId,
      search,
      minPrice,
      maxPrice,
      orderBy = 'createdAt_desc',
      isFeatured,
    } = params;

    const where: Prisma.ProductWhereInput = {};

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) {
        where.price.gte = minPrice;
      }
      if (maxPrice !== undefined) {
        where.price.lte = maxPrice;
      }
    }

    if (isFeatured !== undefined) {
      where.isFeatured = isFeatured;
    }

    const [orderByField, order] = orderBy.split('_');
    const orderByObj: any = {};
    orderByObj[orderByField] = order === 'asc' ? 'asc' : 'desc';

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take,
        orderBy: orderByObj,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          images: {
            where: { isMain: true },
            take: 1,
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products,
      meta: {
        total,
        skip,
        take,
        pages: Math.ceil(total / take),
      },
    };
  }

  static async findById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: true,
      },
    });

    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    return product;
  }

  static async findBySlug(slug: string) {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        images: true,
      },
    });

    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    return product;
  }

  static async create(data: Prisma.ProductCreateInput) {
    // Generate slug if not provided
    if (!data.slug) {
      data.slug = slugify(data.name, { lower: true });
    }

    // Check if slug already exists
    const existingProduct = await prisma.product.findUnique({
      where: { slug: data.slug },
    });
    if (existingProduct) {
      // Add timestamp to slug if it already exists
      data.slug = `${data.slug}-${Date.now()}`;
    }

    return prisma.product.create({
      data,
      include: {
        category: true,
        images: true,
      },
    });
  }

  static async update(id: string, data: Prisma.ProductUpdateInput) {
    // Generate slug if not provided
    if (data.name && !data.slug) {
      data.slug = slugify(data.name as string, { lower: true });

      // Check if slug already exists
      const existingProduct = await prisma.product.findUnique({
        where: {
          slug: data.slug as string,
          NOT: { id },
        },
      });
      if (existingProduct) {
        // Add timestamp to slug if it already exists
        data.slug = `${data.slug}-${Date.now()}`;
      }
    }

    try {
      return await prisma.product.update({
        where: { id },
        data,
        include: {
          category: true,
          images: true,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw ApiError.notFound('Product not found');
      }
      throw error;
    }
  }

  static async delete(id: string) {
    try {
      return await prisma.product.delete({
        where: { id },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw ApiError.notFound('Product not found');
      }
      throw error;
    }
  }

  static async updateStock(id: string, quantity: number) {
    try {
      return await prisma.product.update({
        where: { id },
        data: {
          stock: {
            increment: quantity,
          },
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw ApiError.notFound('Product not found');
      }
      throw error;
    }
  }
}
