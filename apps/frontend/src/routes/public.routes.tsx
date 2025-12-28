import type { RouteObject } from 'react-router-dom'
import { ROUTES, TEXT } from '@/constants'

/**
 * Public routes - accessible without authentication
 */
export const publicRoutes: RouteObject[] = [
  {
    path: ROUTES.LOGIN,
    lazy: async () => {
      // Placeholder for login page
      const LoginPage = () => <div>{TEXT.PLACEHOLDERS.LOGIN_PAGE}</div>
      return { Component: LoginPage }
    },
  },
]

