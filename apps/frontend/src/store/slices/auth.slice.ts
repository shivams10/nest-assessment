import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { decodeJWT, isTokenExpired, getRoleFromToken } from '@/lib/jwt'
import { STORAGE_KEYS } from '@/constants'

interface AuthState {
  token: string | null
  role: string | null
  isAuthenticated: boolean
}

/**
 * Load and validate token from localStorage on initialization
 * - Reads accessToken from storage
 * - Validates token is not expired
 * - Clears expired tokens immediately (no automatic refresh on load)
 * - Returns null if token is missing or expired
 */
function loadTokenFromStorage(): string | null {
  if (typeof window === 'undefined') {
    return null
  }

  const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
  
  // If no token, return null
  if (!token) {
    return null
  }

  // If token is expired, clear it from storage and return null
  // Interceptor will handle refresh on actual API calls, not on app load
  if (isTokenExpired(token)) {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
    return null
  }

  return token
}

// Initialize state with token from localStorage
// Token is already validated (not expired) by loadTokenFromStorage
const initialToken = loadTokenFromStorage()
const initialState: AuthState = {
  token: initialToken,
  role: initialToken ? getRoleFromToken(initialToken) : null,
  // If we have a token at this point, it's valid (not expired)
  isAuthenticated: initialToken !== null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<string>) => {
      const token = action.payload
      const decoded = decodeJWT(token)

      // Validate token before setting
      if (!decoded || isTokenExpired(token)) {
        return
      }

      state.token = token
      state.role = getRoleFromToken(token)
      state.isAuthenticated = true

      // Persist to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token)
      }
    },
    setAccessToken: (state, action: PayloadAction<string>) => {
      const token = action.payload
      const decoded = decodeJWT(token)

      // During refresh, we trust the new token from the server
      // Only validate that it can be decoded, not expiration (server handles that)
      if (!decoded) {
        // If token can't be decoded, don't update state to maintain consistency
        return
      }

      // Atomically update token and role to maintain state consistency during refresh
      state.token = token
      state.role = getRoleFromToken(token)
      // Keep isAuthenticated true during refresh (we're already authenticated)
      state.isAuthenticated = true

      // Persist to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token)
      }
    },
    clearToken: (state) => {
      // Safely clear all auth state
      state.token = null
      state.role = null
      state.isAuthenticated = false

      // Remove from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
      }
    },
    logout: (state) => {
      // Explicit logout action - ensures complete state cleanup
      // This is a safe wrapper around clearToken for explicit logout flows
      state.token = null
      state.role = null
      state.isAuthenticated = false

      // Remove from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
      }
    },
    checkTokenValidity: (state) => {
      if (!state.token) {
        state.isAuthenticated = false
        return
      }

      if (isTokenExpired(state.token)) {
        // Token expired, clear it
        state.token = null
        state.role = null
        state.isAuthenticated = false

        if (typeof window !== 'undefined') {
          localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
        }
      } else {
        // Token is still valid, ensure role is set
        state.role = getRoleFromToken(state.token)
        state.isAuthenticated = true
      }
    },
  },
})

export const { setToken, setAccessToken, clearToken, logout, checkTokenValidity } =
  authSlice.actions
export default authSlice.reducer

