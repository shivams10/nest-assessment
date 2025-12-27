import { Navigate } from 'react-router-dom'
import { useAppSelector } from '@/store/hooks'
import { ROUTES } from '@/constants'

interface RoleGuardProps {
  /**
   * Array of allowed roles - user must have one of these roles
   */
  allowedRoles: string[]
  /**
   * Component to render if user has required role
   */
  children: React.ReactNode
  /**
   * Optional redirect path when access is denied (defaults to ROUTES.HOME)
   */
  redirectTo?: string
}

/**
 * RoleGuard - Component-level role-based access control
 * Use this within route components to restrict access based on user role
 *
 * @example
 * ```tsx
 * <RoleGuard allowedRoles={['admin', 'moderator']}>
 *   <AdminPanel />
 * </RoleGuard>
 * ```
 */
export function RoleGuard({
  allowedRoles,
  children,
  redirectTo = ROUTES.HOME,
}: RoleGuardProps) {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
  const userRole = useAppSelector((state) => state.auth.role)

  // Must be authenticated
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  // Must have one of the allowed roles
  if (!userRole || !allowedRoles.includes(userRole)) {
    return <Navigate to={redirectTo} replace />
  }

  return <>{children}</>
}

