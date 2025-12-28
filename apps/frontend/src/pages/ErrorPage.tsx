import { useRouteError, isRouteErrorResponse, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { formatError } from '@/utils/errorFormatter'

/**
 * ErrorPage - Route-level error UI
 * Handles errors thrown by React Router (loaders, actions, etc.)
 * Uses useRouteError() to access error information
 */
export function ErrorPage() {
  const error = useRouteError()
  const navigate = useNavigate()

  // Format error using centralized formatter
  let formattedError = formatError(error)

  if (isRouteErrorResponse(error)) {
    // Override with status-specific formatting
    const errorMessage =
      error.statusText ||
      (error.data && typeof error.data === 'object' && 'message' in error.data
        ? String(error.data.message)
        : undefined) ||
      error.status.toString()
    formattedError = formatError({
      ...error,
      message: errorMessage,
    })
  }

  const handleReload = () => {
    window.location.reload()
  }

  const handleGoHome = () => {
    navigate('/')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-6">
        <div className="space-y-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <svg
              className="h-8 w-8 text-destructive"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              {formattedError.title}
            </h1>
            <p className="text-sm text-muted-foreground">
              {formattedError.message}
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button
              variant="outline"
              onClick={handleGoHome}
              className="flex-1 sm:flex-initial"
            >
              Go Home
            </Button>
            {formattedError.canRetry && (
              <Button onClick={handleReload} className="flex-1 sm:flex-initial">
                Reload Page
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}

