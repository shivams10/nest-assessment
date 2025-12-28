import { useRef, useCallback } from 'react'
import type { UseMutationResult } from '@tanstack/react-query'

/**
 * useDebouncedMutation - Hook for debouncing mutation calls
 * Useful for auto-saving answers
 */
export function useDebouncedMutation<TData, TVariables>(
  mutation: UseMutationResult<TData, Error, TVariables>,
  delay = 500,
) {
  const timeoutRef = useRef<number | null>(null)

  const debouncedMutate = useCallback(
    (variables: TVariables) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = window.setTimeout(() => {
        mutation.mutate(variables)
        timeoutRef.current = null
      }, delay)
    },
    [mutation, delay],
  )

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  return {
    debouncedMutate,
    cancel,
    isPending: mutation.isPending,
  }
}

