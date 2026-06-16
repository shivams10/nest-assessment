import { UsersIcon } from '@/components/icons'
import { EmptyState, PageHeader } from '@/components/ui'

export const RecruiterTeamPage = () => (
  <>
    <PageHeader title="Team" description="Manage your interviewers" />
    <EmptyState
      icon={<UsersIcon size={24} />}
      title="No interviewers yet"
      description="Invite interviewers to your team to start scheduling sessions."
    />
  </>
)
