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
  stem?: string // Backend may use this field name
  type: 'single_select' | 'multi_select'
  category: 'aptitude' | 'technical'
  options: QuestionOption[]
  sectionId: string
}

export interface ExamSection {
  id: string
  name?: string
  type: 'aptitude' | 'technical'
  sectionType?: string // Backend may use this field name
  questions: ExamQuestion[]
}

export interface GetExamResponse {
  submissionId: string
  examId: string
  examTitle?: string
  examSetId?: string
  examSetName?: string
  startedAt: string | null
  expiresAt?: string
  durationSeconds?: number // Exam duration in seconds
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
    const response = await apiClient.get<{
      submissionId: string
      examSetId: string
      examSetName: string
      startedAt: Date | null
      sections: Array<{
        id: string
        type: string
        questions: Array<{
          id: string
          stem: string
          type: string
          category: string
          options: Array<{ id: string; optionText: string }>
        }>
      }>
    }>('/exam-runtime', {
      params: { submissionId },
    })

    // Transform backend response to frontend format
    const data = response.data
    return {
      submissionId: data.submissionId,
      examId: '', // Not provided by backend
      examSetId: data.examSetId,
      examSetName: data.examSetName,
      examTitle: data.examSetName,
      startedAt: data.startedAt ? new Date(data.startedAt).toISOString() : null,
      expiresAt: undefined, // Calculate from startedAt + duration if needed
      sections: data.sections.map((section) => ({
        id: section.id,
        type: section.type as 'aptitude' | 'technical',
        sectionType: section.type,
        questions: section.questions.map((q) => ({
          id: q.id,
          text: q.stem,
          stem: q.stem,
          type: q.type as 'single_select' | 'multi_select',
          category: q.category as 'aptitude' | 'technical',
          sectionId: section.id,
          options: q.options.map((opt) => ({
            id: opt.id,
            text: opt.optionText,
            optionText: opt.optionText,
          })),
        })),
      })),
    }
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

