import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  loginService,
  loginWithExamPasswordService,
  type LoginRequest,
  type LoginWithExamPasswordRequest,
} from '@/services/auth.service'
import { setAuthToken } from '@/lib/auth'
import { getRedirectRouteByRole } from '@/lib/auth-redirect'
import { ROUTES } from '@/constants'

/**
 * useLogin - React Query hook for login mutation (staff: admin/moderator)
 */
export function useLogin() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (credentials: LoginRequest) => loginService(credentials),
    onSuccess: ({ accessToken }) => {
      setAuthToken(accessToken)
      const redirectRoute = getRedirectRouteByRole()
      navigate(redirectRoute, { replace: true })
    },
  })
}

/**
 * useLoginWithExamPassword - Student login with exam master password.
 * On success, stores token and redirects to that exam's start page.
 */
export function useLoginWithExamPassword() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data: LoginWithExamPasswordRequest) =>
      loginWithExamPasswordService(data),
    onSuccess: ({ accessToken, examId }) => {
      setAuthToken(accessToken)
      navigate(
        ROUTES.CANDIDATE_EXAM_START.replace(':examId', examId),
        { replace: true },
      )
    },
  })
}

