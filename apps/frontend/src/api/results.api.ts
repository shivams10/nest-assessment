/**
 * Results API Service
 * Pure service functions for results API calls
 * Uses apiClient (axios instance) internally
 */

import { apiClient } from '@/lib/axios'
import type { AxiosError } from 'axios'
import type { ApiErrorResponse } from '@/services/auth.service'
import type {
  CandidateResult,
  ListResultsParams,
  PaginatedResultsResponse,
} from '@/types/result.types'

/**
 * Get candidate result
 * GET /submissions/:submissionId/result
 */
export async function getCandidateResultService(
  submissionId: string,
): Promise<CandidateResult> {
  try {
    const response = await apiClient.get<CandidateResult>(
      `/submissions/${submissionId}/result`,
    )
    return response.data
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>
    const errorMessage =
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      axiosError.message ||
      'Failed to fetch result'
    const customError = new Error(errorMessage)
    ;(customError as unknown as { status?: number }).status = axiosError.response?.status
    throw customError
  }
}

/**
 * List results for admin
 * GET /admin/results
 */
export async function listResultsService(
  params?: ListResultsParams,
): Promise<PaginatedResultsResponse> {
  try {
    const response = await apiClient.get<{
      items: Array<{
        submissionId: string
        examId: string
        examTitle: string
        candidate: {
          email: string | null
          firstName: string | null
          lastName: string | null
        }
        totalMarks: number
        aptitudeMarks: number
        technicalMarks: number
        selectedForNextRound: boolean
        rank: number | null
        submittedAt: string | null
        createdAt: string
      }>
      meta: {
        page: number
        limit: number
        total: number
        totalPages: number
      }
    }>('/admin/results', {
      params: {
        page: params?.page,
        limit: params?.limit,
        examId: params?.examId,
        collegeSessionId: params?.collegeSessionId,
        selectedForNextRound: params?.selectedForNextRound,
      },
    })

    // Transform backend response to frontend format
    return {
      items: response.data.items.map((item) => ({
        submissionId: item.submissionId,
        examId: item.examId,
        examTitle: item.examTitle,
        candidate: item.candidate,
        totalMarks: item.totalMarks,
        aptitudeMarks: item.aptitudeMarks,
        technicalMarks: item.technicalMarks,
        rank: item.rank,
        selectedForNextRound: item.selectedForNextRound,
        submittedAt: item.submittedAt,
        createdAt: item.createdAt,
      })),
      meta: response.data.meta,
    }
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>
    const errorMessage =
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      axiosError.message ||
      'Failed to fetch results'
    const customError = new Error(errorMessage)
    ;(customError as unknown as { status?: number }).status = axiosError.response?.status
    throw customError
  }
}

/**
 * Toggle next round selection
 * PATCH /admin/results/:submissionId/next-round
 * Note: Endpoint may need to be created in backend
 */
export async function toggleNextRoundSelectionService(
  submissionId: string,
  selected: boolean,
): Promise<{ success: boolean; selectedForNextRound: boolean }> {
  try {
    const response = await apiClient.patch<{
      success: boolean
      selectedForNextRound: boolean
    }>(`/admin/results/${submissionId}/next-round`, {
      selectedForNextRound: selected,
    })
    return response.data
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>
    // If endpoint doesn't exist (404), fail gracefully
    if (axiosError.response?.status === 404) {
      throw new Error('Toggle selection endpoint not available')
    }
    const errorMessage =
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      axiosError.message ||
      'Failed to toggle selection'
    const customError = new Error(errorMessage)
    ;(customError as unknown as { status?: number }).status = axiosError.response?.status
    throw customError
  }
}

/**
 * Recalculate ranks for an exam
 * POST /admin/exams/:examId/recalculate-ranks
 * Note: Endpoint may need to be created in backend
 */
export async function recalculateRanksService(
  examId: string,
): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await apiClient.post<{ success: boolean; message?: string }>(
      `/admin/exams/${examId}/recalculate-ranks`,
    )
    return response.data
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>
    // If endpoint doesn't exist (404), fail gracefully
    if (axiosError.response?.status === 404) {
      throw new Error('Recalculate ranks endpoint not available')
    }
    const errorMessage =
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      axiosError.message ||
      'Failed to recalculate ranks'
    const customError = new Error(errorMessage)
    ;(customError as unknown as { status?: number }).status = axiosError.response?.status
    throw customError
  }
}

