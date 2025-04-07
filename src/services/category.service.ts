import { Prisma, PrismaClient } from '@prisma/client';
import { ApiError } from '../middlewares/error.middleware';
import slugify from 'slugify';

const prisma = new PrismaClient();

export class CategoryService {
  static async findAll(params: {
    skip?: number;
    take?: number;
    parentId?: string;
    search?: string;
    orderBy?: string;
  }) {
    const {
      skip = 0,
      take = 20,
      parentId,
      search,
      orderBy = 'createdAt_desc',
    } = params;

    const where: Prisma.CategoryWhereInput = {};
    if (parentId) {
      where.parentId = parentId;
    }
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }
    const [orderByField, order] = orderBy.split('_');
    const orderByObj: any = {};
    orderByObj[orderByField] = order === 'asc' ? 'asc' : 'desc';

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where,
        skip,
        take,
        orderBy: orderByObj,
        include: {
          products: {
            select: {
              id: true,
              name: true,
              price: true,
              isFeatured: true,
            },
          },
        },
      }),
      prisma.category.count({ where }),
    ]);

    return {
      categories,
      meta: {
        total,
        skip,
        take,
        pages: Math.ceil(total / take),
      },
    };
  }

  static async findById(id: string) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        products: {
          select: {
            id: true,
            name: true,
            price: true,
            isFeatured: true,
          },
        },
      },
    });
    if (!category) {
      throw ApiError.notFound('Category not found');
    }

    return category;
  }

  static async findBySlug(slug: string) {
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        products: {
          select: {
            id: true,
            name: true,
            price: true,
            isFeatured: true,
          },
        },
      },
    });
    if (!category) {
      throw ApiError.notFound('Category not found');
    }

    return category;
  }

  static async create(data: Prisma.CategoryCreateInput) {
    if (!data.slug) {
      data.slug = slugify(data.name, {
        lower: true,
      });
    }

    const existingCategory = await prisma.category.findUnique({
      where: { slug: data.slug },
    });
    if (existingCategory) {
      data.slug = `${data.slug}-${Date.now()}`;
    }

    return prisma.category.create({
      data,
      include: {
        products: {
          select: {
            id: true,
            name: true,
            price: true,
            isFeatured: true,
          },
        },
      },
    });
  }

  static async update(id: string, data: Prisma.CategoryUpdateInput) {
    if (data.name && !data.slug) {
      data.slug = slugify(data.name as string, { lower: true });
    }

    const existingCategory = await prisma.category.findUnique({
      where: { slug: data.slug as string, NOT: { id } },
    });
    if (existingCategory) {
      data.slug = `${data.slug}-${Date.now()}`;
    }

    try {
      return prisma.category.update({
        where: { id },
        data,
        include: {
          products: {
            select: {
              id: true,
              name: true,
              price: true,
              isFeatured: true,
            },
          },
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw ApiError.notFound('Category not found');
      }
      throw error;
    }
  }

  static async delete(id: string) {
    try {
      return await prisma.category.delete({
        where: { id },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw ApiError.notFound('Category not found');
      }
      throw error;
    }
  }
}
