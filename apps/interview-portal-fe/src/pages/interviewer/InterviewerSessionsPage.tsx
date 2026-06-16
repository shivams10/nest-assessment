import { CalendarIcon } from '@/components/icons'
import { EmptyState, PageHeader } from '@/components/ui'

export const InterviewerSessionsPage = () => (
  <>
    <PageHeader title="Sessions" description="Your assigned interview sessions" />
    <EmptyState
      icon={<CalendarIcon size={24} />}
      title="No sessions assigned"
      description="Sessions assigned to you by the recruitment team will appear here."
    />
  </>
)
