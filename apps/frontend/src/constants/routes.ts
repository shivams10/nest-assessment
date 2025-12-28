/**
 * Route Constants
 * All application routes should be defined here
 * Use these constants instead of hardcoding route paths
 */

export const ROUTES = {
  // Public routes
  LOGIN: '/login',
  
  // Protected routes
  HOME: '/',
  
  // Future routes (uncomment when needed)
  // ADMIN: '/admin',
  // PROFILE: '/profile',
  // SETTINGS: '/settings',
} as const

/**
 * Type for route paths
 */
export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES]

