/**
 * Questions API Service
 * Pure service functions for question bank API calls
 */

import { apiClient } from '@/lib/axios'
import type { AxiosError } from 'axios'
import type { ApiErrorResponse } from '@/services/auth.service'
import type {
  Question,
  CreateQuestionRequest,
  AssignQuestionsRequest,
  ListQuestionsParams,
  ListQuestionsResponse,
  SectionQuestionsResponse,
} from '@/types/question.types'

/**
 * List questions from question bank
 * GET /admin/questions
 */
export async function listQuestionsService(
  params?: ListQuestionsParams,
): Promise<ListQuestionsResponse> {
  try {
    const response = await apiClient.get<ListQuestionsResponse>('/admin/questions', {
      params,
    })
    return response.data
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>
    const errorMessage =
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      axiosError.message ||
      'Failed to fetch questions'
    const customError = new Error(errorMessage)
    ;(customError as unknown as { status?: number }).status = axiosError.response?.status
    throw customError
  }
}

/**
 * Create question
 * POST /admin/questions
 */
export async function createQuestionService(
  data: CreateQuestionRequest,
): Promise<Question> {
  try {
    const response = await apiClient.post<Question>('/admin/questions', data)
    return response.data
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>
    const errorMessage =
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      axiosError.message ||
      'Failed to create question'
    const customError = new Error(errorMessage)
    ;(customError as unknown as { status?: number }).status = axiosError.response?.status
    throw customError
  }
}

/**
 * Get questions for a section
 * GET /admin/exam-sets/:sectionId/questions
 */
export async function getSectionQuestionsService(
  sectionId: string,
): Promise<SectionQuestionsResponse> {
  try {
    const response = await apiClient.get<SectionQuestionsResponse>(
      `/admin/exam-sets/${sectionId}/questions`,
    )
    return response.data
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>
    const errorMessage =
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      axiosError.message ||
      'Failed to fetch section questions'
    const customError = new Error(errorMessage)
    ;(customError as unknown as { status?: number }).status = axiosError.response?.status
    throw customError
  }
}

/**
 * Assign questions to section
 * POST /exam-set-questions
 */
export async function assignQuestionsService(
  data: AssignQuestionsRequest,
): Promise<void> {
  try {
    await apiClient.post('/exam-set-questions', data)
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>
    const errorMessage =
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      axiosError.message ||
      'Failed to assign questions'
    const customError = new Error(errorMessage)
    ;(customError as unknown as { status?: number }).status = axiosError.response?.status
    throw customError
  }
}

