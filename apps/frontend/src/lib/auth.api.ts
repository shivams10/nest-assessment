import type { AxiosError } from 'axios'
import axios from 'axios'
import { apiClient } from './axios'

/**
 * Login request payload
 */
export interface LoginRequest {
  email: string
  password: string
}

/**
 * Login response from backend
 */
export interface LoginResponse {
  accessToken: string
  refreshToken: string
}

/**
 * Refresh token response from backend
 */
export interface RefreshTokenResponse {
  accessToken: string
}

/**
 * API error response structure
 */
export interface ApiErrorResponse {
  message?: string
  error?: string
  statusCode?: number
}

/**
 * Login API call
 * POST /auth/login
 *
 * @param credentials - Email and password
 * @returns Promise with accessToken and refreshToken
 * @throws AxiosError with error details
 */
export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  try {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials)
    return response.data
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>
    
    // Extract error message from response
    const errorMessage =
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      axiosError.message ||
      'An error occurred during login'

    // Create a new error with a user-friendly message
    const customError = new Error(errorMessage)
    ;(customError as unknown as { status?: number }).status = axiosError.response?.status

    throw customError
  }
}

/**
 * Refresh access token API call
 * POST /auth/refresh
 *
 * Note: This function uses a direct axios call (not apiClient) to bypass
 * the refresh interceptor and prevent infinite loops
 *
 * @returns Promise with new accessToken
 * @throws AxiosError with error details
 */
export async function refreshToken(): Promise<string> {
  try {
    // Use direct axios call to bypass interceptors and prevent infinite loop
    // The refresh token should be sent via cookies or stored separately
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
    const response = await axios.post<RefreshTokenResponse>(
      `${baseURL}/auth/refresh`,
      undefined,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true, // Include cookies for refresh token
      },
    )
    return response.data.accessToken
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>
    
    // Extract error message from response
    const errorMessage =
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      axiosError.message ||
      'Failed to refresh token'

    // Create a new error with a user-friendly message
    const customError = new Error(errorMessage)
    ;(customError as unknown as { status?: number }).status = axiosError.response?.status

    throw customError
  }
}

