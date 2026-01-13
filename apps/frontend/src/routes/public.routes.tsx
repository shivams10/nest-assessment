import type { RouteObject } from 'react-router-dom'
import { ROUTES, TEXT } from '@/constants'
import { AuthGuard } from './AuthGuard'
import { ErrorPage } from '@/pages/ErrorPage'

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
  {
    path: ROUTES.OAUTH_CALLBACK,
    errorElement: <ErrorPage />,
    lazy: async () => {
      const { OAuthCallbackPage } = await import('@/pages/auth/OAuthCallbackPage')
      return { Component: OAuthCallbackPage }
    },
  },
  {
    path: ROUTES.UNAUTHORIZED,
    lazy: async () => {
      const UnauthorizedPage = () => (
        <div className="flex min-h-screen items-center justify-center p-4 overflow-x-hidden">
          <div className="text-center max-w-md mx-auto">
            <h1 className="text-2xl sm:text-3xl font-bold">
              {TEXT.ADMIN.UNAUTHORIZED_TITLE}
            </h1>
            <p className="mt-4 text-sm sm:text-base text-muted-foreground">
              {TEXT.ADMIN.UNAUTHORIZED_MESSAGE}
            </p>
          </div>
        </div>
      )
      return { Component: UnauthorizedPage }
    },
  },
]

