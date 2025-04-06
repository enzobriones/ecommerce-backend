import { z } from "zod";

export const createProductSchema = z.object({
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

export const updateProductSchema = createProductSchema.partial();

export const queryProductSchema = z.object({
  skip: z.coerce.number().min(0).default(0),
  take: z.coerce.number().min(1).max(100).default(20),
  categoryId: z.string().uuid().optional(),
  search: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  orderBy: z.string().default('createdAt_desc'),
  isFeatured: z.coerce.boolean().optional(),
});