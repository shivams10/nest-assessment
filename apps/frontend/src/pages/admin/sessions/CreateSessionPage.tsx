import { useNavigate } from 'react-router-dom'
import { useCreateSession } from '@/queries/sessions.queries'
import { SessionForm } from './components/SessionForm'
import { ErrorState } from '@/components/shared/ErrorState'
import { ROUTES } from '@/constants'
import type { CreateSessionRequest } from '@/types/session.types'

/**
 * CreateSessionPage - Page for creating a new recruitment session
 * Route: /admin/sessions/new
 */
export function CreateSessionPage() {
  const navigate = useNavigate()
  const createSessionMutation = useCreateSession()

  const handleSubmit = (data: CreateSessionRequest) => {
    createSessionMutation.mutate(data)
  }


  if (createSessionMutation.isError) {
    return (
      <ErrorState
        message={
          createSessionMutation.error instanceof Error
            ? createSessionMutation.error.message
            : 'Failed to create session'
        }
        onRetry={() => navigate(ROUTES.ADMIN_SESSIONS)}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          Create Recruitment Session
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Create a new recruitment session to organize exams
        </p>
      </div>

      <div className="max-w-2xl">
        <SessionForm
          onSubmit={handleSubmit}
          isLoading={createSessionMutation.isPending}
        />
      </div>
    </div>
  )
}
