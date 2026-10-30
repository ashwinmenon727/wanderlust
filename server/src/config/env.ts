import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000').transform((val) => parseInt(val, 10)),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().default('wanderlust_ultra_secure_jwt_token_secret_key_2026_luxury'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  RESEND_API_KEY: z.string().optional().default(''),
  ADMIN_NOTIFICATION_EMAIL: z.string().email().default('admin@wanderlust-luxury-travel.com'),
  FROM_EMAIL: z.string().default('concierge@wanderlust-luxury-travel.com'),
  INITIAL_ADMIN_EMAIL: z.string().email().default('admin@wanderlust.com'),
  INITIAL_ADMIN_PASSWORD: z.string().default('AdminPassword2026!'),
  INITIAL_ADMIN_NAME: z.string().default('Chief Travel Officer'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
