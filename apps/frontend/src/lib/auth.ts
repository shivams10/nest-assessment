/**
 * Authentication Helper Functions
 * Utilities for managing authentication state
 */

import { store } from '@/store/store'
import {
  setToken,
  setAccessToken,
  clearToken,
  logout,
  checkTokenValidity,
} from '@/store/slices/auth.slice'
import { isTokenExpired } from './jwt'

/**
 * Sets the authentication token in Redux store and localStorage
 * Use this for initial login - validates token expiration
 * @param token - JWT token string
 */
export function setAuthToken(token: string): void {
  store.dispatch(setToken(token))
}

/**
 * Sets a new access token during refresh flow
 * Use this for token refresh - maintains auth state consistency
 * @param token - JWT access token string
 */
export function setRefreshToken(token: string): void {
  store.dispatch(setAccessToken(token))
}

/**
 * Clears the authentication token from Redux store and localStorage
 * Use this for clearing tokens during errors or token expiration
 */
export function clearAuthToken(): void {
  store.dispatch(clearToken())
}

/**
 * Logs out the user - safely clears all authentication state
 * Use this for explicit logout actions
 */
export function logoutUser(): void {
  store.dispatch(logout())
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

