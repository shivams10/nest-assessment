import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSessions } from '@/queries/sessions.queries'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingState } from '@/components/shared/LoadingState'
import { ErrorState } from '@/components/shared/ErrorState'
import { EmptyState } from '@/components/shared/EmptyState'
import { SessionsTable } from './components/SessionsTable'
import { ROUTES } from '@/constants'

/**
 * AdminSessionsPage - Admin recruitment sessions management page
 * Route: /admin/sessions
 */
export function AdminSessionsPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)

  const { data, isLoading, isError, error, refetch } = useSessions({
    page,
    limit: 10,
  })

  if (isLoading) {
    return <LoadingState message="Loading sessions..." />
  }

  if (isError) {
    return (
      <ErrorState
        message={error instanceof Error ? error.message : 'Failed to load sessions'}
        onRetry={() => refetch()}
      />
    )
  }

  if (!data || data.data.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Recruitment Sessions</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Manage recruitment sessions for organizing exams
            </p>
          </div>
          <Button onClick={() => navigate(ROUTES.ADMIN_SESSIONS_NEW)}>
            Create Session
          </Button>
        </div>
        <EmptyState
          title="No sessions found"
          description="Create your first recruitment session to get started."
        />
      </div>
    )
  }

  const totalPages = Math.ceil(data.total / data.limit)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Recruitment Sessions</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage recruitment sessions for organizing exams
          </p>
        </div>
        <Button onClick={() => navigate(ROUTES.ADMIN_SESSIONS_NEW)}>
          Create Session
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <SessionsTable sessions={data.data} isLoading={isLoading} />

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
