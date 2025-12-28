/**
 * @deprecated Use services and React Query hooks instead
 * This file is kept for backward compatibility and type exports
 * 
 * Migration path:
 * - Use useLogin() hook from @/hooks/queries/useAuth instead of login()
 * - Use refreshTokenService() from @/services/auth.service (internal use only)
 */

// Re-export types for backward compatibility
export type {
  LoginRequest,
  LoginResponse,
  RefreshTokenResponse,
  ApiErrorResponse,
} from '@/services/auth.service'

// Re-export services for backward compatibility (if needed)
export { loginService as login, refreshTokenService as refreshToken } from '@/services/auth.service'

