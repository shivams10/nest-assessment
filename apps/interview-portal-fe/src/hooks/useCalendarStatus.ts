import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

const fetchCalendarStatus = async (): Promise<{ connected: boolean }> => {
  const { data } = await api.get<{ connected: boolean }>('/calendar/status')
  return data
}

export const useCalendarStatus = () =>
  useQuery({
    queryKey: ['calendarStatus'],
    queryFn:  fetchCalendarStatus,
  })
