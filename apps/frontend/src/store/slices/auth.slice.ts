import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { decodeJWT, isTokenExpired, getRoleFromToken } from '@/lib/jwt'
import { STORAGE_KEYS } from '@/constants'

interface AuthState {
  token: string | null
  role: string | null
  isAuthenticated: boolean
}

// Load token from localStorage on initialization
function loadTokenFromStorage(): string | null {
  if (typeof window === 'undefined') {
    return null
  }
  return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
}

// Initialize state with token from localStorage
const initialToken = loadTokenFromStorage()
const initialState: AuthState = {
  token: initialToken,
  role: initialToken ? getRoleFromToken(initialToken) : null,
  isAuthenticated: initialToken ? !isTokenExpired(initialToken) : false,
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
    clearToken: (state) => {
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

export const { setToken, clearToken, checkTokenValidity } = authSlice.actions
export default authSlice.reducer

