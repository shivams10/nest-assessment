import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

const fetchInterviewerCalendarStatus = async (): Promise<{ connected: boolean }> => {
  const { data } = await api.get<{ connected: boolean }>('/calendar/interviewer/status')
  return data
}

export const useInterviewerCalendarStatus = () =>
  useQuery({
    queryKey: ['interviewerCalendarStatus'],
    queryFn:  fetchInterviewerCalendarStatus,
  })
