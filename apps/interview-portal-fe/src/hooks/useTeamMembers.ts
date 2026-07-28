import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export type TeamMember = {
  id:         string
  email:      string
  firstName:  string | null
  lastName:   string | null
  role:       string
  isActive:   boolean
  invitedBy:  string | null
  invitedAt:  string | null
  createdAt:  string
}

export type PaginatedResponse<T> = {
  items: T[]
  meta: {
    page:       number
    limit:      number
    total:      number
    totalPages: number
  }
}

const fetchTeamMembers = async (): Promise<PaginatedResponse<TeamMember>> => {
  const { data } = await api.get<PaginatedResponse<TeamMember>>('/users/team')
  return data
}

export const useTeamMembers = () =>
  useQuery({
    queryKey: ['team'],
    queryFn:  fetchTeamMembers,
  })
