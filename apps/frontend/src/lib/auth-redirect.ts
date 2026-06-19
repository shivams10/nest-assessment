import { ROUTES, ROLES, ADMIN_ROLES, type UserRole } from '@/constants'
import { getAuthRole } from './auth'

/**
 * Gets the redirect route based on user role
 * - admin → /admin
 * - moderator → /admin
 * - candidate → /candidate
 * - default → / (home)
 *
 * @returns Route path string
 */
export function getRedirectRouteByRole(): string {
  const role = getAuthRole()

  if (role && ADMIN_ROLES.includes(role as UserRole)) {
    return ROUTES.ADMIN
  }
  if (role === ROLES.CANDIDATE) {
    return ROUTES.CANDIDATE
  }

  return ROUTES.HOME
}

