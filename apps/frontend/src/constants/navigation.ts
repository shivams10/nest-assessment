import { ROUTES } from './routes'
import { ROLES, ADMIN_ROLES, type UserRole } from './roles'
import { TEXT } from './text'

/**
 * Navigation item configuration
 */
export interface NavigationItem {
  label: string
  path: string
  /**
   * Roles that can see this navigation item
   * If empty array, all authenticated users can see it
   */
  allowedRoles?: UserRole[]
  icon?: React.ReactNode
}

/**
 * Admin navigation configuration
 * Single source of truth for admin sidebar navigation
 */
export const ADMIN_NAVIGATION: NavigationItem[] = [
  {
    label: TEXT.ADMIN.NAVIGATION.DASHBOARD,
    path: ROUTES.ADMIN,
    allowedRoles: ADMIN_ROLES,
  },
  {
    label: TEXT.ADMIN.NAVIGATION.EXAMS,
    path: ROUTES.ADMIN_EXAMS,
    allowedRoles: ADMIN_ROLES,
  },
  {
    label: TEXT.ADMIN.NAVIGATION.CANDIDATES,
    path: `${ROUTES.ADMIN}/candidates`,
    allowedRoles: ADMIN_ROLES,
  },
  {
    label: TEXT.ADMIN.NAVIGATION.RESULTS,
    path: ROUTES.ADMIN_RESULTS,
    allowedRoles: ADMIN_ROLES,
  },
  {
    label: TEXT.ADMIN.NAVIGATION.ANALYTICS,
    path: ROUTES.ADMIN_ANALYTICS,
    allowedRoles: ADMIN_ROLES,
  },
  {
    label: TEXT.ADMIN.NAVIGATION.SESSIONS,
    path: ROUTES.ADMIN_SESSIONS,
    allowedRoles: ADMIN_ROLES,
  },
  {
    label: TEXT.ADMIN.NAVIGATION.USERS,
    path: ROUTES.ADMIN_USERS,
    allowedRoles: [ROLES.ADMIN], // Admin only
  },
]

