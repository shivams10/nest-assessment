import { useQuery } from '@tanstack/react-query'
import {
  listUsersService,
  listResultsService,
  type ListUsersParams,
  type ListResultsParams,
} from '@/services/admin.service'

/**
 * useUsers - React Query hook for listing users
 */
export function useUsers(params?: ListUsersParams) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => listUsersService(params),
  })
}

/**
 * useResults - React Query hook for listing results
 */
export function useResults(params?: ListResultsParams) {
  return useQuery({
    queryKey: ['results', params],
    queryFn: () => listResultsService(params),
  })
}

