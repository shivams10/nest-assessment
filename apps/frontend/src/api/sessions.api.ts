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
    const response = await apiClient.get<ListSessionsResponse>('/admin/sessions', {
      params,
    })
    return response.data
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
