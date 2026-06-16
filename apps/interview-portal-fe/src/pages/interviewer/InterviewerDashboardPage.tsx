import { CalendarIcon } from '@/components/icons'
import { EmptyState, PageHeader } from '@/components/ui'

export const InterviewerDashboardPage = () => (
  <>
    <PageHeader title="Dashboard" description="Your upcoming sessions and activity" />
    <EmptyState
      icon={<CalendarIcon size={24} />}
      title="No upcoming sessions"
      description="Sessions assigned to you will appear here."
    />
  </>
)
