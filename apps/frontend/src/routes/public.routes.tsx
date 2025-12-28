import type { RouteObject } from 'react-router-dom'
import { ROUTES } from '@/constants'
import { AuthGuard } from './AuthGuard'

/**
 * Public routes - accessible without authentication
 * AuthGuard prevents authenticated users from accessing these routes
 */
export const publicRoutes: RouteObject[] = [
  {
    element: <AuthGuard />,
    children: [
      {
        path: ROUTES.LOGIN,
        lazy: async () => {
          const { default: LoginPage } = await import('@/pages/auth/login')
          return { Component: LoginPage }
        },
      },
    ],
  },
]

