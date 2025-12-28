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
  UpdateExamRequest,
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
 * Get exam by ID service
 * GET /admin/exams/:id
 */
export async function getExamService(id: string): Promise<Exam> {
  try {
    const response = await apiClient.get<Exam>(`/admin/exams/${id}`)
    return response.data
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>
    const errorMessage =
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      axiosError.message ||
      'Failed to fetch exam'
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
 * Update exam service
 * PATCH /admin/exams/:id
 */
export async function updateExamService(
  id: string,
  data: UpdateExamRequest,
): Promise<Exam> {
  try {
    const response = await apiClient.patch<Exam>(`/admin/exams/${id}`, data)
    return response.data
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>
    const errorMessage =
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      axiosError.message ||
      'Failed to update exam'
    const customError = new Error(errorMessage)
    ;(customError as unknown as { status?: number }).status = axiosError.response?.status
    throw customError
  }
}

/**
 * Publish exam service
 * POST /admin/exams/:id/publish
 */
export async function publishExamService(examId: string): Promise<Exam> {
  try {
    const response = await apiClient.post<Exam>(`/admin/exams/${examId}/publish`)
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
 * POST /admin/exams/:id/unpublish
 */
export async function unpublishExamService(examId: string): Promise<Exam> {
  try {
    const response = await apiClient.post<Exam>(`/admin/exams/${examId}/unpublish`)
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

/**
 * Delete exam service (soft delete)
 * DELETE /admin/exams/:id
 */
export async function deleteExamService(id: string): Promise<void> {
  try {
    await apiClient.delete(`/admin/exams/${id}`)
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>
    const errorMessage =
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      axiosError.message ||
      'Failed to delete exam'
    const customError = new Error(errorMessage)
    ;(customError as unknown as { status?: number }).status = axiosError.response?.status
    throw customError
  }
}
