import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { TeamMember } from './useTeamMembers'

export type InviteTeamMemberInput = {
  email:     string
  firstName: string
  lastName:  string
}

const inviteTeamMember = async (input: InviteTeamMemberInput): Promise<TeamMember> => {
  const { data } = await api.post<TeamMember>('/users/invite', input)
  return data
}

export const useInviteTeamMember = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: inviteTeamMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team'] })
    },
  })
}
