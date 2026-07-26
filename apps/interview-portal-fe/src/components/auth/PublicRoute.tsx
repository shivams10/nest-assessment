import { Navigate, Outlet } from 'react-router-dom'

import { ROLE_REDIRECT, ROUTES } from '@/constants/routes'
import { accessTokenStore, decodeToken, isAuthenticated } from '@/lib/token'

export const PublicRoute = () => {
  if (isAuthenticated()) {
    const token   = accessTokenStore.get()
    const payload = token ? decodeToken(token) : null
    const dest    = payload?.role ? (ROLE_REDIRECT[payload.role] ?? null) : null
    return <Navigate to={dest ?? ROUTES.LOGIN} replace />
  }
  return <Outlet />
}
