import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { authenticate, isAdmin, isStaff } from '../middlewares/auth.middleware';

const orderRouter = Router();

// Authenticated routes for users
orderRouter.get(
  '/my-orders',
  authenticate,
  OrderController.getUserOrders as any
);
orderRouter.post('/', authenticate, OrderController.createOrder as any);

// Authenticated routes for staff/admin
orderRouter.get('/', authenticate, isStaff, OrderController.getOrders as any);
orderRouter.get(
  '/:id',
  authenticate,
  isStaff,
  OrderController.getOrderById as any
);
orderRouter.patch(
  '/:id/status',
  authenticate,
  isStaff,
  OrderController.updateOrderStatus as any
);
orderRouter.post(
  '/:id/cancel',
  authenticate,
  isStaff,
  OrderController.cancelOrder as any
);

export default orderRouter;
