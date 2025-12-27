/**
 * Authentication Helper Functions
 * Utilities for managing authentication state
 */

import { store } from '@/store/store'
import { setToken, clearToken, checkTokenValidity } from '@/store/slices/auth.slice'
import { isTokenExpired } from './jwt'

/**
 * Sets the authentication token in Redux store and localStorage
 * @param token - JWT token string
 */
export function setAuthToken(token: string): void {
  store.dispatch(setToken(token))
}

/**
 * Clears the authentication token from Redux store and localStorage
 */
export function clearAuthToken(): void {
  store.dispatch(clearToken())
}

/**
 * Checks if the current token is valid and updates auth state
 * Clears token if expired
 */
export function validateAuthToken(): void {
  store.dispatch(checkTokenValidity())
}

/**
 * Gets the current authentication token from Redux store
 * @returns Token string or null
 */
export function getAuthToken(): string | null {
  return store.getState().auth.token
}

/**
 * Gets the current user role from Redux store
 * @returns Role string or null
 */
export function getAuthRole(): string | null {
  return store.getState().auth.role
}

/**
 * Checks if user is currently authenticated
 * @returns true if authenticated, false otherwise
 */
export function isAuthenticated(): boolean {
  const state = store.getState().auth
  if (!state.token) {
    return false
  }

  // Double-check token expiration
  if (isTokenExpired(state.token)) {
    clearAuthToken()
    return false
  }

  return state.isAuthenticated
}

/**
 * Checks if user has a specific role
 * @param role - Role to check for
 * @returns true if user has the role, false otherwise
 */
export function hasRole(role: string): boolean {
  const userRole = getAuthRole()
  return userRole === role
}

