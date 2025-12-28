import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { loginService, type LoginRequest } from '@/services/auth.service'
import { setAuthToken } from '@/lib/auth'
import { getRedirectRouteByRole } from '@/lib/auth-redirect'
import { TEXT } from '@/constants'

/**
 * useLogin - React Query hook for login mutation
 */
export function useLogin() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (credentials: LoginRequest) => loginService(credentials),
    onSuccess: ({ accessToken }) => {
      // Store accessToken in Redux (this also persists to localStorage and decodes JWT)
      setAuthToken(accessToken)

      // Redirect based on user role
      const redirectRoute = getRedirectRouteByRole()
      navigate(redirectRoute, { replace: true })
    },
  })
}

