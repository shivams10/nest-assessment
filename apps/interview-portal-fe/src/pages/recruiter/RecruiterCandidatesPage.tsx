import { UsersIcon } from '@/components/icons'
import { EmptyState, PageHeader } from '@/components/ui'

export const RecruiterCandidatesPage = () => (
  <>
    <PageHeader title="Candidates" description="Manage your candidate pipeline" />
    <EmptyState
      icon={<UsersIcon size={24} />}
      title="No candidates yet"
      description="Add your first candidate to get started."
    />
  </>
)
