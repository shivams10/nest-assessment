import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAppSelector } from '@/store/hooks'
import { getRedirectRouteByRole } from '@/lib/auth-redirect'

/**
 * AuthGuard - Prevents accessing public routes (like /login) when already authenticated
 * Redirects authenticated users to their role-based dashboard
 * Renders child routes via Outlet if user is not authenticated
 *
 * Usage:
 * Use as route element with children routes
 */
export function AuthGuard() {
  const location = useLocation()
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)

  // If user is already authenticated, redirect to their role-based route
  if (isAuthenticated) {
    const redirectRoute = getRedirectRouteByRole()
    return <Navigate to={redirectRoute} state={{ from: location }} replace />
  }

  // Render child routes if user is not authenticated
  return <Outlet />
}

