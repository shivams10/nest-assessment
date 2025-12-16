import { z } from 'zod';

const jwtDurationRegex = /^\d+(s|m|h|d)$/;

export const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(1),
  JWT_ACCESS_EXPIRES_IN: z.string().regex(jwtDurationRegex),
  JWT_REFRESH_SECRET: z.string().min(1),
  JWT_REFRESH_EXPIRES_IN: z.string().regex(jwtDurationRegex),
});
