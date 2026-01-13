/**
 * Session Candidates React Query Hooks
 * All session candidate management queries and mutations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  bulkAssignCandidatesToSessionService,
  assignCandidateToSessionService,
  getSessionCandidatesService,
  getUnassignedCandidatesService,
  type BulkAssignCsvResponse,
  type SessionCandidate,
  type PaginatedSessionCandidatesResponse,
} from '@/api/sessionCandidates.api'

/**
 * Query Keys
 */
export const sessionCandidatesKeys = {
  all: ['sessionCandidates'] as const,
  session: (sessionId: string) => [...sessionCandidatesKeys.all, 'session', sessionId] as const,
  sessionList: (sessionId: string, params?: { page?: number; limit?: number }) =>
    [...sessionCandidatesKeys.session(sessionId), 'list', params] as const,
  unassigned: (params?: { page?: number; limit?: number }) =>
    [...sessionCandidatesKeys.all, 'unassigned', params] as const,
}

/**
 * useSessionCandidates - Fetch candidates for a session
 */
export function useSessionCandidates(
  sessionId: string | undefined,
  params?: { page?: number; limit?: number },
) {
  return useQuery<PaginatedSessionCandidatesResponse, Error>({
    queryKey: sessionCandidatesKeys.sessionList(sessionId || '', params),
    queryFn: () => {
      if (!sessionId) throw new Error('Session ID is required')
      return getSessionCandidatesService(sessionId, params)
    },
    enabled: !!sessionId,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * useUnassignedCandidates - Fetch unassigned candidates
 */
export function useUnassignedCandidates(params?: { page?: number; limit?: number }) {
  return useQuery<PaginatedSessionCandidatesResponse, Error>({
    queryKey: sessionCandidatesKeys.unassigned(params),
    queryFn: () => getUnassignedCandidatesService(params),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * useBulkAssignCandidatesToSession - Bulk assign candidates via CSV
 */
export function useBulkAssignCandidatesToSession() {
  const queryClient = useQueryClient()

  return useMutation<BulkAssignCsvResponse, Error, { sessionId: string; file: File }>({
    mutationFn: ({ sessionId, file }) => bulkAssignCandidatesToSessionService(sessionId, file),
    onSuccess: (_data, variables) => {
      // Invalidate session candidates list
      queryClient.invalidateQueries({
        queryKey: sessionCandidatesKeys.session(variables.sessionId),
      })
      // Invalidate unassigned candidates
      queryClient.invalidateQueries({
        queryKey: sessionCandidatesKeys.unassigned(),
      })
      // Invalidate admin candidates list
      queryClient.invalidateQueries({
        queryKey: ['candidates'],
      })

      // Query invalidation will update UI automatically
      // If errors occurred, the error CSV URL is in data.errors
    },
  })
}

/**
 * useAssignCandidateToSession - Manually assign candidate to session
 */
export function useAssignCandidateToSession() {
  const queryClient = useQueryClient()

  return useMutation<
    SessionCandidate,
    Error,
    { sessionId: string; candidateId: string }
  >({
    mutationFn: ({ sessionId, candidateId }) =>
      assignCandidateToSessionService(sessionId, candidateId),
    onSuccess: (_data, variables) => {
      // Invalidate session candidates list
      queryClient.invalidateQueries({
        queryKey: sessionCandidatesKeys.session(variables.sessionId),
      })
      // Invalidate unassigned candidates
      queryClient.invalidateQueries({
        queryKey: sessionCandidatesKeys.unassigned(),
      })
      // Invalidate admin candidates list
      queryClient.invalidateQueries({
        queryKey: ['candidates'],
      })

      // Query invalidation will update UI automatically
    },
  })
}

