/**
 * Exam Runtime API Service
 * Pure service functions for exam runtime API calls
 * Uses apiClient (axios instance) internally
 */

import { apiClient } from '@/lib/axios'
import type { AxiosError } from 'axios'
import type { ApiErrorResponse } from '@/services/auth.service'

// Re-export types from service for convenience
export type {
  GetExamResponse,
  SubmitAnswersRequest,
  SubmitAnswersResponse,
  ExamResult,
} from '@/services/exam-runtime.service'

export interface ExamMeta {
  id: string
  title: string
  description: string | null
  durationSeconds: number
  instructions: string | null
}

export interface MonitoringEventRequest {
  submissionId: string
  eventType: 'tab_switch' | 'blur' | 'focus'
}

/**
 * Get exam metadata
 * Note: This may need to be implemented in backend
 * For now, we'll get it from the exam list or exam runtime response
 */
export async function getExamMetaService(
  examId: string,
): Promise<ExamMeta> {
  try {
    // If backend has GET /exams/:id endpoint, use it
    // Otherwise, we'll need to get it from exam list or runtime
    const response = await apiClient.get<ExamMeta>(`/exams/${examId}`)
    return response.data
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>
    const errorMessage =
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      axiosError.message ||
      'Failed to fetch exam metadata'
    const customError = new Error(errorMessage)
    ;(customError as unknown as { status?: number }).status = axiosError.response?.status
    throw customError
  }
}

/**
 * Submit monitoring event
 * POST /monitoring/events (if endpoint exists)
 * Note: Backend may not have this endpoint yet
 */
export async function submitMonitoringEventService(
  data: MonitoringEventRequest,
): Promise<{ success: boolean }> {
  try {
    // Try to call monitoring endpoint if it exists
    const response = await apiClient.post<{ success: boolean }>(
      '/monitoring/events',
      data,
    )
    return response.data
  } catch (error) {
    // If endpoint doesn't exist, fail silently for now
    // This allows the feature to work even if monitoring isn't implemented yet
    const axiosError = error as AxiosError<ApiErrorResponse>
    if (axiosError.response?.status === 404) {
      // Endpoint doesn't exist - return success to not break the flow
      return { success: true }
    }
    // For other errors, throw
    const errorMessage =
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      axiosError.message ||
      'Failed to submit monitoring event'
    const customError = new Error(errorMessage)
    ;(customError as unknown as { status?: number }).status = axiosError.response?.status
    throw customError
  }
}

