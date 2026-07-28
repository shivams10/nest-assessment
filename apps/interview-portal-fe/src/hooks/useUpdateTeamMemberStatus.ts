import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { TeamMember } from './useTeamMembers'

type UpdateTeamMemberStatusInput = {
  id:       string
  isActive: boolean
}

const updateTeamMemberStatus = async ({ id, isActive }: UpdateTeamMemberStatusInput): Promise<TeamMember> => {
  const { data } = await api.patch<TeamMember>(`/users/${id}/activate`, { isActive })
  return data
}

export const useUpdateTeamMemberStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateTeamMemberStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team'] })
    },
  })
}
