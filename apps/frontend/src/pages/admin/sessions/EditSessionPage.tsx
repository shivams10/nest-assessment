import { useParams, useNavigate } from 'react-router-dom'
import { useSession, useUpdateSession } from '@/queries/sessions.queries'
import { SessionForm } from './components/SessionForm'
import { LoadingState } from '@/components/shared/LoadingState'
import { ErrorState } from '@/components/shared/ErrorState'
import { ROUTES } from '@/constants'
import type { UpdateSessionRequest } from '@/types/session.types'

/**
 * EditSessionPage - Page for editing a recruitment session
 * Route: /admin/sessions/:id/edit
 */
export function EditSessionPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const updateSessionMutation = useUpdateSession()

  const { data: session, isLoading, isError, error } = useSession(id)

  const handleSubmit = (data: UpdateSessionRequest) => {
    if (!id) return
    updateSessionMutation.mutate({ id, data })
  }

  if (isLoading) {
    return <LoadingState message="Loading session..." />
  }

  if (isError) {
    return (
      <ErrorState
        message={error instanceof Error ? error.message : 'Failed to load session'}
        onRetry={() => navigate(ROUTES.ADMIN_SESSIONS)}
      />
    )
  }

  if (!session) {
    return (
      <ErrorState
        message="Session not found"
        onRetry={() => navigate(ROUTES.ADMIN_SESSIONS)}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          Edit Recruitment Session
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Update recruitment session details
        </p>
      </div>

      <div className="max-w-2xl">
        <SessionForm
          onSubmit={handleSubmit}
          isLoading={updateSessionMutation.isPending}
          isEdit={true}
          defaultValues={{
            name: session?.name,
            year: session?.year,
            startDate: session?.startDate || undefined,
            endDate: session?.endDate || undefined,
          }}
        />
      </div>
    </div>
  )
}

