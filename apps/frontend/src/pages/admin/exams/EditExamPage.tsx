import { useParams, useNavigate } from 'react-router-dom'
import { useExam, useUpdateExam } from '@/queries/exams.queries'
import { useSessions } from '@/queries/sessions.queries'
import { ExamForm } from './components/ExamForm'
import { LoadingState } from '@/components/shared/LoadingState'
import { ErrorState } from '@/components/shared/ErrorState'
import { ROUTES } from '@/constants'
import type { UpdateExamRequest } from '@/types/exam.types'

/**
 * EditExamPage - Page for editing an exam
 * Route: /admin/exams/:id/edit
 * Only DRAFT exams can be edited
 */
export function EditExamPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const updateExamMutation = useUpdateExam()
  const { data: sessionsData, isLoading: sessionsLoading } = useSessions({ limit: 1000 })

  const { data: exam, isLoading, isError, error } = useExam(id)

  const handleSubmit = (data: UpdateExamRequest) => {
    if (!id) return
    updateExamMutation.mutate({ id, data })
  }

  if (isLoading || sessionsLoading) {
    return <LoadingState message="Loading exam details..." />
  }

  if (isError) {
    return (
      <ErrorState
        message={error instanceof Error ? error.message : 'Failed to load exam'}
        onRetry={() => navigate(ROUTES.ADMIN_EXAMS)}
      />
    )
  }

  if (!exam) {
    return (
      <ErrorState
        message="Exam not found"
        onRetry={() => navigate(ROUTES.ADMIN_EXAMS)}
      />
    )
  }

  // Only DRAFT exams can be edited
  if (exam.isPublished) {
    return (
      <ErrorState
        message="Published exams cannot be edited. Please unpublish the exam first."
        onRetry={() => navigate(ROUTES.ADMIN_EXAMS)}
      />
    )
  }

  if (!sessionsData?.data || sessionsData.data.length === 0) {
    return (
      <ErrorState
        message="No recruitment sessions found. Please create a session first."
        onRetry={() => navigate(ROUTES.ADMIN_SESSIONS)}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          Edit Exam
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Update exam details (only draft exams can be edited)
        </p>
      </div>

      <div className="max-w-2xl">
        <ExamForm
          onSubmit={handleSubmit}
          isLoading={updateExamMutation.isPending}
          sessions={sessionsData.data}
          isEdit={true}
          defaultValues={{
            collegeSessionId: exam?.collegeSessionId || undefined,
            title: exam?.title,
            description: exam?.description || undefined,
            windowStartsAt: exam?.windowStartsAt ? new Date(exam.windowStartsAt).toISOString().slice(0, 16) : undefined,
            windowEndsAt: exam?.windowEndsAt ? new Date(exam.windowEndsAt).toISOString().slice(0, 16) : undefined,
            durationSeconds: exam?.durationSeconds,
            masterPassword: '', // Don't prefill password
          }}
        />
      </div>
    </div>
  )
}

