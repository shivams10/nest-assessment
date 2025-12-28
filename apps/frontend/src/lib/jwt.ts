/**
 * JWT Helper Utilities
 * Safely decode and parse JWT tokens
 */

interface JWTPayload {
  exp?: number
  iat?: number
  sub?: string
  role?: string
  email?: string
  [key: string]: unknown
}

/**
 * Safely decodes a JWT token without verification
 * @param token - The JWT token string
 * @returns Decoded payload or null if invalid
 */
export function decodeJWT(token: string): JWTPayload | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      return null
    }

    const payload = parts[1]
    if (!payload) {
      return null
    }

    // Decode base64url
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join('')
    )

    return JSON.parse(jsonPayload) as JWTPayload
  } catch (error) {
    console.error('Failed to decode JWT:', error)
    return null
  }
}

/**
 * Checks if a JWT token is expired
 * @param token - The JWT token string
 * @returns true if token is expired or invalid, false otherwise
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeJWT(token)
  if (!payload || !payload.exp) {
    return true
  }

  // exp is in seconds, Date.now() is in milliseconds
  const expirationTime = payload.exp * 1000
  return Date.now() >= expirationTime
}

/**
 * Extracts role from JWT token
 * @param token - The JWT token string
 * @returns Role string or null if not found
 */
export function getRoleFromToken(token: string): string | null {
  const payload = decodeJWT(token)
  return (payload?.role as string) || null
}

/**
 * Extracts user ID from JWT token
 * @param token - The JWT token string
 * @returns User ID string or null if not found
 */
export function getUserIdFromToken(token: string): string | null {
  const payload = decodeJWT(token)
  return (payload?.sub as string) || null
}

/**
 * Extracts email from JWT token
 * @param token - The JWT token string
 * @returns Email string or null if not found
 */
export function getEmailFromToken(token: string): string | null {
  const payload = decodeJWT(token)
  return (payload?.email as string) || null
}
