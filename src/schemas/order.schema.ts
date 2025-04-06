import { OrderStatus, PaymentMethod, PaymentStatus, ShippingMethod, ShippingStatus } from "@prisma/client";
import { z } from "zod";

export const createOrderSchema = z.object({
  addressId: z.string().uuid(),
  paymentMethod: z.nativeEnum(PaymentMethod),
  shippingMethod: z.nativeEnum(ShippingMethod),
  shippingCost: z.number().min(0),
  notes: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1, 'At least one item is required'),
});

export const updateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus).optional(),
  paymentStatus: z.nativeEnum(PaymentStatus).optional(),
  shippingStatus: z.nativeEnum(ShippingStatus).optional(),
  trackingNumber: z.string().optional(),
  notes: z.string().optional(),
});

export const queryOrderSchema = z.object({
  skip: z.coerce.number().min(0).default(0),
  take: z.coerce.number().min(1).max(100).default(20),
  userId: z.string().uuid().optional(),
  status: z.nativeEnum(OrderStatus).optional(),
  paymentStatus: z.nativeEnum(PaymentStatus).optional(),
  shippingStatus: z.nativeEnum(ShippingStatus).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  orderBy: z.string().default('createdAt_desc'),
});

export const userOrdersQuerySchema = z.object({
  skip: z.coerce.number().min(0).default(0),
  take: z.coerce.number().min(1).max(100).default(20),
  status: z.nativeEnum(OrderStatus).optional(),
});
