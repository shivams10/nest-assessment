import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAppSelector } from '@/store/hooks'
import { ROUTES, ADMIN_ROLES, type UserRole } from '@/constants'

/**
 * AdminGuard - Route-level guard for admin/moderator access
 * - Redirects to /login if not authenticated
 * - Redirects to /unauthorized if role is not admin or moderator
 * - Renders child routes via Outlet if access is granted
 */
export function AdminGuard() {
  const location = useLocation()
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
  const userRole = useAppSelector((state) => state.auth.role)

  // Check authentication first
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />
  }

  // Check if user has admin or moderator role
  if (!userRole || !ADMIN_ROLES.includes(userRole as UserRole)) {
    return <Navigate to={ROUTES.UNAUTHORIZED} replace />
  }

  return <Outlet />
}

