import { Component, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { formatError, logError } from '@/utils/errorFormatter'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * ErrorBoundary - Global React Error Boundary
 * Catches unexpected render/runtime errors
 * Does NOT handle API errors (those are handled by React Query)
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error using centralized formatter
    logError(error, 'ErrorBoundary')
    // Also log error info for debugging
    if (import.meta.env.DEV && typeof console !== 'undefined' && console.error) {
      console.error('ErrorBoundary error info:', errorInfo)
    }
  }

  handleReload = () => {
    window.location.reload()
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Format error for user display
      const formattedError = this.state.error
        ? formatError(this.state.error)
        : {
            title: 'Unexpected Error',
            message: 'Something went wrong. Please try reloading the page.',
            canRetry: true,
          }

      // Default fallback UI
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
                  aria-hidden="true"
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
                {formattedError.canRetry && (
                  <Button
                    variant="outline"
                    onClick={this.handleReset}
                    className="flex-1 sm:flex-initial"
                  >
                    Try Again
                  </Button>
                )}
                <Button onClick={this.handleReload} className="flex-1 sm:flex-initial">
                  Reload Page
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

