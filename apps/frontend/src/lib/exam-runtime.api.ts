import type { AxiosError } from 'axios'
import { apiClient } from './axios'
import type { ApiErrorResponse } from './auth.api'

/**
 * Exam question option
 */
export interface QuestionOption {
  id: string
  text: string
}

/**
 * Exam question
 */
export interface ExamQuestion {
  id: string
  text: string
  type: 'single_select' | 'multi_select'
  category: 'aptitude' | 'technical'
  options: QuestionOption[]
  sectionId: string
}

/**
 * Exam section
 */
export interface ExamSection {
  id: string
  name: string
  type: 'aptitude' | 'technical'
  questions: ExamQuestion[]
}

/**
 * Get exam response
 */
export interface GetExamResponse {
  submissionId: string
  examId: string
  examTitle: string
  startedAt: string
  expiresAt: string
  sections: ExamSection[]
}

/**
 * Submit answer request
 */
export interface SubmitAnswerRequest {
  questionId: string
  selectedOptionIds: string[]
}

/**
 * Submit answers request
 */
export interface SubmitAnswersRequest {
  submissionId: string
  answers: SubmitAnswerRequest[]
}

/**
 * Submit answers response
 */
export interface SubmitAnswersResponse {
  success: boolean
  message?: string
}

/**
 * Get exam questions for a submission
 * GET /exam-runtime?submissionId=xxx
 */
export async function getExam(
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
 * Submit answers
 * POST /exam-runtime/answers
 */
export async function submitAnswers(
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
 * Submit exam
 * POST /submissions/:id/submit
 */
export async function submitExam(
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
 * Get exam result
 * GET /submissions/:id/result
 */
export interface ExamResult {
  totalMarks: number
  aptitudeMarks: number
  technicalMarks: number
  rank: number | null
  selectedForNextRound: boolean
}

export async function getExamResult(
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

