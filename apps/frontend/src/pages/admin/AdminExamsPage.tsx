import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/shared/EmptyState'

/**
 * AdminExamsPage - Admin exams management page
 * Route: /admin/exams
 * Placeholder for future exam management features
 */
export function AdminExamsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          Exam Management
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Create and manage exams, exam sets, and questions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Exam Management</CardTitle>
          <CardDescription>
            This feature is coming soon. You can currently view exam results and analytics.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            title="Coming Soon"
            description="Exam creation and management features will be available here. For now, you can view exam results and analytics from the dashboard."
          />
        </CardContent>
      </Card>
    </div>
  )
}

