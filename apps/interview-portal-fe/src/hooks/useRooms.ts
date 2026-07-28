import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export type Room = {
  id:            string
  name:          string
  resourceEmail: string
  location:      string | null
  capacity:      number
  isActive:      boolean
  createdAt:     string
}

const fetchRooms = async (): Promise<Room[]> => {
  const { data } = await api.get<Room[]>('/rooms')
  return data
}

export const useRooms = () =>
  useQuery({
    queryKey: ['rooms'],
    queryFn:  fetchRooms,
  })
