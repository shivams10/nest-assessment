import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAppSelector } from '@/store/hooks'
import { ROUTES, ROLES } from '@/constants'

/**
 * CandidateGuard - Route-level guard for candidate access
 * - Redirects to /login if not authenticated
 * - Redirects to /unauthorized if role is not candidate
 * - Renders child routes via Outlet if access is granted
 */
export function CandidateGuard() {
  const location = useLocation()
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
  const userRole = useAppSelector((state) => state.auth.role)

  // Check authentication first
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />
  }

  // Check if user has candidate role
  if (!userRole || userRole !== ROLES.CANDIDATE) {
    return <Navigate to={ROUTES.UNAUTHORIZED} replace />
  }

  return <Outlet />
}

