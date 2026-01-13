import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useExamSets, useCreateExamSet, useDeleteExamSet } from '@/queries/examSets.queries'
import { useExam, useExamReadiness } from '@/queries/exams.queries'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { LoadingState } from '@/components/shared/LoadingState'
import { ErrorState } from '@/components/shared/ErrorState'
import { EmptyState } from '@/components/shared/EmptyState'
import { ReadinessPanel } from '@/components/shared/ReadinessPanel'
import { ExamSetsTable } from './components/ExamSetsTable'
import { CreateExamSetDialog } from './components/CreateExamSetDialog'
import { ROUTES } from '@/constants'

/**
 * AdminExamSetsPage - Admin exam sets management page
 * Route: /admin/exams/:examId/sets
 */
export function AdminExamSetsPage() {
  const { examId } = useParams<{ examId: string }>()
  const navigate = useNavigate()
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const { data: exam, isLoading: examLoading } = useExam(examId)
  const { data, isLoading, isError, error, refetch } = useExamSets(
    { examId: examId || '' },
    { enabled: !!examId },
  )
  const {
    data: readinessData,
    isLoading: readinessLoading,
    refetch: refetchReadiness,
  } = useExamReadiness(examId)

  const createExamSetMutation = useCreateExamSet()
  const deleteExamSetMutation = useDeleteExamSet()

  // Refetch readiness when sets or sections change
  useEffect(() => {
    if (createExamSetMutation.isSuccess || deleteExamSetMutation.isSuccess) {
      refetchReadiness()
      refetch() // Also refetch exam sets to show new sections
    }
  }, [createExamSetMutation.isSuccess, deleteExamSetMutation.isSuccess, refetchReadiness, refetch])

  const handleSectionCreated = () => {
    refetch()
    refetchReadiness()
  }

  const handleCreate = (name: string) => {
    if (!examId) return
    createExamSetMutation.mutate(
      { examId, name },
      {
        onSuccess: () => {
          setShowCreateDialog(false)
        },
      },
    )
  }

  const handleDelete = (setId: string) => {
    if (!examId) return
    deleteExamSetMutation.mutate({ setId, examId })
  }

  if (!examId) {
    return <ErrorState message="Exam ID is missing." />
  }

  if (examLoading) {
    return <LoadingState message="Loading exam details..." />
  }

  if (isError) {
    return (
      <ErrorState
        message={error instanceof Error ? error.message : 'Failed to load exam sets'}
        onRetry={() => refetch()}
      />
    )
  }

  const isPublished = exam?.isPublished ?? false

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Exam Sets</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {exam?.title ? `Manage exam sets for: ${exam.title}` : 'Manage exam sets'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(ROUTES.ADMIN_EXAMS)}
          >
            Back to Exams
          </Button>
          {!isPublished && (
            <Button onClick={() => setShowCreateDialog(true)}>
              Create Exam Set
            </Button>
          )}
        </div>
      </div>

      {isPublished && (
        <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
          <CardContent className="pt-6">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              This exam is published. Exam sets cannot be modified.
            </p>
          </CardContent>
        </Card>
      )}

      {!isPublished && examId && (
        <ReadinessPanel
          isReady={readinessData?.isReady ?? false}
          reasons={readinessData?.reasons ?? []}
          isLoading={readinessLoading}
        />
      )}

      {!data || !data.items || data.items.length === 0 ? (
        <EmptyState
          title="No exam sets found"
          description={
            isPublished
              ? 'This exam has no exam sets.'
              : 'Create your first exam set to get started.'
          }
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <ExamSetsTable
              examSets={data.items}
              isLoading={isLoading}
              onDelete={handleDelete}
              isDeleting={deleteExamSetMutation.isPending}
              isPublished={isPublished}
              onSectionCreated={handleSectionCreated}
            />
          </CardContent>
        </Card>
      )}

      {showCreateDialog && (
        <CreateExamSetDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onSubmit={handleCreate}
          isLoading={createExamSetMutation.isPending}
        />
      )}
    </div>
  )
}

