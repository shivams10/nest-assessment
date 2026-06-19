import { useLayoutEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setAccessToken } from '@/store/slices/auth.slice'
import { ROUTES, RECRUITER_ROUTES } from '@/constants'
import { LoadingState } from '@/components/shared/LoadingState'
import { ErrorState } from '@/components/shared/ErrorState'
import { decodeJWT, getRoleFromToken } from '@/lib/jwt'

/**
 * OAuthCallbackPage - Handles OAuth callback from Google
 * Route: /auth/callback
 * 
 * Behavior:
 * - Reads token body from URL query params (split token pattern for security)
 * - Reconstructs token by combining body with signature from cookies
 * - Validates token and dispatches to Redux
 * - Redirects based on user role
 * - Clears token from URL for security
 */
export function OAuthCallbackPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
  const [error, setError] = useState<string | null>(null)
  const [hasProcessed, setHasProcessed] = useState(false)

  useLayoutEffect(() => {
    // Prevent multiple executions
    if (hasProcessed) return

    const errorParam = searchParams.get('error')

    // Check for error first
    if (errorParam) {
      setError(errorParam === 'authentication_failed' ? 'Authentication failed. Please try again.' : decodeURIComponent(errorParam))
      setSearchParams({}, { replace: true })
      setHasProcessed(true)
      return
    }

    // Get token body from query param (backend sends split token for security)
    const accessBody = searchParams.get('access')
    const roleParam = searchParams.get('role')

    // Validate token body presence
    if (!accessBody) {
      setError('No authentication token received. Please try again.')
      setHasProcessed(true)
      return
    }

    try {
      // Get signature from cookie set by backend
      const accessSig = document.cookie
        .split('; ')
        .find((row) => row.startsWith('ip_access_sig='))
        ?.substring('ip_access_sig='.length) || ''

      // Reconstruct full access token by combining body + signature
      const token = `${accessBody}.${accessSig}`

      // Decode token to validate
      const decoded = decodeJWT(token)
      
      if (!decoded) {
        setError('Invalid token received. Please try again.')
        setHasProcessed(true)
        return
      }

      // Get role from query param (backend sends it for convenience)
      // Falls back to extracting from token if param missing
      const role = roleParam || getRoleFromToken(token)

      if (!role) {
        setError('Invalid token: missing role. Please try again.')
        setHasProcessed(true)
        return
      }

      // Use setAccessToken for OAuth (trusts server, similar to refresh flow)
      // This ensures the token is set even if expiration check fails
      dispatch(setAccessToken(token))

      // Clear token from URL for security
      setSearchParams({}, { replace: true })
      setHasProcessed(true)

      // Redirect based on role (Redux state update is synchronous)
      if (role === 'admin' || role === 'moderator') {
        navigate(ROUTES.ADMIN, { replace: true })
      } else if (role === 'candidate') {
        navigate(ROUTES.CANDIDATE_EXAMS, { replace: true })
      } else if (role === 'recruiter') {
        navigate(RECRUITER_ROUTES.RECRUITER, { replace: true })
      } else {
        setError('Unknown user role. Please contact support.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process authentication. Please try again.')
      setSearchParams({}, { replace: true })
      setHasProcessed(true)
    }
  }, [searchParams, dispatch, navigate, setSearchParams, hasProcessed, isAuthenticated])

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <ErrorState
          message={error}
          onRetry={() => navigate(ROUTES.LOGIN)}
        />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <LoadingState message="Completing authentication..." />
    </div>
  )
}

