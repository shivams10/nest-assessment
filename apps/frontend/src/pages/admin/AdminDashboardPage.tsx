import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/constants'

/**
 * AdminDashboardPage - Main admin dashboard
 * Route: /admin
 * Provides quick access to key admin features
 */
export function AdminDashboardPage() {
  const navigate = useNavigate()

  const quickActions = [
    {
      title: 'Analytics',
      description: 'View exam performance and candidate statistics',
      path: ROUTES.ADMIN_ANALYTICS,
      color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Results',
      description: 'Manage exam results and rankings',
      path: ROUTES.ADMIN_RESULTS,
      color: 'bg-green-500/10 text-green-600 dark:text-green-400',
    },
    {
      title: 'Users',
      description: 'Manage admin and moderator accounts',
      path: ROUTES.ADMIN_USERS,
      color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    },
    {
      title: 'Exams',
      description: 'Create and manage exams',
      path: `${ROUTES.ADMIN}/exams`,
      color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          Admin Dashboard
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Welcome to the admin panel. Manage exams, view results, and track analytics.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickActions.map((action) => (
          <Card
            key={action.path}
            className="cursor-pointer transition-shadow hover:shadow-md"
            onClick={() => navigate(action.path)}
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className={`rounded-md p-2 ${action.color}`}>
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <CardTitle className="text-lg">{action.title}</CardTitle>
              </div>
              <CardDescription className="mt-2">
                {action.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation()
                  navigate(action.path)
                }}
              >
                Go to {action.title}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Links</CardTitle>
          <CardDescription>
            Access frequently used admin features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => navigate(ROUTES.ADMIN_ANALYTICS)}
            >
              View Analytics
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(ROUTES.ADMIN_RESULTS)}
            >
              Manage Results
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(ROUTES.ADMIN_USERS)}
            >
              Manage Users
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

