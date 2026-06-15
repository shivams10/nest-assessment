import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { ROUTES } from '@/constants/routes'
import { decodeToken, tokenStorage } from '@/lib/token'

const ROLE_REDIRECT: Record<string, string> = {
  recruiter:   ROUTES.RECRUITER_DASHBOARD,
  interviewer: ROUTES.INTERVIEWER_DASHBOARD,
  admin:       ROUTES.RECRUITER_DASHBOARD,
}

const toErrorKey = (raw: string): string => {
  const known = [
    'not_registered',
    'deactivated',
    'wrong_domain',
    'authentication_failed',
    'access_denied',
  ]
  return known.includes(raw) ? raw : 'auth_failed'
}

export const AuthCallbackPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    const token = searchParams.get('token')
    const error = searchParams.get('error')

    if (error) {
      void navigate(`${ROUTES.LOGIN}?error=${toErrorKey(decodeURIComponent(error))}`, { replace: true })
      return
    }

    if (!token) {
      void navigate(`${ROUTES.LOGIN}?error=auth_failed`, { replace: true })
      return
    }

    const payload = decodeToken(token)

    if (!payload) {
      void navigate(`${ROUTES.LOGIN}?error=invalid_token`, { replace: true })
      return
    }

    const destination = ROLE_REDIRECT[payload.role]

    if (!destination) {
      tokenStorage.clear()
      void navigate(`${ROUTES.LOGIN}?error=not_registered`, { replace: true })
      return
    }

    tokenStorage.set(token)
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
