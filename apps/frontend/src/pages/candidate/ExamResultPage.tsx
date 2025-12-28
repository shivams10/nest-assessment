import { useNavigate, useParams } from 'react-router-dom'
import { useExamResult } from '@/hooks/queries/useExamRuntime'
import { ROUTES } from '@/constants'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { LoadingState } from '@/components/shared/LoadingState'
import { ErrorState } from '@/components/shared/ErrorState'

export function ExamResultPage() {
  const navigate = useNavigate()
  const { submissionId } = useParams<{ submissionId: string }>()

  const {
    data,
    isLoading,
    isError,
    error,
  } = useExamResult(submissionId)

  if (isLoading) {
    return <LoadingState message="Loading results..." />
  }

  if (isError) {
    return (
      <ErrorState
        message={error instanceof Error ? error.message : 'Failed to load results'}
      />
    )
  }

  if (!data) {
    return <ErrorState message="Result data not found" />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Exam Results</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your exam results and performance summary
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Total Marks</h3>
              <p className="mt-2 text-3xl font-bold text-primary">
                {data.totalMarks}
              </p>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Aptitude Marks:</span>
                <span className="font-medium">{data.aptitudeMarks}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Technical Marks:</span>
                <span className="font-medium">{data.technicalMarks}</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Rank</h3>
              <p className="mt-2 text-3xl font-bold text-primary">
                {data.rank ?? 'N/A'}
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Selected for Next Round:
                </span>
                <span
                  className={`rounded-md px-2 py-1 text-xs font-medium ${
                    data.selectedForNextRound
                      ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {data.selectedForNextRound ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button variant="outline" onClick={() => navigate(ROUTES.CANDIDATE_EXAMS)}>
          Back to Exams
        </Button>
      </div>
    </div>
  )
}

