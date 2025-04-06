import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { ApiError } from '../middlewares/error.middleware';
import { AuthService } from '../services/auth.service';
import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
} from '../schemas/auth.schema';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const validationResult = registerSchema.safeParse(req.body);
      if (!validationResult.success) {
        throw ApiError.badRequest('Invalid input data');
      }

      const result = await AuthService.register(validationResult.data);

      return res.status(201).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const validationResult = loginSchema.safeParse(req.body);
      if (!validationResult.success) {
        throw ApiError.badRequest('Invalid input data');
      }
      const { email, password } = validationResult.data;
      const result = await AuthService.login(email, password);

      return res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      // Validate request body
      if (!req.user || !req.user.id) {
        throw ApiError.unauthorized('User not authenticated');
      }

      const validationResult = changePasswordSchema.safeParse(req.body);
      if (!validationResult.success) {
        throw ApiError.badRequest('Invalid input data');
      }

      const { currentPassword, newPassword } = validationResult.data;
      const result = await AuthService.changePassword(
        req.user.id,
        currentPassword,
        newPassword
      );

      return res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      // Requires previous authentication
      if (!req.user) {
        throw ApiError.unauthorized('User not authenticated');
      }

      return res.status(200).json({
        status: 'success',
        data: req.user,
      });
    } catch (error) {
      next(error);
    }
  }
}
