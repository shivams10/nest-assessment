import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/shared/EmptyState'

/**
 * AdminCandidatesPage - Admin candidates management page
 * Route: /admin/candidates
 * Placeholder for future candidate management features
 */
export function AdminCandidatesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          Candidate Management
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage candidates and their exam registrations
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Candidate Management</CardTitle>
          <CardDescription>
            This feature is coming soon. You can currently view candidate results and analytics.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            title="Coming Soon"
            description="Candidate management features will be available here. For now, you can view candidate results and analytics from the dashboard."
          />
        </CardContent>
      </Card>
    </div>
  )
}

