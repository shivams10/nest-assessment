import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { CandidateStatus } from './useCandidates'

export type CandidateEducation = {
  degree:      string
  institution: string
  year:        number | null
}

export type InterviewCandidate = {
  id:                string
  name:              string
  email:             string
  roleApplyingFor:   string
  status:            CandidateStatus
  createdAt:         string
  updatedAt:         string
  phone:             string | null
  yearsOfExperience: number | null
  skills:            string[]
  education:         CandidateEducation[]
  resumeUrl:         string | null
  referredBy:        string | null
  addedBy:           string
}

const fetchCandidate = async (id: string): Promise<InterviewCandidate> => {
  const { data } = await api.get<InterviewCandidate>(`/candidates/${id}`)
  return data
}

export const useCandidate = (id: string | undefined) =>
  useQuery({
    queryKey: ['candidates', id],
    queryFn:  () => fetchCandidate(id as string),
    enabled:  Boolean(id),
  })
