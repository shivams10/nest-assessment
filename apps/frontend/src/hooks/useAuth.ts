import { useAppSelector } from '@/store/hooks'

/**
 * useAuth - Hook to access authentication state
 * @returns Authentication state and helper functions
 */
export function useAuth() {
  const auth = useAppSelector((state) => state.auth)

  return {
    isAuthenticated: auth.isAuthenticated,
    token: auth.token,
    role: auth.role,
    /**
     * Check if user has a specific role
     */
    hasRole: (role: string): boolean => {
      return auth.role === role
    },
    /**
     * Check if user has one of the provided roles
     */
    hasAnyRole: (roles: string[]): boolean => {
      if (!auth.role) return false
      return roles.includes(auth.role)
    },
  }
}

