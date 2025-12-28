/**
 * User Role Constants
 * Single source of truth for user roles
 * Matches backend UserRole enum
 */

export const ROLES = {
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  CANDIDATE: 'candidate',
} as const

/**
 * Type for user roles
 */
export type UserRole = (typeof ROLES)[keyof typeof ROLES]

/**
 * Array of all admin roles (admin and moderator)
 */
export const ADMIN_ROLES: UserRole[] = [ROLES.ADMIN, ROLES.MODERATOR]

/**
 * Array of all roles
 */
export const ALL_ROLES: UserRole[] = [
  ROLES.ADMIN,
  ROLES.MODERATOR,
  ROLES.CANDIDATE,
]

