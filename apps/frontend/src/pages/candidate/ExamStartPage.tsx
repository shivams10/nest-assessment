import { useParams } from 'react-router-dom'
import { useStartExam } from '@/hooks/queries/useExamAttempts'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { LoadingState } from '@/components/shared/LoadingState'
import { ErrorState } from '@/components/shared/ErrorState'

export function ExamStartPage() {
  const { examId } = useParams<{ examId: string }>()

  const startExamMutation = useStartExam()

  const handleStart = () => {
    if (examId) {
      startExamMutation.mutate({ examId })
    }
  }

  if (startExamMutation.isPending) {
    return <LoadingState message="Starting exam..." />
  }

  if (startExamMutation.isError) {
    return (
      <ErrorState
        message={
          startExamMutation.error instanceof Error
            ? startExamMutation.error.message
            : 'Failed to start exam'
        }
        onRetry={handleStart}
      />
    )
  }

  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <Card className="w-full max-w-md p-6">
        <div className="space-y-6 text-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Ready to Start?</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Once you start, the timer will begin. Make sure you're ready to begin the exam.
            </p>
          </div>
          <Button
            className="w-full"
            size="lg"
            onClick={handleStart}
            disabled={startExamMutation.isPending}
          >
            Start Exam
          </Button>
        </div>
      </Card>
    </div>
  )
}

