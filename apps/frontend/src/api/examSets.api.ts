/**
 * Exam Sets API Service
 * Pure service functions for exam set API calls
 */

import { apiClient } from '@/lib/axios'
import type { AxiosError } from 'axios'
import type { ApiErrorResponse } from '@/services/auth.service'
import type {
  ExamSet,
  ExamSetSection,
  CreateExamSetRequest,
  CreateExamSetSectionRequest,
  UpdateExamSetSectionRequest,
  ListExamSetsParams,
  ListExamSetsResponse,
} from '@/types/examSet.types'

/**
 * List exam sets for an exam
 * GET /admin/exams/:examId/sets
 */
export async function listExamSetsService(
  params: ListExamSetsParams,
): Promise<ListExamSetsResponse> {
  try {
    const response = await apiClient.get<ListExamSetsResponse>(
      `/admin/exams/${params.examId}/sets`,
    )
    return response.data
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>
    const errorMessage =
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      axiosError.message ||
      'Failed to fetch exam sets'
    const customError = new Error(errorMessage)
    ;(customError as unknown as { status?: number }).status = axiosError.response?.status
    throw customError
  }
}

/**
 * Create exam set
 * POST /exam-sets
 */
export async function createExamSetService(
  data: CreateExamSetRequest,
): Promise<ExamSet> {
  try {
    const response = await apiClient.post<ExamSet>('/exam-sets', data)
    return response.data
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>
    const errorMessage =
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      axiosError.message ||
      'Failed to create exam set'
    const customError = new Error(errorMessage)
    ;(customError as unknown as { status?: number }).status = axiosError.response?.status
    throw customError
  }
}

/**
 * Delete exam set
 * DELETE /admin/exams/sets/:setId
 */
export async function deleteExamSetService(setId: string): Promise<void> {
  try {
    await apiClient.delete(`/admin/exams/sets/${setId}`)
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>
    const errorMessage =
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      axiosError.message ||
      'Failed to delete exam set'
    const customError = new Error(errorMessage)
    ;(customError as unknown as { status?: number }).status = axiosError.response?.status
    throw customError
  }
}

/**
 * Create exam set section
 * POST /exam-sets/sections
 */
export async function createExamSetSectionService(
  data: CreateExamSetSectionRequest,
): Promise<ExamSetSection> {
  try {
    const response = await apiClient.post<ExamSetSection>('/exam-sets/sections', {
      examSetId: data.examSetId,
      sectionType: data.sectionType,
      questionCount: data.questionCount,
    })
    return response.data
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>
    const errorMessage =
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      axiosError.message ||
      'Failed to create section'
    const customError = new Error(errorMessage)
    ;(customError as unknown as { status?: number }).status = axiosError.response?.status
    throw customError
  }
}

/**
 * Update exam set section
 * PATCH /admin/exam-sets/sections/:sectionId
 */
export async function updateExamSetSectionService(
  sectionId: string,
  data: UpdateExamSetSectionRequest,
): Promise<ExamSetSection> {
  try {
    const response = await apiClient.patch<ExamSetSection>(
      `/admin/exam-sets/sections/${sectionId}`,
      data,
    )
    return response.data
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>
    const errorMessage =
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      axiosError.message ||
      'Failed to update section'
    const customError = new Error(errorMessage)
    ;(customError as unknown as { status?: number }).status = axiosError.response?.status
    throw customError
  }
}

