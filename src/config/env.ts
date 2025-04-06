import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),
  DATABASE_URL: z.string().url(),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  JWT_SECRET: z.string(),
  RATE_LIMIT_WINDOW_MS: z.string().default('900000'), // 15 minutos
  RATE_LIMIT_MAX: z.string().default('100'), // 100 solicitudes por ventana
});

type Env = z.infer<typeof envSchema>;

export const ENV: Env = envSchema.parse(process.env);