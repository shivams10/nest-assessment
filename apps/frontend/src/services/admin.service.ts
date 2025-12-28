import { apiClient } from '@/lib/axios'
import type { AxiosError } from 'axios'
import type { ApiErrorResponse } from './auth.service'

/**
 * Admin Service
 * Pure service functions for admin API calls
 */

export interface User {
  id: string
  email: string
  role: 'admin' | 'moderator' | 'candidate'
  firstName: string | null
  lastName: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ListUsersResponse {
  data: User[]
  total: number
  page: number
  limit: number
}

export interface ListUsersParams {
  page?: number
  limit?: number
  role?: 'admin' | 'moderator'
}

export interface Result {
  id: string
  submissionId: string
  examId: string
  examTitle: string
  candidateId: string
  candidateEmail: string
  candidateName: string | null
  totalMarks: number
  aptitudeMarks: number
  technicalMarks: number
  rank: number | null
  selectedForNextRound: boolean
  submittedAt: string
  createdAt: string
}

export interface ListResultsResponse {
  data: Result[]
  total: number
  page: number
  limit: number
}

export interface ListResultsParams {
  page?: number
  limit?: number
  examId?: string
  collegeSessionId?: string
  selectedForNextRound?: boolean
}

/**
 * List users service
 * GET /admin/users
 */
export async function listUsersService(
  params?: ListUsersParams,
): Promise<ListUsersResponse> {
  try {
    const response = await apiClient.get<ListUsersResponse>('/admin/users', {
      params,
    })
    return response.data
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>
    const errorMessage =
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      axiosError.message ||
      'Failed to fetch users'
    const customError = new Error(errorMessage)
    ;(customError as unknown as { status?: number }).status = axiosError.response?.status
    throw customError
  }
}

/**
 * List results service
 * GET /admin/results
 */
export async function listResultsService(
  params?: ListResultsParams,
): Promise<ListResultsResponse> {
  try {
    const response = await apiClient.get<ListResultsResponse>('/admin/results', {
      params,
    })
    return response.data
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>
    const errorMessage =
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      axiosError.message ||
      'Failed to fetch results'
    const customError = new Error(errorMessage)
    ;(customError as unknown as { status?: number }).status = axiosError.response?.status
    throw customError
  }
}

