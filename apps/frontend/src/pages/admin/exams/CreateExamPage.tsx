import { useNavigate } from 'react-router-dom'
import { useCreateExam } from '@/queries/exams.queries'
import { useSessions } from '@/queries/sessions.queries'
import { ExamForm } from './components/ExamForm'
import { LoadingState } from '@/components/shared/LoadingState'
import { ErrorState } from '@/components/shared/ErrorState'
import { ROUTES } from '@/constants'
import type { CreateExamRequest, UpdateExamRequest } from '@/types/exam.types'

/**
 * CreateExamPage - Page for creating a new exam
 * Route: /admin/exams/new
 */
export function CreateExamPage() {
  const navigate = useNavigate()
  const createExamMutation = useCreateExam()
  const { data: sessionsData, isLoading: sessionsLoading } = useSessions({ limit: 1000 })

  const handleSubmit = (data: CreateExamRequest | UpdateExamRequest) => {
    createExamMutation.mutate(data as CreateExamRequest)
  }

  if (sessionsLoading) {
    return <LoadingState message="Loading sessions..." />
  }

  if (!sessionsData || !sessionsData.data || sessionsData.data.length === 0) {
    return (
      <ErrorState
        message="No recruitment sessions found. Please create a session first."
        onRetry={() => navigate(ROUTES.ADMIN_SESSIONS)}
      />
    )
  }

  if (createExamMutation.isError) {
    return (
      <ErrorState
        message={
          createExamMutation.error instanceof Error
            ? createExamMutation.error.message
            : 'Failed to create exam'
        }
        onRetry={() => navigate(ROUTES.ADMIN_EXAMS)}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          Create Exam
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Create a new exam for a recruitment session
        </p>
      </div>

      <div className="max-w-2xl">
        <ExamForm
          onSubmit={handleSubmit}
          isLoading={createExamMutation.isPending}
          sessions={sessionsData?.data || []}
        />
      </div>
    </div>
  )
}
