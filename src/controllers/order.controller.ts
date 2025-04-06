import type { NextFunction, Request, Response } from 'express';

import { ApiError } from '../middlewares/error.middleware';
import { OrderService } from '../services/order.service';
import {
  createOrderSchema,
  queryOrderSchema,
  updateOrderStatusSchema,
  userOrdersQuerySchema,
} from '../schemas/order.schema';

export class OrderController {
  static async getOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const queryResult = queryOrderSchema.safeParse(req.query);
      if (!queryResult.success) {
        throw ApiError.badRequest('Invalid query parameters');
      }

      const result = await OrderService.findAll(queryResult.data);

      return res.status(200).json({
        status: 'success',
        data: result.orders,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getOrderById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const order = await OrderService.findById(id);

      return res.status(200).json({
        status: 'success',
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { user } = req as any; // Obtenido del middleware de autenticación

      const validationResult = createOrderSchema.safeParse(req.body);
      if (!validationResult.success) {
        throw ApiError.badRequest('Invalid order data');
      }

      const order = await OrderService.create({
        userId: user.id,
        ...validationResult.data,
      });

      return res.status(201).json({
        status: 'success',
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateOrderStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;

      const validationResult = updateOrderStatusSchema.safeParse(req.body);
      if (!validationResult.success) {
        throw ApiError.badRequest('Invalid status data');
      }

      const order = await OrderService.updateStatus(id, validationResult.data);

      return res.status(200).json({
        status: 'success',
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  static async cancelOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const order = await OrderService.cancelOrder(id);

      return res.status(200).json({
        status: 'success',
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getUserOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const { user } = req as any; // Obtenido del middleware de autenticación
      const queryResult = userOrdersQuerySchema.safeParse(req.query);

      if (!queryResult.success) {
        throw ApiError.badRequest('Invalid query parameters');
      }

      const result = await OrderService.getUserOrders(
        user.id,
        queryResult.data
      );

      return res.status(200).json({
        status: 'success',
        data: result.orders,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  }
}
