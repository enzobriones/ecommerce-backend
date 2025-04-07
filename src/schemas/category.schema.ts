import e from 'express';
import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(10).optional(),
  slug: z.string().optional(),
  parentId: z.string().uuid().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export const queryCategorySchema = z.object({
  skip: z.coerce.number().min(0).default(0),
  take: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  orderBy: z.string().default('createdAt_desc'),
  parentId: z.string().uuid().optional(),
});