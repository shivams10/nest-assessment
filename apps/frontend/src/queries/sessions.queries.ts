/**
 * Sessions React Query Hooks
 * All session-related queries and mutations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  listSessionsService,
  createSessionService,
} from '@/api/sessions.api'
import type {
  RecruitmentSession,
  CreateSessionRequest,
  ListSessionsParams,
  ListSessionsResponse,
} from '@/types/session.types'
import { ROUTES } from '@/constants'

/**
 * Query keys factory for sessions
 */
export const sessionsKeys = {
  all: ['sessions'] as const,
  list: (params?: ListSessionsParams) => [...sessionsKeys.all, 'list', params] as const,
}

/**
 * useSessions - Fetch list of recruitment sessions
 */
export function useSessions(params?: ListSessionsParams) {
  return useQuery<ListSessionsResponse, Error>({
    queryKey: sessionsKeys.list(params),
    queryFn: () => listSessionsService(params),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * useCreateSession - Create recruitment session mutation
 */
export function useCreateSession() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation<RecruitmentSession, Error, CreateSessionRequest>({
    mutationFn: createSessionService,
    onSuccess: () => {
      // Invalidate sessions list
      queryClient.invalidateQueries({ queryKey: sessionsKeys.all })
      // Navigate back to sessions list
      navigate(ROUTES.ADMIN_SESSIONS)
    },
  })
}
