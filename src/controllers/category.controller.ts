import type { NextFunction, Request, Response } from 'express';
import { createCategorySchema, queryCategorySchema } from '../schemas/category.schema';
import { ApiError } from '../middlewares/error.middleware';
import { CategoryService } from '../services/category.service';

export class CategoryController {
  static async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const queryResult = queryCategorySchema.safeParse(req.query);
      if (!queryResult.success) {
        throw ApiError.badRequest('Invalid query parameters');
      }

      const result = await CategoryService.findAll(queryResult.data);

      return res.status(200).json({
        status: 'success',
        data: result.categories,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getCategoryById(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;
      const category = await CategoryService.findById(id);

      return res.status(200).json({
        status: 'success',
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getCategoryBySlug(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { slug } = req.params;
      const category = await CategoryService.findBySlug(slug);

      return res.status(200).json({
        status: 'success',
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createCategory(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const validationResult = createCategorySchema.safeParse(req.body);
      if (!validationResult.success) {
        throw ApiError.badRequest('Invalid category data');
      }
      const { slug, ...rest } = validationResult.data;

      const category = await CategoryService.create({
        ...rest,
        slug: slug ?? rest.name.toLowerCase().replace(/\s+/g, '-'),
      });

      return res.status(201).json({
        status: 'success',
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateCategory(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;
      const validationResult = createCategorySchema.safeParse(req.body);
      if (!validationResult.success) {
        throw ApiError.badRequest('Invalid category data');
      }
      const { slug, ...rest } = validationResult.data;

      const category = await CategoryService.update(id, {
        ...rest,
        slug: slug ?? rest.name.toLowerCase().replace(/\s+/g, '-'),
      });

      return res.status(200).json({
        status: 'success',
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteCategory(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;
      const category = await CategoryService.delete(id);

      return res.status(200).json({
        status: 'success',
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }
}
