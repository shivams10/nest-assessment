import { useNavigate } from 'react-router-dom'
import { useExams } from '@/hooks/queries/useExams'
import { ROUTES } from '@/constants'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { LoadingState } from '@/components/shared/LoadingState'
import { ErrorState } from '@/components/shared/ErrorState'
import { EmptyState } from '@/components/shared/EmptyState'

export function ExamListPage() {
  const navigate = useNavigate()

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useExams({ page: 1, limit: 20 }, false)

  if (isLoading) {
    return <LoadingState message="Loading exams..." />
  }

  if (isError) {
    return (
      <ErrorState
        message={error instanceof Error ? error.message : 'Failed to load exams'}
        onRetry={() => refetch()}
      />
    )
  }

  if (!data || data.data.length === 0) {
    return (
      <EmptyState
        title="No exams available"
        description="There are no published exams at the moment."
      />
    )
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not specified'
    return new Date(dateString).toLocaleString()
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Available Exams</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Select an exam to begin
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.data.map((exam) => (
          <Card key={exam.id} className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  {exam.title}
                </h3>
                {exam.description && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {exam.description}
                  </p>
                )}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-medium">{formatDuration(exam.durationSeconds)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Window Start:</span>
                  <span className="font-medium">{formatDate(exam.windowStartsAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Window End:</span>
                  <span className="font-medium">{formatDate(exam.windowEndsAt)}</span>
                </div>
              </div>

              <Button
                className="w-full"
                onClick={() => navigate(ROUTES.CANDIDATE_EXAM_START.replace(':examId', exam.id))}
              >
                Start Exam
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

