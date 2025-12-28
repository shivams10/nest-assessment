/**
 * Storage Constants
 * All localStorage/sessionStorage keys should be defined here
 * Use these constants instead of hardcoding storage keys
 */

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  // Add more storage keys here as needed
  // USER_PREFERENCES: 'user_preferences',
  // THEME: 'theme',
} as const

/**
 * Type for storage keys
 */
export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS]

