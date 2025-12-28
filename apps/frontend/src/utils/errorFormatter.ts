/**
 * Error Formatter Utility
 * Centralized error formatting for user-facing messages
 * No raw backend errors exposed to users
 */

interface FormattedError {
  title: string
  message: string
  canRetry: boolean
}

/**
 * Format error for user display
 * Converts technical errors to friendly messages
 */
export function formatError(error: unknown): FormattedError {
  // Handle Error objects
  if (error instanceof Error) {
    const message = error.message.toLowerCase()

    // Network errors
    if (message.includes('network') || message.includes('fetch')) {
      return {
        title: 'Connection Error',
        message: 'Unable to connect to the server. Please check your internet connection and try again.',
        canRetry: true,
      }
    }

    // Timeout errors
    if (message.includes('timeout')) {
      return {
        title: 'Request Timeout',
        message: 'The request took too long to complete. Please try again.',
        canRetry: true,
      }
    }

    // 401 Unauthorized
    if (message.includes('unauthorized') || message.includes('401')) {
      return {
        title: 'Authentication Required',
        message: 'Your session has expired. Please log in again.',
        canRetry: false,
      }
    }

    // 403 Forbidden
    if (message.includes('forbidden') || message.includes('403')) {
      return {
        title: 'Access Denied',
        message: 'You do not have permission to access this resource.',
        canRetry: false,
      }
    }

    // 404 Not Found
    if (message.includes('not found') || message.includes('404')) {
      return {
        title: 'Not Found',
        message: 'The requested resource could not be found.',
        canRetry: false,
      }
    }

    // 500 Server Error
    if (message.includes('server error') || message.includes('500')) {
      return {
        title: 'Server Error',
        message: 'Something went wrong on our end. Please try again later.',
        canRetry: true,
      }
    }

    // Generic error with message
    return {
      title: 'Error',
      message: error.message || 'An unexpected error occurred.',
      canRetry: true,
    }
  }

  // Handle error objects with status
  if (error && typeof error === 'object' && 'status' in error) {
    const status = (error as { status?: number }).status

    if (status === 401) {
      return {
        title: 'Authentication Required',
        message: 'Your session has expired. Please log in again.',
        canRetry: false,
      }
    }

    if (status === 403) {
      return {
        title: 'Access Denied',
        message: 'You do not have permission to access this resource.',
        canRetry: false,
      }
    }

    if (status === 404) {
      return {
        title: 'Not Found',
        message: 'The requested resource could not be found.',
        canRetry: false,
      }
    }

    if (status === 500) {
      return {
        title: 'Server Error',
        message: 'Something went wrong on our end. Please try again later.',
        canRetry: true,
      }
    }
  }

  // Handle string errors
  if (typeof error === 'string') {
    return {
      title: 'Error',
      message: error,
      canRetry: true,
    }
  }

  // Unknown error
  return {
    title: 'Unexpected Error',
    message: 'An unexpected error occurred. Please try again.',
    canRetry: true,
  }
}

/**
 * Log error for debugging (without exposing to user)
 * In production, this would send to error tracking service
 */
export function logError(error: unknown, context?: string): void {
  // Only log in development
  if (import.meta.env.DEV) {
    const contextMsg = context ? `[${context}] ` : ''
    if (error instanceof Error) {
      // Development-only logging
      if (typeof console !== 'undefined' && console.error) {
        console.error(`${contextMsg}Error:`, error.message, error.stack)
      }
    } else {
      if (typeof console !== 'undefined' && console.error) {
        console.error(`${contextMsg}Error:`, error)
      }
    }
  }
}

