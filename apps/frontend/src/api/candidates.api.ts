/**
 * Candidates API Service
 * Pure service functions for candidate management API calls
 */

import { apiClient } from '@/lib/axios'
import type { AxiosError } from 'axios'
import type { ApiErrorResponse } from '@/services/auth.service'

export interface CandidateListItem {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  isActive: boolean
  collegeSessionId: string | null
  session: {
    id: string
    name: string
    status: string
  } | null
  submission: {
    id: string
    submittedAt: string | null
    exam: {
      id: string
      title: string
    }
  } | null
  finalResult: {
    totalMarks: number
    rank: number | null
    selectedForNextRound: boolean
  } | null
}

export interface ListCandidatesParams {
  page?: number
  limit?: number
  examId?: string
  collegeSessionId?: string
  selectedForNextRound?: boolean
}

export interface PaginatedCandidatesResponse {
  items: CandidateListItem[]
  total: number
  meta: {
    page: number
    limit: number
    totalPages: number
  }
}

export interface UserPublic {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  role: string
  isActive: boolean
  createdAt: string
}

/**
 * List candidates for admin
 * GET /admin/candidates
 */
export async function listCandidatesService(
  params?: ListCandidatesParams,
): Promise<PaginatedCandidatesResponse> {
  try {
    const response = await apiClient.get<PaginatedCandidatesResponse>(
      '/admin/candidates',
      {
        params: {
          page: params?.page,
          limit: params?.limit,
          examId: params?.examId,
          collegeSessionId: params?.collegeSessionId,
          selectedForNextRound: params?.selectedForNextRound,
        },
      },
    )
    return response.data
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>
    const errorMessage =
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      axiosError.message ||
      'Failed to fetch candidates'
    const customError = new Error(errorMessage)
    ;(customError as unknown as { status?: number }).status = axiosError.response?.status
    throw customError
  }
}

/**
 * Activate candidate
 * PATCH /admin/candidates/:id/activate
 */
export async function activateCandidateService(
  candidateId: string,
): Promise<UserPublic> {
  try {
    const response = await apiClient.patch<UserPublic>(
      `/admin/candidates/${candidateId}/activate`,
    )
    return response.data
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>
    const errorMessage =
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      axiosError.message ||
      'Failed to activate candidate'
    const customError = new Error(errorMessage)
    ;(customError as unknown as { status?: number }).status = axiosError.response?.status
    throw customError
  }
}

/**
 * Deactivate candidate
 * PATCH /admin/candidates/:id/deactivate
 */
export async function deactivateCandidateService(
  candidateId: string,
): Promise<UserPublic> {
  try {
    const response = await apiClient.patch<UserPublic>(
      `/admin/candidates/${candidateId}/deactivate`,
    )
    return response.data
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>
    const errorMessage =
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      axiosError.message ||
      'Failed to deactivate candidate'
    const customError = new Error(errorMessage)
    ;(customError as unknown as { status?: number }).status = axiosError.response?.status
    throw customError
  }
}

/**
 * Export candidates as CSV
 * GET /admin/candidates/export
 */
export async function exportCandidatesService(
  params?: Omit<ListCandidatesParams, 'page' | 'limit'>,
): Promise<Blob> {
  try {
    const response = await apiClient.get('/admin/candidates/export', {
      params: {
        examId: params?.examId,
        collegeSessionId: params?.collegeSessionId,
        selectedForNextRound: params?.selectedForNextRound,
      },
      responseType: 'blob',
    })
    return response.data
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>
    const errorMessage =
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      axiosError.message ||
      'Failed to export candidates'
    const customError = new Error(errorMessage)
    ;(customError as unknown as { status?: number }).status = axiosError.response?.status
    throw customError
  }
}

export interface AssignCandidateSessionRequest {
  collegeSessionId: string | null
}

export interface BulkAssignCandidatesRequest {
  userIds: string[]
  collegeSessionId: string | null
}

export interface BulkAssignCandidatesResponse {
  updated: number
  skipped: number
}

/**
 * Assign candidate to recruitment session
 * PATCH /admin/candidates/:id/session
 */
export async function assignCandidateSessionService(
  candidateId: string,
  data: AssignCandidateSessionRequest,
): Promise<UserPublic> {
  try {
    const response = await apiClient.patch<UserPublic>(
      `/admin/candidates/${candidateId}/session`,
      data,
    )
    return response.data
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>
    const errorMessage =
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      axiosError.message ||
      'Failed to assign candidate session'
    const customError = new Error(errorMessage)
    ;(customError as unknown as { status?: number }).status = axiosError.response?.status
    throw customError
  }
}

/**
 * Bulk assign candidates to session
 * POST /admin/candidates/bulk-assign
 */
export async function bulkAssignCandidatesService(
  data: BulkAssignCandidatesRequest,
): Promise<BulkAssignCandidatesResponse> {
  try {
    const response = await apiClient.post<BulkAssignCandidatesResponse>(
      '/admin/candidates/bulk-assign',
      data,
    )
    return response.data
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>
    const errorMessage =
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      axiosError.message ||
      'Failed to bulk assign candidates'
    const customError = new Error(errorMessage)
    ;(customError as unknown as { status?: number }).status = axiosError.response?.status
    throw customError
  }
}

