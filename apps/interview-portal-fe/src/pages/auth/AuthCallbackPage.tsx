import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { ROLE_REDIRECT, ROUTES } from '@/constants/routes'
import { decodeToken, tokenStorage } from '@/lib/token'

const KNOWN_ERRORS = [
  'not_registered',
  'deactivated',
  'wrong_domain',
  'authentication_failed',
  'access_denied',
]

const toErrorKey = (raw: string): string =>
  KNOWN_ERRORS.includes(raw) ? raw : 'auth_failed'

export const AuthCallbackPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    const error = searchParams.get('error')

    if (error) {
      void navigate(
        `${ROUTES.LOGIN}?error=${toErrorKey(decodeURIComponent(error))}`,
        { replace: true },
      )
      return
    }

    // Server sets ip_access_sig + ip_refresh_sig cookies.
    // FE receives only the header.payload bodies in the URL.
    const accessBody  = searchParams.get('access')
    const refreshBody = searchParams.get('refresh')
    const roleParam   = searchParams.get('role')

    if (!accessBody || !refreshBody) {
      void navigate(`${ROUTES.LOGIN}?error=auth_failed`, { replace: true })
      return
    }

    // Decode role from the access body (works without the signature)
    const payload = decodeToken(decodeURIComponent(accessBody))
    const role    = roleParam ?? payload?.role ?? ''

    const destination = ROLE_REDIRECT[role]

    if (!destination) {
      tokenStorage.clearAll()
      void navigate(`${ROUTES.LOGIN}?error=not_registered`, { replace: true })
      return
    }

    tokenStorage.set(decodeURIComponent(accessBody), decodeURIComponent(refreshBody))

    void navigate(destination, { replace: true })
  }, [searchParams, navigate])

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-base">
      <div className="flex flex-col items-center gap-3">
        <div className="w-6 h-6 rounded-full border-2 border-brand border-t-transparent animate-spin" />
        <p className="text-content-secondary text-sm">Signing you in…</p>
      </div>
    </div>
  )
}
