import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'

export type CheckAvailabilityInput = {
  interviewerId:    string
  roomId?:          string
  scheduledAt:      string
  durationMinutes?: number
}

export type AvailabilityResult = {
  available: boolean
  reason?:   string
}

const checkAvailability = async (params: CheckAvailabilityInput): Promise<AvailabilityResult> => {
  const { data } = await api.get<AvailabilityResult>('/sessions/availability', { params })
  return data
}

export const useCheckAvailability = () =>
  useMutation({
    mutationFn: checkAvailability,
  })
