/**
 * Session Types
 * Types for recruitment session management
 */

export type SessionStatus = 'upcoming' | 'active' | 'completed'

export interface RecruitmentSession {
  id: string
  name: string
  year: number
  startDate: string | null
  endDate: string | null
  status: SessionStatus
  createdAt: string
  updatedAt: string
}

export interface CreateSessionRequest {
  name: string
  year: number
  startDate: string
  endDate: string
}

export interface ListSessionsParams {
  page?: number
  limit?: number
  status?: SessionStatus
}

export interface ListSessionsResponse {
  data: RecruitmentSession[]
  total: number
  page: number
  limit: number
}
