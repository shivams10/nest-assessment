import { useQuery } from '@tanstack/react-query'
import {
  listExamsService,
  type ListExamsParams,
} from '@/services/exams.service'

/**
 * useExams - React Query hook for listing exams
 * Exams list doesn't change frequently, use staleTime
 */
export function useExams(params?: ListExamsParams, isAdmin = false) {
  return useQuery({
    queryKey: ['exams', isAdmin ? 'admin' : 'candidate', params],
    queryFn: () => listExamsService(params, isAdmin),
    staleTime: 2 * 60 * 1000, // 2 minutes - exams list is relatively stable
    gcTime: 5 * 60 * 1000, // 5 minutes
  })
}

