import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { ROUTES } from '@/constants/routes'
import { tokenStorage } from '@/lib/token'

export const useLogout = () => {
  const navigate    = useNavigate()
  const queryClient = useQueryClient()

  return () => {
    tokenStorage.clearAll()
    queryClient.clear()
    void navigate(ROUTES.LOGIN, { replace: true })
  }
}
