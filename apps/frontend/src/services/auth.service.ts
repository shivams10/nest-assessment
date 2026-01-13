import { apiClient } from '@/lib/axios'
import type { AxiosError } from 'axios'

/**
 * API error response structure
 */
export interface ApiErrorResponse {
  message?: string
  error?: string
  statusCode?: number
  code?: string
  reasons?: string[]
}

/**
 * Auth Service
 * Pure service functions for authentication API calls
 * Uses apiClient (axios instance) internally
 */

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
}

export interface RefreshTokenResponse {
  accessToken: string
}

/**
 * Login service
 * POST /auth/login
 */
export async function loginService(
  credentials: LoginRequest,
): Promise<LoginResponse> {
  try {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials)
    return response.data
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>
    const errorMessage =
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      axiosError.message ||
      'An error occurred during login'
    const customError = new Error(errorMessage)
    ;(customError as unknown as { status?: number }).status = axiosError.response?.status
    throw customError
  }
}

/**
 * Refresh token service
 * POST /auth/refresh
 * Note: Uses direct axios to bypass interceptors
 */
export async function refreshTokenService(): Promise<string> {
  try {
    // Import axios directly to bypass interceptors
    const axios = (await import('axios')).default
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
    const response = await axios.post<RefreshTokenResponse>(
      `${baseURL}/auth/refresh`,
      undefined,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      },
    )
    return response.data.accessToken
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>
    const errorMessage =
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      axiosError.message ||
      'Failed to refresh token'
    const customError = new Error(errorMessage)
    ;(customError as unknown as { status?: number }).status = axiosError.response?.status
    throw customError
  }
}

