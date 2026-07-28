import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { InterviewSession } from './useSessions'

export type CreateSessionInput = {
  candidateId:      string
  interviewerId:    string
  roomId?:          string
  scheduledAt:      string
  durationMinutes?: number
}

const createSession = async (input: CreateSessionInput): Promise<InterviewSession> => {
  const { data } = await api.post<InterviewSession>('/sessions', input)
  return data
}

export const useCreateSession = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      queryClient.invalidateQueries({ queryKey: ['candidates'] })
    },
  })
}
