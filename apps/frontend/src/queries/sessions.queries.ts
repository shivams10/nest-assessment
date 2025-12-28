/**
 * Sessions React Query Hooks
 * All session-related queries and mutations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  listSessionsService,
  createSessionService,
  updateSessionService,
  deleteSessionService,
  getSessionService,
} from '@/api/sessions.api'
import type {
  RecruitmentSession,
  CreateSessionRequest,
  UpdateSessionRequest,
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
  detail: (id: string) => [...sessionsKeys.all, 'detail', id] as const,
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

/**
 * useSession - Fetch single session by ID
 */
export function useSession(id: string | undefined) {
  return useQuery<RecruitmentSession, Error>({
    queryKey: sessionsKeys.detail(id || ''),
    queryFn: () => {
      if (!id) throw new Error('Session ID is required')
      return getSessionService(id)
    },
    enabled: !!id,
    staleTime: 30 * 1000,
    gcTime: 2 * 60 * 1000,
  })
}

/**
 * useUpdateSession - Update session mutation
 */
export function useUpdateSession() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation<
    RecruitmentSession,
    Error,
    { id: string; data: UpdateSessionRequest }
  >({
    mutationFn: ({ id, data }) => updateSessionService(id, data),
    onSuccess: (_, variables) => {
      // Invalidate sessions list and detail
      queryClient.invalidateQueries({ queryKey: sessionsKeys.all })
      queryClient.invalidateQueries({
        queryKey: sessionsKeys.detail(variables.id),
      })
      // Navigate back to sessions list
      navigate(ROUTES.ADMIN_SESSIONS)
    },
  })
}

/**
 * useDeleteSession - Delete session mutation
 */
export function useDeleteSession() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: deleteSessionService,
    onSuccess: () => {
      // Invalidate sessions list
      queryClient.invalidateQueries({ queryKey: sessionsKeys.all })
    },
  })
}
