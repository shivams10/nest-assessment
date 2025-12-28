import { ROUTES } from '@/constants'
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

  switch (role) {
    case 'admin':
    case 'moderator':
      return ROUTES.ADMIN
    case 'candidate':
      return ROUTES.CANDIDATE
    default:
      return ROUTES.HOME
  }
}

