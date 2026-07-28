import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Room } from './useRooms'

export type CreateRoomInput = {
  name:          string
  resourceEmail: string
  location?:     string
  capacity:      number
}

const createRoom = async (input: CreateRoomInput): Promise<Room> => {
  const { data } = await api.post<Room>('/rooms', input)
  return data
}

export const useCreateRoom = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] })
    },
  })
}
