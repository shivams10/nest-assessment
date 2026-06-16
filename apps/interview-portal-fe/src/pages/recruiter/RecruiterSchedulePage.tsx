import { CalendarIcon } from '@/components/icons'
import { EmptyState, PageHeader } from '@/components/ui'

export const RecruiterSchedulePage = () => (
  <>
    <PageHeader title="Schedule" description="Schedule and manage interviews" />
    <EmptyState
      icon={<CalendarIcon size={24} />}
      title="No sessions scheduled"
      description="Schedule your first interview once you have added candidates."
    />
  </>
)
