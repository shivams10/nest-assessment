import { Link, useNavigate } from 'react-router-dom'
import { useAppSelector } from '@/store/hooks'
import { ROUTES, ROLES, ADMIN_ROLES, type UserRole } from '@/constants'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TEXT } from '@/constants'

/**
 * HomePage - Landing after login
 * Shows welcome and role-based navigation to Dashboard or Exams
 */
export function HomePage() {
  const navigate = useNavigate()
  const role = useAppSelector((state) => state.auth.role)
  const isAdmin = role && ADMIN_ROLES.includes(role as UserRole)
  const isCandidate = role === ROLES.CANDIDATE

  return (
    <div className="container mx-auto max-w-2xl py-12 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{TEXT.APP_NAME}</CardTitle>
          <CardDescription>
            Welcome. Choose where you’d like to go.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isAdmin && (
            <Button
              asChild
              className="w-full"
              size="lg"
            >
              <Link to={ROUTES.ADMIN}>Go to Admin Dashboard</Link>
            </Button>
          )}
          {isCandidate && (
            <Button
              asChild
              className="w-full"
              size="lg"
            >
              <Link to={ROUTES.CANDIDATE_EXAMS}>Go to My Exams</Link>
            </Button>
          )}
          {!isAdmin && !isCandidate && (
            <Button
              variant="outline"
              className="w-full"
              size="lg"
              onClick={() => navigate(ROUTES.HOME)}
            >
              Home
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
