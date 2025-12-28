import axios from 'axios'
import type { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { store } from '@/store/store'
import { clearToken, setAccessToken } from '@/store/slices/auth.slice'
import { refreshTokenService } from '@/services/auth.service'

// Extend AxiosRequestConfig to include retry flag
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
  _skipAuthRefresh?: boolean
}

// Create axios instance with default config
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Refresh token state management
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value: string) => void
  reject: (reason?: unknown) => void
}> = []

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else if (token) {
      prom.resolve(token)
    } else {
      prom.reject(new Error('Token refresh failed'))
    }
  })

  failedQueue = []
}

// Request interceptor - adds Authorization header from Redux store
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const state = store.getState()
    const token = state.auth.token

    if (token && !(config as ExtendedAxiosRequestConfig)._skipAuthRefresh) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// Response interceptor - handles 401 errors with token refresh
apiClient.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as ExtendedAxiosRequestConfig

    // Skip refresh logic for refresh endpoint itself or if already retried
    if (
      originalRequest._skipAuthRefresh ||
      originalRequest._retry ||
      originalRequest.url?.includes('/auth/refresh')
    ) {
      // Refresh failed or already retried - logout user
      if (error.response?.status === 401) {
        store.dispatch(clearToken())
      }
      return Promise.reject(error)
    }

    // Handle 401 Unauthorized - attempt token refresh
    if (error.response?.status === 401) {
      if (isRefreshing) {
        // Already refreshing - queue this request
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(token => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`
            }
            return apiClient(originalRequest)
          })
          .catch(err => {
            return Promise.reject(err)
          })
      }

      // Mark request as retried to prevent infinite loops
      originalRequest._retry = true
      isRefreshing = true

      try {
        // Call refresh token API (skip auth refresh for this call)
        const newAccessToken = await refreshTokenService()

        // Store new access token in Redux (uses setAccessToken for refresh flow)
        store.dispatch(setAccessToken(newAccessToken))

        // Update original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        }

        // Process queued requests
        processQueue(null, newAccessToken)

        // Retry original request
        return apiClient(originalRequest)
      } catch (refreshError) {
        // Refresh failed - process queue with error and logout
        processQueue(refreshError as Error, null)
        store.dispatch(clearToken())

        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)
