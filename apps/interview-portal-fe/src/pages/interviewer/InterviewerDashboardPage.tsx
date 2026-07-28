import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { CalendarIcon } from '@/components/icons'
import { EmptyState, LoadingSpinner, PageHeader } from '@/components/ui'
import { api } from '@/lib/api'
import { useSessions } from '@/hooks/useSessions'
import { useInterviewerCalendarStatus } from '@/hooks/useInterviewerCalendarStatus'

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

const CalendarConnectionBanner = () => {
  const { data: status } = useInterviewerCalendarStatus()
  const [searchParams, setSearchParams] = useSearchParams()
  const calendarParam = searchParams.get('calendar')
  const [connecting, setConnecting] = useState(false)

  const handleConnect = async () => {
    searchParams.delete('calendar')
    setSearchParams(searchParams, { replace: true })

    setConnecting(true)
    try {
      const { data } = await api.get<{ url: string }>('/calendar/interviewer/connect')
      window.location.href = data.url
    } catch {
      setConnecting(false)
    }
  }

  return (
    <div className="mb-6 flex items-center justify-between rounded-lg border border-border bg-surface-subtle px-4 py-3">
      <div>
        <p className="text-sm font-medium text-content-primary">Google Calendar</p>
        <p className="text-xs text-content-secondary">
          {status?.connected
            ? 'Connected — recruiters will see your real availability when scheduling.'
            : 'Not connected — recruiters can still schedule you, they just won’t see conflicts from your personal calendar.'}
        </p>
        {calendarParam === 'connected' && (
          <p className="mt-1 text-xs text-status-success-text">Successfully connected.</p>
        )}
        {calendarParam === 'error' && (
          <p className="mt-1 text-xs text-status-error-text">Connection failed — please try again.</p>
        )}
      </div>
      <button
        onClick={handleConnect}
        disabled={connecting}
        className="h-9 shrink-0 rounded-md border border-border px-4 text-sm font-medium text-content-primary hover:bg-surface disabled:opacity-50"
      >
        {connecting ? 'Redirecting…' : status?.connected ? 'Reconnect' : 'Connect Google Calendar'}
      </button>
    </div>
  )
}

export const InterviewerDashboardPage = () => {
  const { data: sessions, isLoading } = useSessions()

  const upcoming = (sessions ?? [])
    .filter((s) => new Date(s.scheduledAt) >= new Date() && s.status !== 'cancelled')
    .slice(0, 5)

  return (
    <>
      <PageHeader title="Dashboard" description="Your upcoming sessions and activity" />

      <CalendarConnectionBanner />

      {isLoading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : upcoming.length === 0 ? (
        <EmptyState
          icon={<CalendarIcon size={24} />}
          title="No upcoming sessions"
          description="Sessions assigned to you will appear here."
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <div className="grid grid-cols-4 border-b border-border bg-surface-subtle px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-content-muted">
            <div>Candidate</div>
            <div>Date & Time</div>
            <div>Room</div>
            <div>Status</div>
          </div>
          {upcoming.map((session) => (
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
