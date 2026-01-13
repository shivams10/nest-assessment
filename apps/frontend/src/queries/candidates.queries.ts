/**
 * Candidates React Query Hooks
 * All candidate management queries and mutations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  listCandidatesService,
  activateCandidateService,
  deactivateCandidateService,
  exportCandidatesService,
  assignCandidateSessionService,
  bulkAssignCandidatesService,
  type ListCandidatesParams,
  type PaginatedCandidatesResponse,
  type UserPublic,
  type AssignCandidateSessionRequest,
  type BulkAssignCandidatesRequest,
  type BulkAssignCandidatesResponse,
} from '@/api/candidates.api'

/**
 * Query keys factory for candidates
 */
export const candidatesKeys = {
  all: ['candidates'] as const,
  list: (params?: ListCandidatesParams) =>
    [...candidatesKeys.all, 'list', params] as const,
}

/**
 * useAdminCandidates - Fetch list of candidates for admin
 */
export function useAdminCandidates(params?: ListCandidatesParams) {
  return useQuery<PaginatedCandidatesResponse, Error>({
    queryKey: candidatesKeys.list(params),
    queryFn: () => listCandidatesService(params),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * useToggleCandidateActive - Toggle candidate active status with optimistic update
 */
export function useToggleCandidateActive() {
  const queryClient = useQueryClient()

  return useMutation<
    UserPublic,
    Error,
    { candidateId: string; isActive: boolean },
    { previousCandidates?: PaginatedCandidatesResponse }
  >({
    mutationFn: ({ candidateId, isActive }) =>
      isActive
        ? activateCandidateService(candidateId)
        : deactivateCandidateService(candidateId),
    onMutate: async ({ candidateId, isActive }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: candidatesKeys.all })

      // Snapshot previous value
      const queryKey = candidatesKeys.list({})
      const previousCandidates = queryClient.getQueryData<PaginatedCandidatesResponse>(
        queryKey,
      )

      // Optimistically update
      queryClient.setQueryData<PaginatedCandidatesResponse>(queryKey, (old) => {
        if (!old || !old.items) return old
        return {
          ...old,
          items: old.items.map((candidate) =>
            candidate.id === candidateId
              ? { ...candidate, isActive }
              : candidate,
          ),
        }
      })

      return { previousCandidates }
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousCandidates) {
        queryClient.setQueryData(
          candidatesKeys.list({}),
          context.previousCandidates,
        )
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: candidatesKeys.all })
    },
  })
}

/**
 * useExportCandidates - Export candidates as CSV mutation
 */
export function useExportCandidates() {
  return useMutation<Blob, Error, Omit<ListCandidatesParams, 'page' | 'limit'>>({
    mutationFn: (params) => exportCandidatesService(params),
  })
}

/**
 * useAssignCandidateSession - Assign candidate to session with optimistic update
 */
export function useAssignCandidateSession() {
  const queryClient = useQueryClient()

  return useMutation<
    UserPublic,
    Error,
    { candidateId: string; data: AssignCandidateSessionRequest },
    { previousCandidates?: PaginatedCandidatesResponse }
  >({
    mutationFn: ({ candidateId, data }) =>
      assignCandidateSessionService(candidateId, data),
    onMutate: async ({ candidateId, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: candidatesKeys.all })

      // Snapshot previous value
      const queryKey = candidatesKeys.list({})
      const previousCandidates = queryClient.getQueryData<PaginatedCandidatesResponse>(
        queryKey,
      )

      // Optimistically update
      queryClient.setQueryData<PaginatedCandidatesResponse>(queryKey, (old) => {
        if (!old || !old.items) return old
        return {
          ...old,
          items: old.items.map((candidate) =>
            candidate.id === candidateId
              ? {
                  ...candidate,
                  collegeSessionId: data.collegeSessionId,
                  session: data.collegeSessionId
                    ? {
                        id: data.collegeSessionId,
                        name: '', // Will be filled on refetch
                        status: '',
                      }
                    : null,
                }
              : candidate,
          ),
        }
      })

      return { previousCandidates }
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousCandidates) {
        queryClient.setQueryData(
          candidatesKeys.list({}),
          context.previousCandidates,
        )
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: candidatesKeys.all })
    },
  })
}

/**
 * useBulkAssignCandidates - Bulk assign candidates to session
 */
export function useBulkAssignCandidates() {
  const queryClient = useQueryClient()

  return useMutation<BulkAssignCandidatesResponse, Error, BulkAssignCandidatesRequest>(
    {
      mutationFn: (data) => bulkAssignCandidatesService(data),
      onSuccess: () => {
        // Invalidate candidates list to refetch with updated session assignments
        queryClient.invalidateQueries({ queryKey: candidatesKeys.all })
      },
    },
  )
}

