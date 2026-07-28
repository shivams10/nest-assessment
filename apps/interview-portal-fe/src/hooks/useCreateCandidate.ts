import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { InterviewCandidate } from './useCandidate'

export type CreateCandidateInput = {
  name:            string
  email:           string
  phone?:          string
  roleApplyingFor: string
  referredBy?:     string
  resume:          File
}

const createCandidate = async (input: CreateCandidateInput): Promise<InterviewCandidate> => {
  const formData = new FormData()
  formData.append('name', input.name)
  formData.append('email', input.email)
  formData.append('roleApplyingFor', input.roleApplyingFor)
  if (input.phone) formData.append('phone', input.phone)
  if (input.referredBy) formData.append('referredBy', input.referredBy)
  formData.append('resume', input.resume)

  const { data } = await api.post<InterviewCandidate>('/candidates', formData)
  return data
}

export const useCreateCandidate = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createCandidate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] })
    },
  })
}
