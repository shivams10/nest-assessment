import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAppSelector } from '@/store/hooks'
import { ROUTES } from '@/constants'

interface ProtectedRouteProps {
  /**
   * Optional array of allowed roles
   * If provided, user must have one of these roles to access
   * If not provided, any authenticated user can access
   */
  allowedRoles?: string[]
}

/**
 * ProtectedRoute - Layout component for protected routes
 * - Redirects to /login if user is not authenticated
 * - Optionally checks if user has required role(s)
 * - Renders child routes via Outlet if access is granted
 */
export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps = {}) {
  const location = useLocation()
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
  const userRole = useAppSelector((state) => state.auth.role)

  // Check authentication first
  if (!isAuthenticated) {
    // Save the attempted location for redirect after login
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />
  }

  // Check role if allowedRoles is specified
  if (allowedRoles && allowedRoles.length > 0) {
    if (!userRole || !allowedRoles.includes(userRole)) {
      // User doesn't have required role - redirect to home or show access denied
      // For now, redirect to home. Can be customized later
      return <Navigate to={ROUTES.HOME} replace />
    }
  }

  return <Outlet />
}
