import { Prisma, PrismaClient } from '@prisma/client';
import { ApiError } from '../middlewares/error.middleware';

const prisma = new PrismaClient();

export class ProductImageService {
  static async addImage(data: {
    productId: string;
    url: string;
    isMain?: boolean;
  }) {
    // Verify if the product exists
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
    });
    if (!product) {
      throw ApiError.badRequest('Product not found');
    }

    // If isMain is true, set all other images to false
    if (data.isMain) {
      await prisma.productImage.updateMany({
        where: { productId: data.productId, isMain: true },
        data: { isMain: true },
      });
    }

    return prisma.productImage.create({
      data: {
        product: {
          connect: {
            id: data.productId,
          },
        },
        url: data.url,
        isMain: data.isMain || false,
      },
    });
  }

  static async getProductImages(productId: string) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      throw ApiError.badRequest('Product not found');
    }

    return prisma.productImage.findMany({
      where: { productId },
      orderBy: { isMain: 'desc' },
    });
  }

  static async updateImage(
    id: string,
    data: {
      url?: string;
      isMain?: boolean;
    }
  ) {
    try {
      if (data.isMain) {
        const currentImage = await prisma.productImage.findUnique({
          where: { id },
        });
        if (currentImage) {
          await prisma.productImage.updateMany({
            where: {
              productId: currentImage.productId,
              isMain: true,
              NOT: { id },
            },
            data: { isMain: false },
          });
        }

        return prisma.productImage.update({
          where: { id },
          data: {
            ...data,
          },
        });
      }
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw ApiError.notFound('Image not found');
      }
      throw error;
    }
  }

  static async deleteImage(id: string) {
    try {
      return await prisma.productImage.delete({
        where: { id },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw ApiError.notFound('Image not found');
      }
      throw error;
    }
  }

  static async setMainImage(id: string) {
    try {
      const image = await prisma.productImage.findUnique({
        where: { id },
      });

      if (!image) {
        throw ApiError.notFound('Image not found');
      }

      // Unmark all other images as main
      await prisma.productImage.updateMany({
        where: {
          productId: image.productId,
          isMain: true,
        },
        data: {
          isMain: false,
        },
      });

      // Mark the selected image as main
      return await prisma.productImage.update({
        where: { id },
        data: {
          isMain: true,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw ApiError.notFound('Image not found');
      }
      throw error;
    }
  }
}
