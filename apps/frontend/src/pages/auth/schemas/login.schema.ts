import { z } from 'zod'
import { TEXT } from '@/constants'

/**
 * Login form validation schema
 * Centralized error messages for maintainability and reusability
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, TEXT.ERRORS.EMAIL_REQUIRED)
    .email(TEXT.ERRORS.EMAIL_INVALID),
  password: z
    .string()
    .min(1, TEXT.ERRORS.PASSWORD_REQUIRED)
    .min(8, TEXT.ERRORS.PASSWORD_MIN_LENGTH),
})

export type LoginFormValues = z.infer<typeof loginSchema>

