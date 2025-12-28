import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminExams, usePublishExam, useUnpublishExam } from '@/queries/exams.queries'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { LoadingState } from '@/components/shared/LoadingState'
import { ErrorState } from '@/components/shared/ErrorState'
import { EmptyState } from '@/components/shared/EmptyState'
import { ExamsTable } from './components/ExamsTable'
import { ROUTES } from '@/constants'

/**
 * AdminExamsPage - Admin exams management page
 * Route: /admin/exams
 */
export function AdminExamsPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [sessionFilter, setSessionFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<'draft' | 'published' | undefined>(
    undefined,
  )

  const { data, isLoading, isError, error, refetch } = useAdminExams({
    page,
    limit: 10,
    collegeSessionId: sessionFilter || undefined,
    status: statusFilter,
  })

  const publishExamMutation = usePublishExam()
  const unpublishExamMutation = useUnpublishExam()

  const handlePublish = (examId: string) => {
    publishExamMutation.mutate(examId)
  }

  const handleUnpublish = (examId: string) => {
    unpublishExamMutation.mutate(examId)
  }

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

  if (!data || !data.data || data.data.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Exam Management</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Create and manage exams, exam sets, and questions
            </p>
          </div>
          <Button onClick={() => navigate(ROUTES.ADMIN_EXAMS_NEW)}>
            Create Exam
          </Button>
        </div>
        <EmptyState
          title="No exams found"
          description="Create your first exam to get started."
        />
      </div>
    )
  }

  const totalPages = data.limit > 0 ? Math.ceil(data.total / data.limit) : 1

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Exam Management</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Create and manage exams, exam sets, and questions
          </p>
        </div>
        <Button onClick={() => navigate(ROUTES.ADMIN_EXAMS_NEW)}>
          Create Exam
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Filter by Session ID</label>
              <Input
                placeholder="Enter session ID"
                value={sessionFilter}
                onChange={(e) => {
                  setSessionFilter(e.target.value)
                  setPage(1)
                }}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Filter by Status</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={statusFilter || ''}
                onChange={(e) => {
                  setStatusFilter(
                    e.target.value === '' ? undefined : (e.target.value as 'draft' | 'published'),
                  )
                  setPage(1)
                }}
              >
                <option value="">All</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Exams</CardTitle>
        </CardHeader>
        <CardContent>
          <ExamsTable
            exams={data.data}
            isLoading={isLoading}
            onPublish={handlePublish}
            onUnpublish={handleUnpublish}
            isPublishing={publishExamMutation.isPending}
            isUnpublishing={unpublishExamMutation.isPending}
          />

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
