import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Room } from './useRooms'

type UpdateRoomInput = {
  id:       string
  isActive: boolean
}

const updateRoom = async ({ id, isActive }: UpdateRoomInput): Promise<Room> => {
  const { data } = await api.patch<Room>(`/rooms/${id}`, { isActive })
  return data
}

export const useUpdateRoom = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] })
    },
  })
}
