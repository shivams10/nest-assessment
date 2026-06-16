import { PageHeader } from '@/components/ui'

export const RecruiterDashboardPage = () => (
  <>
    <PageHeader title="Dashboard" description="Overview of your recruitment activity" />
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {(['Total Candidates', 'Sessions This Week', 'Pending Feedback', 'Team Size'] as const).map((label) => (
        <div key={label} className="rounded-xl border border-border bg-surface-DEFAULT p-5">
          <p className="text-content-secondary text-xs font-medium">{label}</p>
          <p className="text-content-primary text-2xl font-bold mt-1">—</p>
        </div>
      ))}
    </div>
  </>
)
