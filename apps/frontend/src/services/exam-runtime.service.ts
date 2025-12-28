import { apiClient } from '@/lib/axios'
import type { AxiosError } from 'axios'
import type { ApiErrorResponse } from './auth.service'

/**
 * Exam Runtime Service
 * Pure service functions for exam runtime API calls
 */

export interface QuestionOption {
  id: string
  text: string
}

export interface ExamQuestion {
  id: string
  text: string
  type: 'single_select' | 'multi_select'
  category: 'aptitude' | 'technical'
  options: QuestionOption[]
  sectionId: string
}

export interface ExamSection {
  id: string
  name: string
  type: 'aptitude' | 'technical'
  questions: ExamQuestion[]
}

export interface GetExamResponse {
  submissionId: string
  examId: string
  examTitle: string
  startedAt: string
  expiresAt: string
  sections: ExamSection[]
}

export interface SubmitAnswerRequest {
  questionId: string
  selectedOptionIds: string[]
}

export interface SubmitAnswersRequest {
  submissionId: string
  answers: SubmitAnswerRequest[]
}

export interface SubmitAnswersResponse {
  success: boolean
  message?: string
}

export interface ExamResult {
  totalMarks: number
  aptitudeMarks: number
  technicalMarks: number
  rank: number | null
  selectedForNextRound: boolean
}

/**
 * Get exam service
 * GET /exam-runtime?submissionId=xxx
 */
export async function getExamService(
  submissionId: string,
): Promise<GetExamResponse> {
  try {
    const response = await apiClient.get<GetExamResponse>('/exam-runtime', {
      params: { submissionId },
    })
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
 * Submit answers service
 * POST /exam-runtime/answers
 */
export async function submitAnswersService(
  data: SubmitAnswersRequest,
): Promise<SubmitAnswersResponse> {
  try {
    const response = await apiClient.post<SubmitAnswersResponse>(
      '/exam-runtime/answers',
      data,
    )
    return response.data
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>
    const errorMessage =
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      axiosError.message ||
      'Failed to submit answers'
    const customError = new Error(errorMessage)
    ;(customError as unknown as { status?: number }).status = axiosError.response?.status
    throw customError
  }
}

/**
 * Submit exam service
 * POST /submissions/:id/submit
 */
export async function submitExamService(
  submissionId: string,
): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await apiClient.post<{ success: boolean; message?: string }>(
      `/submissions/${submissionId}/submit`,
    )
    return response.data
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>
    const errorMessage =
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      axiosError.message ||
      'Failed to submit exam'
    const customError = new Error(errorMessage)
    ;(customError as unknown as { status?: number }).status = axiosError.response?.status
    throw customError
  }
}

/**
 * Get exam result service
 * GET /submissions/:id/result
 */
export async function getExamResultService(
  submissionId: string,
): Promise<ExamResult> {
  try {
    const response = await apiClient.get<ExamResult>(
      `/submissions/${submissionId}/result`,
    )
    return response.data
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>
    const errorMessage =
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      axiosError.message ||
      'Failed to fetch exam result'
    const customError = new Error(errorMessage)
    ;(customError as unknown as { status?: number }).status = axiosError.response?.status
    throw customError
  }
}

