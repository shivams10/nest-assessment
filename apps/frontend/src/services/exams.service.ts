import { apiClient } from '@/lib/axios'
import type { AxiosError } from 'axios'
import type { ApiErrorResponse } from './auth.service'

/**
 * Exams Service
 * Pure service functions for exams API calls
 */

export interface Exam {
  id: string
  title: string
  description: string | null
  windowStartsAt: string | null
  windowEndsAt: string | null
  durationSeconds: number
  isPublished: boolean
  createdAt: string
  updatedAt: string
  submissionId?: string | null
  submittedAt?: string | null
}

export interface ListExamsResponse {
  data: Exam[]
  total: number
  page: number
  limit: number
}

export interface ListExamsParams {
  page?: number
  limit?: number
  collegeSessionId?: string
  status?: 'draft' | 'published'
}

/**
 * List exams service
 * GET /exams/admin (for admin) or GET /exams (for candidates)
 */
export async function listExamsService(
  params?: ListExamsParams,
  isAdmin = false,
): Promise<ListExamsResponse> {
  try {
    const endpoint = isAdmin ? '/exams/admin' : '/exams'
    const queryParams = isAdmin ? params : { page: params?.page, limit: params?.limit }
    const response = await apiClient.get<ListExamsResponse>(endpoint, {
      params: queryParams,
    })
    return response.data
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>
    const errorMessage =
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      axiosError.message ||
      'Failed to fetch exams'
    const customError = new Error(errorMessage)
    ;(customError as unknown as { status?: number }).status = axiosError.response?.status
    throw customError
  }
}

