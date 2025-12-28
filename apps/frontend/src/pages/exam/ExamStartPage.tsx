import { useParams, useNavigate } from 'react-router-dom'
import { useExam } from '@/queries/examRuntime.queries'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { LoadingState } from '@/components/shared/LoadingState'
import { ErrorState } from '@/components/shared/ErrorState'

/**
 * ExamStartPage - Confirmation page before starting exam
 * Shows exam title, duration, and instructions
 * "Start Exam" button navigates to runtime
 */
export function ExamStartPage() {
  const { submissionId } = useParams<{ submissionId: string }>()
  const navigate = useNavigate()

  const { data, isLoading, isError, error } = useExam(submissionId)

  const handleStart = () => {
    if (submissionId) {
      navigate(`/exam/${submissionId}`, { replace: true })
    }
  }

  if (isLoading) {
    return <LoadingState message="Loading exam details..." />
  }

  if (isError) {
    return (
      <ErrorState
        message={error instanceof Error ? error.message : 'Failed to load exam'}
      />
    )
  }

  if (!data) {
    return <ErrorState message="Exam data not found" />
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes} minutes`
  }

  // Get duration from exam data if available
  // Note: Backend should return duration in exam runtime response
  // For now, use a default if not available
  const durationSeconds = data.durationSeconds || 3600 // Default 1 hour
  const duration = Math.floor(durationSeconds / 60)

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl p-6 sm:p-8">
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
              {data.examTitle || data.examSetName || 'Exam'}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Please read the instructions carefully before starting
            </p>
          </div>

          <div className="space-y-4 rounded-md border border-border bg-muted/50 p-4">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Duration:
              </span>
              <span className="text-sm font-semibold text-foreground">
                {formatDuration(duration * 60)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Questions:
              </span>
              <span className="text-sm font-semibold text-foreground">
                {data.sections.reduce((acc, section) => acc + section.questions.length, 0)}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">
              Instructions
            </h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="mt-1">•</span>
                <span>
                  Read each question carefully before selecting your answer
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1">•</span>
                <span>
                  You can save your answers at any time using the "Save" button
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1">•</span>
                <span>
                  Once you submit the exam, you cannot make any changes
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1">•</span>
                <span>
                  The exam will auto-submit when time expires
                </span>
              </li>
            </ul>
          </div>

          <Button
            className="w-full"
            size="lg"
            onClick={handleStart}
          >
            Start Exam
          </Button>
        </div>
      </Card>
    </div>
  )
}

