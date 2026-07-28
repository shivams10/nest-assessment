import { z } from 'zod';

const jwtDurationRegex = /^\d+(s|m|h|d)$/;

export const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(1),
  JWT_ACCESS_EXPIRES_IN: z.string().regex(jwtDurationRegex),
  JWT_REFRESH_SECRET: z.string().min(1),
  JWT_REFRESH_EXPIRES_IN: z.string().regex(jwtDurationRegex),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CALLBACK_URL: z.string().optional(),
  FRONTEND_URL: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().optional(),
  OPENAI_MAX_TOKENS: z.string().optional(),
  RESUME_UPLOAD_DIR: z.string().optional(),
  GOOGLE_CALENDAR_CALLBACK_URL: z.string().optional(),
  GOOGLE_INTERVIEWER_CALENDAR_CALLBACK_URL: z.string().optional(),
});
