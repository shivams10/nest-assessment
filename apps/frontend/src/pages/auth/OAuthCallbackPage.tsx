import { useLayoutEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setAccessToken } from '@/store/slices/auth.slice'
import { ROUTES } from '@/constants'
import { LoadingState } from '@/components/shared/LoadingState'
import { ErrorState } from '@/components/shared/ErrorState'
import { decodeJWT, getRoleFromToken } from '@/lib/jwt'

/**
 * OAuthCallbackPage - Handles OAuth callback from Google
 * Route: /auth/callback
 * 
 * Behavior:
 * - Reads token from URL query params
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

    const token = searchParams.get('token')
    const errorParam = searchParams.get('error')

    // Check for error first
    if (errorParam) {
      setError(errorParam === 'authentication_failed' ? 'Authentication failed. Please try again.' : decodeURIComponent(errorParam))
      setSearchParams({}, { replace: true })
      setHasProcessed(true)
      return
    }

    // Validate token presence
    if (!token) {
      setError('No authentication token received. Please try again.')
      setHasProcessed(true)
      return
    }

    try {
      // Decode token to get role
      const decoded = decodeJWT(token)
      
      if (!decoded) {
        setError('Invalid token received. Please try again.')
        setHasProcessed(true)
        return
      }

      const role = getRoleFromToken(token)

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

