import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { ApiError } from '../middlewares/error.middleware';
import { ProductService } from '../services/product.service';

const createProductSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(10),
  price: z.number().positive(),
  stock: z.number().int().min(0).default(0),
  categoryId: z.string().uuid(),
  attributes: z.record(z.string(), z.any()).optional(),
  isFeatured: z.boolean().default(false),
  discount: z.number().min(0).max(100).optional(),
  slug: z.string().optional(),
});

const updateProductSchema = createProductSchema.partial();

const queryProductSchema = z.object({
  skip: z.coerce.number().min(0).default(0),
  take: z.coerce.number().min(1).max(100).default(20),
  categoryId: z.string().uuid().optional(),
  search: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  orderBy: z.string().default('createdAt_desc'),
  isFeatured: z.coerce.boolean().optional(),
});

export class ProductController {
  static async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const queryResult = queryProductSchema.safeParse(req.query);
      if (!queryResult.success) {
        throw ApiError.badRequest('Invalid query parameters');
      }

      const result = await ProductService.findAll(queryResult.data);

      return res.status(200).json({
        status: 'success',
        data: result.products,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getProductById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const product = await ProductService.findById(id);

      return res.status(200).json({
        status: 'success',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getProductBySlug(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { slug } = req.params;
      const product = await ProductService.findBySlug(slug);

      return res.status(200).json({
        status: 'success',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const validationResult = createProductSchema.safeParse(req.body);
      if (!validationResult.success) {
        throw ApiError.badRequest('Invalid product data');
      }

      const { categoryId, slug, ...rest } = validationResult.data;

      const product = await ProductService.create({
        ...rest,
        category: { connect: { id: categoryId } },
        slug: slug ?? rest.name.toLowerCase().replace(/\s+/g, '-'),
      });

      return res.status(201).json({
        status: 'success',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const validationResult = updateProductSchema.safeParse(req.body);
      if (!validationResult.success) {
        throw ApiError.badRequest('Invalid product data');
      }

      const product = await ProductService.update(id, validationResult.data);

      return res.status(200).json({
        status: 'success',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await ProductService.delete(id);

      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  static async updateProductStock(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;
      const schema = z.object({
        quantity: z.number().int(),
      });

      const validationResult = schema.safeParse(req.body);

      if (!validationResult.success) {
        throw ApiError.badRequest('Cantidad inválida');
      }
      const product = await ProductService.updateStock(
        id,
        validationResult.data.quantity
      );

      return res.status(200).json({
        status: 'success',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }
}
