/**
 * Exams API Service
 * Pure service functions for exam management API calls
 */

import { apiClient } from '@/lib/axios'
import type { AxiosError } from 'axios'
import type { ApiErrorResponse } from '@/services/auth.service'
import type {
  Exam,
  CreateExamRequest,
  ListExamsParams,
  ListExamsResponse,
} from '@/types/exam.types'

/**
 * List exams service (admin)
 * GET /exams/admin
 */
export async function listExamsService(
  params?: ListExamsParams,
): Promise<ListExamsResponse> {
  try {
    const response = await apiClient.get<{
      items: Exam[]
      total: number
    }>('/exams/admin', {
      params,
    })

    // Transform backend response to frontend format
    return {
      data: response.data.items || [],
      total: response.data.total || 0,
      page: params?.page || 1,
      limit: params?.limit || 20,
    }
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

/**
 * Create exam service
 * POST /exams
 */
export async function createExamService(
  data: CreateExamRequest,
): Promise<Exam> {
  try {
    const response = await apiClient.post<Exam>('/exams', data)
    return response.data
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>
    const errorMessage =
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      axiosError.message ||
      'Failed to create exam'
    const customError = new Error(errorMessage)
    ;(customError as unknown as { status?: number }).status = axiosError.response?.status
    throw customError
  }
}

/**
 * Publish exam service
 * PATCH /exams/:id/publish
 */
export async function publishExamService(examId: string): Promise<Exam> {
  try {
    const response = await apiClient.patch<Exam>(`/exams/${examId}/publish`)
    return response.data
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>
    const errorMessage =
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      axiosError.message ||
      'Failed to publish exam'
    const customError = new Error(errorMessage)
    ;(customError as unknown as { status?: number }).status = axiosError.response?.status
    throw customError
  }
}

/**
 * Unpublish exam service
 * PATCH /exams/:id/unpublish
 */
export async function unpublishExamService(examId: string): Promise<Exam> {
  try {
    const response = await apiClient.patch<Exam>(`/exams/${examId}/unpublish`)
    return response.data
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>
    const errorMessage =
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      axiosError.message ||
      'Failed to unpublish exam'
    const customError = new Error(errorMessage)
    ;(customError as unknown as { status?: number }).status = axiosError.response?.status
    throw customError
  }
}
