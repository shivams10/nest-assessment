import { useNavigate, useParams } from 'react-router-dom'
import { ROUTES } from '@/constants'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export function ExamSuccessPage() {
  const navigate = useNavigate()
  const { submissionId } = useParams<{ submissionId: string }>()

  const handleViewResult = () => {
    if (submissionId) {
      navigate(ROUTES.CANDIDATE_EXAM_RESULT.replace(':submissionId', submissionId))
    }
  }

  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <Card className="w-full max-w-md p-6">
        <div className="space-y-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <svg
              className="h-8 w-8 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Exam Submitted!</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Your exam has been successfully submitted. You can now view your results.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => navigate(ROUTES.CANDIDATE_EXAMS)}
            >
              Back to Exams
            </Button>
            <Button className="flex-1" onClick={handleViewResult}>
              View Results
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

