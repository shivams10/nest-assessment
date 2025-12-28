import { useQuery } from '@tanstack/react-query'
import {
  listExamsService,
  type ListExamsParams,
} from '@/services/exams.service'

/**
 * useExams - React Query hook for listing exams
 */
export function useExams(params?: ListExamsParams, isAdmin = false) {
  return useQuery({
    queryKey: ['exams', isAdmin ? 'admin' : 'candidate', params],
    queryFn: () => listExamsService(params, isAdmin),
  })
}

