import { useParams, useNavigate } from 'react-router-dom'
import { ErrorState } from '@/components/shared/ErrorState'
import { ROUTES } from '@/constants'

/**
 * ExamSetQuestionsPage - Page for managing questions in an exam set
 * Route: /admin/exams/:examId/sets/:setId/questions
 * TODO: Implement question assignment UI
 */
export function ExamSetQuestionsPage() {
  const { examId, setId } = useParams<{ examId: string; setId: string }>()
  const navigate = useNavigate()

  if (!examId || !setId) {
    return <ErrorState message="Exam ID or Set ID is missing." />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Manage Questions</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Assign questions to exam set sections
          </p>
        </div>
        <button
          onClick={() => navigate(ROUTES.ADMIN_EXAM_SETS.replace(':examId', examId))}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to Exam Sets
        </button>
      </div>
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-muted-foreground">Question assignment UI coming soon...</p>
      </div>
    </div>
  )
}

