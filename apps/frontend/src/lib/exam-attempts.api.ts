import type { AxiosError } from 'axios'
import { apiClient } from './axios'
import type { ApiErrorResponse } from './auth.api'

/**
 * Start exam request
 */
export interface StartExamRequest {
  examId: string
}

/**
 * Start exam response
 */
export interface StartExamResponse {
  submissionId: string
  examId: string
  startedAt: string
  expiresAt: string
}

/**
 * Start an exam attempt
 * POST /exam-attempts/start
 */
export async function startExam(
  data: StartExamRequest,
): Promise<StartExamResponse> {
  try {
    const response = await apiClient.post<StartExamResponse>(
      '/exam-attempts/start',
      data,
    )
    return response.data
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

