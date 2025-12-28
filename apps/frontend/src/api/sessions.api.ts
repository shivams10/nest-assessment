/**
 * Sessions API Service
 * Pure service functions for recruitment session API calls
 */

import { apiClient } from '@/lib/axios'
import type { AxiosError } from 'axios'
import type { ApiErrorResponse } from '@/services/auth.service'
import type {
  RecruitmentSession,
  CreateSessionRequest,
  UpdateSessionRequest,
  ListSessionsParams,
  ListSessionsResponse,
} from '@/types/session.types'

/**
 * List recruitment sessions service
 * GET /admin/sessions
 */
export async function listSessionsService(
  params?: ListSessionsParams,
): Promise<ListSessionsResponse> {
  try {
    const response = await apiClient.get<{
      items: RecruitmentSession[]
      total: number
    }>('/admin/sessions', {
      params,
    })

    // Transform backend response to match frontend's ListSessionsResponse
    return {
      data: response.data.items || [],
      total: response.data.total || 0,
      page: params?.page || 1,
      limit: params?.limit || 10,
    }
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>
    const errorMessage =
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      axiosError.message ||
      'Failed to fetch sessions'
    const customError = new Error(errorMessage)
    ;(customError as unknown as { status?: number }).status = axiosError.response?.status
    throw customError
  }
}

/**
 * Create recruitment session service
 * POST /admin/sessions
 */
export async function createSessionService(
  data: CreateSessionRequest,
): Promise<RecruitmentSession> {
  try {
    const response = await apiClient.post<RecruitmentSession>('/admin/sessions', data)
    return response.data
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>
    const errorMessage =
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      axiosError.message ||
      'Failed to create session'
    const customError = new Error(errorMessage)
    ;(customError as unknown as { status?: number }).status = axiosError.response?.status
    throw customError
  }
}

/**
 * Get recruitment session by ID service
 * GET /admin/sessions/:id
 */
export async function getSessionService(
  id: string,
): Promise<RecruitmentSession> {
  try {
    const response = await apiClient.get<RecruitmentSession>(
      `/admin/sessions/${id}`,
    )
    return response.data
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>
    const errorMessage =
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      axiosError.message ||
      'Failed to fetch session'
    const customError = new Error(errorMessage)
    ;(customError as unknown as { status?: number }).status = axiosError.response?.status
    throw customError
  }
}

/**
 * Update recruitment session service
 * PATCH /admin/sessions/:id
 */
export async function updateSessionService(
  id: string,
  data: UpdateSessionRequest,
): Promise<RecruitmentSession> {
  try {
    const response = await apiClient.patch<RecruitmentSession>(
      `/admin/sessions/${id}`,
      data,
    )
    return response.data
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>
    const errorMessage =
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      axiosError.message ||
      'Failed to update session'
    const customError = new Error(errorMessage)
    ;(customError as unknown as { status?: number }).status = axiosError.response?.status
    throw customError
  }
}

/**
 * Delete recruitment session service (soft delete)
 * DELETE /admin/sessions/:id
 */
export async function deleteSessionService(
  id: string,
): Promise<void> {
  try {
    await apiClient.delete(`/admin/sessions/${id}`)
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>
    const errorMessage =
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      axiosError.message ||
      'Failed to delete session'
    const customError = new Error(errorMessage)
    ;(customError as unknown as { status?: number }).status = axiosError.response?.status
    throw customError
  }
}
