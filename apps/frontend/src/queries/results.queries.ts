/**
 * Results React Query Hooks
 * All results related queries and mutations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getCandidateResultService,
  listResultsService,
  toggleNextRoundSelectionService,
  recalculateRanksService,
} from '@/api/results.api'
import type {
  CandidateResult,
  ListResultsParams,
  PaginatedResultsResponse,
} from '@/types/result.types'

/**
 * Query keys factory for results
 */
export const resultsKeys = {
  all: ['results'] as const,
  candidate: (submissionId: string) =>
    [...resultsKeys.all, 'candidate', submissionId] as const,
  admin: (params?: ListResultsParams) =>
    [...resultsKeys.all, 'admin', params] as const,
}

/**
 * useCandidateResult - Fetch candidate result
 * Results don't change frequently, use staleTime to reduce refetches
 */
export function useCandidateResult(submissionId: string | undefined) {
  return useQuery<CandidateResult, Error>({
    queryKey: resultsKeys.candidate(submissionId || ''),
    queryFn: () => {
      if (!submissionId) throw new Error('Submission ID is required')
      return getCandidateResultService(submissionId)
    },
    enabled: !!submissionId,
    staleTime: 2 * 60 * 1000, // 2 minutes - results are relatively stable
    gcTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * useAdminResults - Fetch admin results list with filters
 * Results list changes more frequently, shorter staleTime
 */
export function useAdminResults(params?: ListResultsParams) {
  return useQuery<PaginatedResultsResponse, Error>({
    queryKey: resultsKeys.admin(params),
    queryFn: () => listResultsService(params),
    staleTime: 30 * 1000, // 30 seconds - results list may change
    gcTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * useToggleNextRound - Toggle next round selection mutation
 */
export function useToggleNextRound() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      submissionId,
      selected,
    }: {
      submissionId: string
      selected: boolean
    }) => toggleNextRoundSelectionService(submissionId, selected),
    onSuccess: (_, variables) => {
      // Invalidate admin results list to refetch
      queryClient.invalidateQueries({
        queryKey: resultsKeys.admin(),
      })
      // Also invalidate specific candidate result if viewing it
      queryClient.invalidateQueries({
        queryKey: resultsKeys.candidate(variables.submissionId),
      })
    },
  })
}

/**
 * useRecalculateRanks - Recalculate ranks mutation
 */
export function useRecalculateRanks() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (examId: string) => recalculateRanksService(examId),
    onSuccess: () => {
      // Invalidate all admin results to refetch with new ranks
      queryClient.invalidateQueries({
        queryKey: resultsKeys.admin(),
      })
    },
  })
}

