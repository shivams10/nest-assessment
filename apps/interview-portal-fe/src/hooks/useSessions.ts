import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export type InterviewSessionStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled'

export type InterviewSession = {
  id:                    string
  candidateId:           string
  interviewerId:         string
  scheduledById:         string
  roomId:                string | null
  scheduledAt:           string
  durationMinutes:       number
  meetLink:              string | null
  googleCalendarEventId: string | null
  status:                InterviewSessionStatus
  createdAt:             string
  updatedAt:             string
  candidate: {
    id:              string
    name:            string
    email:           string
    roleApplyingFor: string
  }
  interviewer: {
    id:        string
    firstName: string | null
    lastName:  string | null
    email:     string
  }
  room: {
    id:   string
    name: string
  } | null
}

const fetchSessions = async (): Promise<InterviewSession[]> => {
  const { data } = await api.get<InterviewSession[]>('/sessions')
  return data
}

export const useSessions = () =>
  useQuery({
    queryKey: ['sessions'],
    queryFn:  fetchSessions,
  })
