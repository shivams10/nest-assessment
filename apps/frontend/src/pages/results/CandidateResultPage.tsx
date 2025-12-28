import { useParams, useNavigate } from 'react-router-dom'
import { useCandidateResult } from '@/queries/results.queries'
import { ResultSummaryCard } from './components/ResultSummaryCard'
import { LoadingState } from '@/components/shared/LoadingState'
import { ErrorState } from '@/components/shared/ErrorState'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/constants'

/**
 * CandidateResultPage - Displays exam result for candidate
 * Route: /submissions/:submissionId/result
 * Read-only page showing marks, rank, and selection status
 */
export function CandidateResultPage() {
  const { submissionId } = useParams<{ submissionId: string }>()
  const navigate = useNavigate()

  const { data, isLoading, isError, error } = useCandidateResult(submissionId)

  if (isLoading) {
    return <LoadingState message="Loading your results..." />
  }

  if (isError) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to load results'
    
    // Handle specific error cases
    if (error instanceof Error && 'status' in error) {
      const status = (error as { status?: number }).status
      if (status === 403) {
        return (
          <ErrorState
            message="You don't have permission to view this result"
            onRetry={() => window.location.reload()}
          />
        )
      }
      if (status === 404) {
        return (
          <ErrorState
            message="Result not found. The exam may not have been evaluated yet."
            onRetry={() => window.location.reload()}
          />
        )
      }
    }

    return (
      <ErrorState
        message={errorMessage}
        onRetry={() => window.location.reload()}
      />
    )
  }

  if (!data) {
    return (
      <ErrorState
        message="Result data not available. The exam may not have been evaluated yet."
        onRetry={() => window.location.reload()}
      />
    )
  }

  return (
    <div className="container mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            Exam Results
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your exam performance and selection status
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate(ROUTES.CANDIDATE_EXAMS)}
        >
          Back to Exams
        </Button>
      </div>

      <ResultSummaryCard result={data} />
    </div>
  )
}

