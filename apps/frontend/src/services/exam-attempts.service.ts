import { apiClient } from '@/lib/axios'
import type { AxiosError } from 'axios'
import type { ApiErrorResponse } from './auth.service'

/**
 * Exam Attempts Service
 * Pure service functions for exam attempts API calls
 */

export interface StartExamRequest {
  examId: string
}

export interface StartExamResponse {
  id: string // submissionId
  examId: string
  examSetId: string
  startedAt: string | null
  submittedAt: string | null
  autoSubmitted: boolean
  createdAt: string
}

/**
 * Start exam service
 * POST /exam-attempts/start
 */
export async function startExamService(
  data: StartExamRequest,
): Promise<StartExamResponse> {
  try {
    const response = await apiClient.post<{
      id: string
      examId: string
      examSetId: string
      startedAt: Date | null
      submittedAt: Date | null
      autoSubmitted: boolean
      createdAt: Date
    }>('/exam-attempts/start', data)
    
    // Transform backend response
    const backendData = response.data
    return {
      id: backendData.id,
      examId: backendData.examId,
      examSetId: backendData.examSetId,
      startedAt: backendData.startedAt ? new Date(backendData.startedAt).toISOString() : null,
      submittedAt: backendData.submittedAt ? new Date(backendData.submittedAt).toISOString() : null,
      autoSubmitted: backendData.autoSubmitted,
      createdAt: new Date(backendData.createdAt).toISOString(),
    }
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>
    const errorMessage =
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      axiosError.message ||
      'Failed to start exam'
    const customError = new Error(errorMessage)
    ;(customError as unknown as { status?: number }).status = axiosError.response?.status
    throw customError
  }
}

