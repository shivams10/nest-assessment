/**
 * Session Candidates API Service
 * Pure service functions for session candidate management API calls
 */

import { apiClient } from '@/lib/axios'
import type { AxiosError } from 'axios'
import type { ApiErrorResponse } from '@/services/auth.service'

export interface BulkAssignCsvResponse {
  total: number
  assigned: number
  created: number
  skipped: number
  errors?: string
}

export interface SessionCandidate {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  isActive: boolean
  collegeSessionId: string | null
  createdAt: string
}

export interface PaginatedSessionCandidatesResponse {
  items: SessionCandidate[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

/**
 * Bulk assign candidates to session via CSV
 * POST /admin/sessions/:sessionId/candidates/bulk
 */
export async function bulkAssignCandidatesToSessionService(
  sessionId: string,
  file: File,
): Promise<BulkAssignCsvResponse> {
  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await apiClient.post<BulkAssignCsvResponse>(
      `/admin/sessions/${sessionId}/candidates/bulk`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
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
      'Failed to bulk assign candidates'
    const customError = new Error(errorMessage)
    ;(customError as unknown as { status?: number }).status = axiosError.response?.status
    throw customError
  }
}

/**
 * Manually assign candidate to session
 * PATCH /admin/sessions/:sessionId/candidates/:candidateId
 */
export async function assignCandidateToSessionService(
  sessionId: string,
  candidateId: string,
): Promise<SessionCandidate> {
  try {
    const response = await apiClient.patch<SessionCandidate>(
      `/admin/sessions/${sessionId}/candidates/${candidateId}`,
    )
    return response.data
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>
    const errorMessage =
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      axiosError.message ||
      'Failed to assign candidate to session'
    const customError = new Error(errorMessage)
    ;(customError as unknown as { status?: number }).status = axiosError.response?.status
    throw customError
  }
}

/**
 * Get paginated list of candidates for a session
 * GET /admin/sessions/:sessionId/candidates
 */
export async function getSessionCandidatesService(
  sessionId: string,
  params?: { page?: number; limit?: number },
): Promise<PaginatedSessionCandidatesResponse> {
  try {
    const response = await apiClient.get<PaginatedSessionCandidatesResponse>(
      `/admin/sessions/${sessionId}/candidates`,
      { params },
    )
    return response.data
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>
    const errorMessage =
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      axiosError.message ||
      'Failed to fetch session candidates'
    const customError = new Error(errorMessage)
    ;(customError as unknown as { status?: number }).status = axiosError.response?.status
    throw customError
  }
}

/**
 * Get unassigned candidates
 * GET /admin/candidates/unassigned
 */
export async function getUnassignedCandidatesService(
  params?: { page?: number; limit?: number },
): Promise<PaginatedSessionCandidatesResponse> {
  try {
    const response = await apiClient.get<PaginatedSessionCandidatesResponse>(
      '/admin/candidates/unassigned',
      { params },
    )
    return response.data
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>
    const errorMessage =
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      axiosError.message ||
      'Failed to fetch unassigned candidates'
    const customError = new Error(errorMessage)
    ;(customError as unknown as { status?: number }).status = axiosError.response?.status
    throw customError
  }
}

