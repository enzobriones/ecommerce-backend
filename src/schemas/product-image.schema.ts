import { z } from "zod";

export const createImageSchema = z.object({
  url: z.string().url(),
  isMain: z.boolean().default(false),
});

export const updateImageSchema = z.object({
  url: z.string().url().optional(),
  isMain: z.boolean().optional(),
});
