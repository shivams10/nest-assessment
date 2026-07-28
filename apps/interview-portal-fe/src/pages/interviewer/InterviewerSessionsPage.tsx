import { CalendarIcon } from '@/components/icons'
import { EmptyState, LoadingSpinner, PageHeader } from '@/components/ui'
import { useSessions } from '@/hooks/useSessions'

const STATUS_LABEL: Record<string, string> = {
  scheduled:   'Scheduled',
  in_progress: 'In Progress',
  completed:   'Completed',
  cancelled:   'Cancelled',
}

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

export const InterviewerSessionsPage = () => {
  const { data: sessions, isLoading } = useSessions()

  return (
    <>
      <PageHeader title="Sessions" description="Your assigned interview sessions" />

      {isLoading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : !sessions || sessions.length === 0 ? (
        <EmptyState
          icon={<CalendarIcon size={24} />}
          title="No sessions assigned"
          description="Sessions assigned to you by the recruitment team will appear here."
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <div className="grid grid-cols-4 border-b border-border bg-surface-subtle px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-content-muted">
            <div>Candidate</div>
            <div>Date & Time</div>
            <div>Room</div>
            <div>Status</div>
          </div>
          {sessions.map((session) => (
            <div
              key={session.id}
              className="grid grid-cols-4 items-center border-b border-surface-subtle px-4 py-3 text-sm last:border-b-0"
            >
              <div>
                <div className="font-medium text-content-primary">{session.candidate.name}</div>
                <div className="text-content-secondary">{session.candidate.roleApplyingFor}</div>
              </div>
              <div className="text-content-secondary">{formatDateTime(session.scheduledAt)}</div>
              <div className="text-content-secondary">{session.room?.name ?? 'Virtual'}</div>
              <div>
                <span className="rounded-full bg-surface-subtle px-2.5 py-0.5 text-xs font-medium text-content-secondary">
                  {STATUS_LABEL[session.status]}
                </span>
                {session.meetLink && (
                  <a
                    href={session.meetLink}
                    target="_blank"
                    rel="noreferrer"
                    className="ml-2 text-xs font-medium text-brand hover:underline"
                  >
                    Join
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
