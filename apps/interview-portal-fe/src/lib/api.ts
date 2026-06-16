import axios from 'axios'

import { BACKEND_URL } from '@/constants/env'
import { accessTokenStore, refreshTokenStore, tokenStorage } from '@/lib/token'
import { ROUTES } from '@/constants/routes'

export const api = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true, // send cookies (signature halves) with every request
})

// Recombine header.payload (localStorage) + signature (cookie) → Bearer token
api.interceptors.request.use((config) => {
  const token = accessTokenStore.get()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// --- Token refresh logic ---
type FailedRequest = {
  resolve: (token: string) => void
  reject:  (err: unknown) => void
}

let isRefreshing     = false
let failedQueue: FailedRequest[] = []

const flushQueue = (err: unknown, token: string | null = null): void => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (err) reject(err)
    else if (token) resolve(token)
  })
  failedQueue = []
}

api.interceptors.response.use(
  (res) => res,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) return Promise.reject(error)

    const originalRequest = error.config
    if (!originalRequest || error.response?.status !== 401) return Promise.reject(error)

    // Avoid infinite retry loop
    if ((originalRequest as typeof originalRequest & { _retry?: boolean })._retry) {
      return Promise.reject(error)
    }
    (originalRequest as typeof originalRequest & { _retry?: boolean })._retry = true

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      }).then((newToken) => {
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return api(originalRequest)
      })
    }

    isRefreshing = true

    try {
      const refreshToken = refreshTokenStore.get()
      if (!refreshToken) throw new Error('no refresh token')

      // Send combined refresh token in Authorization header.
      // Backend returns { accessBody } and sets a new ip_access_sig cookie.
      const { data } = await axios.post<{ accessBody: string }>(
        `${BACKEND_URL}/auth/refresh`,
        {},
        {
          headers:          { Authorization: `Bearer ${refreshToken}` },
          withCredentials:  true,
        },
      )

      accessTokenStore.setBody(data.accessBody)

      const newToken = accessTokenStore.get()
      if (!newToken) throw new Error('failed to reconstruct access token')

      flushQueue(null, newToken)
      originalRequest.headers.Authorization = `Bearer ${newToken}`
      return api(originalRequest)
    } catch (err) {
      flushQueue(err)
      tokenStorage.clearAll()
      window.location.href = `${ROUTES.LOGIN}?error=invalid_token`
      return Promise.reject(err)
    } finally {
      isRefreshing = false
    }
  },
)
