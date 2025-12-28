import type { RouteObject } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { ROUTES, TEXT } from '@/constants'

/**
 * Protected routes - require authentication
 * 
 * To add role-based protection, use the allowedRoles prop:
 * 
 * @example
 * {
 *   element: <ProtectedRoute allowedRoles={['admin']} />,
 *   children: [...]
 * }
 */
export const protectedRoutes: RouteObject[] = [
  {
    // Base protected route - requires authentication only
    element: <ProtectedRoute />,
    children: [
      {
        path: ROUTES.HOME,
        lazy: async () => {
          // Placeholder for home page
          const HomePage = () => <div>{TEXT.PLACEHOLDERS.HOME_PAGE}</div>
          return { Component: HomePage }
        },
      },
      // Add more protected routes here
      // Example with role protection (commented out):
      // {
      //   element: <ProtectedRoute allowedRoles={['admin']} />,
      //   children: [
      //     {
      //       path: ROUTES.ADMIN,
      //       lazy: async () => ({ Component: AdminPage })
      //     }
      //   ]
      // }
    ],
  },
]

