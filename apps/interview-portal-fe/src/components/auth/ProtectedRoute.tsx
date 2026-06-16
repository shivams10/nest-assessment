import { Navigate, Outlet } from 'react-router-dom'

import { ROUTES } from '@/constants/routes'
import { isAuthenticated, tokenStorage } from '@/lib/token'

export const ProtectedRoute = () => {
  if (!isAuthenticated()) {
    tokenStorage.clearAll()
    return <Navigate to={ROUTES.LOGIN} replace />
  }
  return <Outlet />
}
