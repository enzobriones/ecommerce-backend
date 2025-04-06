import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { ApiError } from '../middlewares/error.middleware';
import { AuthService } from '../services/auth.service';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(32),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(32),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(8).max(32),
  newPassword: z.string().min(8).max(32),
});

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
