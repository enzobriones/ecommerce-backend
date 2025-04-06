import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { ProductImageService } from '../services/product-image.service';
import { ApiError } from '../middlewares/error.middleware';
import {
  createImageSchema,
  updateImageSchema,
} from '../schemas/product-image.schema';

export class ProductImageController {
  static async addProductImage(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { productId } = req.params;

      const validationResult = createImageSchema.safeParse(req.body);
      if (!validationResult.success) {
        throw ApiError.badRequest('Invalid image data');
      }

      const image = await ProductImageService.addImage({
        productId,
        ...validationResult.data,
      });

      return res.status(201).json({
        status: 'success',
        data: image,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getProductImages(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { productId } = req.params;
      const images = await ProductImageService.getProductImages(productId);

      return res.status(200).json({
        status: 'success',
        data: images,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateImage(req: Request, res: Response, next: NextFunction) {
    try {
      const { imageId } = req.params;

      const validationResult = updateImageSchema.safeParse(req.body);
      if (!validationResult.success) {
        throw ApiError.badRequest('Invalid image data');
      }

      const image = await ProductImageService.updateImage(
        imageId,
        validationResult.data
      );

      return res.status(200).json({
        status: 'success',
        data: image,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteImage(req: Request, res: Response, next: NextFunction) {
    try {
      const { imageId } = req.params;
      await ProductImageService.deleteImage(imageId);

      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  static async setMainImage(req: Request, res: Response, next: NextFunction) {
    try {
      const { imageId } = req.params;
      const image = await ProductImageService.setMainImage(imageId);

      return res.status(200).json({
        status: 'success',
        data: image,
      });
    } catch (error) {
      next(error);
    }
  }
}
