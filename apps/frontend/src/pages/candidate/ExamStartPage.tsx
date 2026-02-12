import { useParams, useNavigate } from 'react-router-dom'
import { useStartExam } from '@/hooks/queries/useExamAttempts'
import { useExams } from '@/hooks/queries/useExams'
import { ROUTES } from '@/constants'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { LoadingState } from '@/components/shared/LoadingState'
import { ErrorState } from '@/components/shared/ErrorState'
import { useEffect } from 'react'

export function ExamStartPage() {
  const { examId } = useParams<{ examId: string }>()
  const navigate = useNavigate()

  const { data: examsData, isLoading: examsLoading } = useExams({ page: 1, limit: 100 }, false)
  const startExamMutation = useStartExam()

  const exam = examsData?.data?.find((e) => e.id === examId)
  const alreadySubmitted = Boolean(exam?.submittedAt && exam?.submissionId)

  useEffect(() => {
    if (alreadySubmitted && exam?.submissionId) {
      navigate(ROUTES.CANDIDATE_EXAM_RESULT.replace(':submissionId', exam.submissionId), {
        replace: true,
      })
    }
  }, [alreadySubmitted, exam?.submissionId, navigate])

  const handleStart = () => {
    if (examId) {
      startExamMutation.mutate({ examId })
    }
  }

  if (examId && examsLoading) {
    return <LoadingState message="Loading..." />
  }

  if (examsData && examId && !exam) {
    return (
      <ErrorState
        message="Exam not found or you are not assigned to this exam."
        onRetry={() => navigate(ROUTES.CANDIDATE_EXAMS)}
      />
    )
  }

  if (alreadySubmitted) {
    return <LoadingState message="Redirecting to your result..." />
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

