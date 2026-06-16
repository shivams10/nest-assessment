import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export type CurrentUser = {
  id:        string
  email:     string
  firstName: string | null
  lastName:  string | null
  role:      string
}

const fetchCurrentUser = async (): Promise<CurrentUser> => {
  const { data } = await api.get<CurrentUser>('/auth/me')
  return data
}

export const useCurrentUser = () =>
  useQuery({
    queryKey: ['currentUser'],
    queryFn:  fetchCurrentUser,
    staleTime: 5 * 60 * 1000, // 5 min — re-fetch if token refreshes
    retry: false,
  })
