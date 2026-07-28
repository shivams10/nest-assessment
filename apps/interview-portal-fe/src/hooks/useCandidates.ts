import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { PaginatedResponse } from './useTeamMembers'

export type CandidateStatus =
  | 'added'
  | 'interview_scheduled'
  | 'interview_done'
  | 'next_round'
  | 'on_hold'
  | 'rejected'
  | 'hired'

export type InterviewCandidateListItem = {
  id:              string
  name:            string
  email:           string
  roleApplyingFor: string
  status:          CandidateStatus
  createdAt:       string
}

export type ListCandidatesParams = {
  page?:   number
  limit?:  number
  status?: CandidateStatus
  search?: string
}

const fetchCandidates = async (
  params: ListCandidatesParams,
): Promise<PaginatedResponse<InterviewCandidateListItem>> => {
  const { data } = await api.get<PaginatedResponse<InterviewCandidateListItem>>('/candidates', { params })
  return data
}

export const useCandidates = (params: ListCandidatesParams = {}) =>
  useQuery({
    queryKey: ['candidates', params],
    queryFn:  () => fetchCandidates(params),
  })
