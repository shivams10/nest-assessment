import type { AxiosError } from 'axios'
import { apiClient } from './axios'
import type { ApiErrorResponse } from './auth.api'

/**
 * Exam list response
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
 * Get list of exams (published for candidates, all for admin)
 * GET /exams/admin for admin, GET /exams for candidates (if available)
 * Note: If GET /exams doesn't exist, candidates should use a different endpoint
 */
export async function listExams(
  params?: ListExamsParams,
  isAdmin = false,
): Promise<ListExamsResponse> {
  try {
    // For admin, use /exams/admin endpoint
    // For candidates, try /exams endpoint (backend may need to implement this)
    const endpoint = isAdmin ? '/exams/admin' : '/exams'
    // Remove status filter for candidates if endpoint doesn't support it
    const queryParams = isAdmin ? params : { page: params?.page, limit: params?.limit }
    const response = await apiClient.get<ListExamsResponse>(endpoint, { params: queryParams })
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

