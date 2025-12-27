import axios from 'axios'
import type { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { store } from '@/store/store'
import { clearToken } from '@/store/slices/auth.slice'

// Create axios instance with default config
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - adds Authorization header from Redux store
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const state = store.getState()
    const token = state.auth.token

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - handles 401 errors and clears token
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle 401 Unauthorized - clear token and redirect if needed
    if (error.response?.status === 401) {
      store.dispatch(clearToken())
    }

    return Promise.reject(error)
  }
)

