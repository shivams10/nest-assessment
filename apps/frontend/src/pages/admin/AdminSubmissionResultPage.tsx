import { useParams, useNavigate } from 'react-router-dom'
import { useAdminSubmissionResult } from '@/queries/results.queries'
import { ResultSummaryCard } from '@/pages/results/components/ResultSummaryCard'
import { LoadingState } from '@/components/shared/LoadingState'
import { ErrorState } from '@/components/shared/ErrorState'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/constants'

/**
 * AdminSubmissionResultPage - Displays exam result for a submission (admin/moderator view)
 * Route: /admin/submissions/:submissionId/result
 */
export function AdminSubmissionResultPage() {
  const { submissionId } = useParams<{ submissionId: string }>()
  const navigate = useNavigate()

  const { data, isLoading, isError, error } = useAdminSubmissionResult(submissionId ?? undefined)

  if (isLoading) {
    return <LoadingState message="Loading result..." />
  }

  if (isError) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to load result'
    return (
      <ErrorState
        message={errorMessage}
        onRetry={() => navigate(ROUTES.ADMIN_CANDIDATES)}
      />
    )
  }

  if (!data) {
    return (
      <ErrorState
        message="Result not available for this submission."
        onRetry={() => navigate(ROUTES.ADMIN_CANDIDATES)}
      />
    )
  }

  return (
    <div className="container mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            Candidate Result
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Exam result for this submission
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate(ROUTES.ADMIN_CANDIDATES)}
        >
          Back to Candidates
        </Button>
      </div>

      <ResultSummaryCard result={data} />
    </div>
  )
}
