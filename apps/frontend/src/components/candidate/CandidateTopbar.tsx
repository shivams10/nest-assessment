import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { logoutUser, getAuthEmail } from '@/lib/auth'
import { ROUTES, TEXT } from '@/constants'
import { Button } from '@/components/ui/button'

interface CandidateTopbarProps {
  onMenuClick: () => void
}

/**
 * CandidateTopbar - Top navigation bar for candidate layout
 * - Displays logged-in user email
 * - Logout button that clears auth and redirects
 * - Mobile menu toggle button
 * - Responsive design with proper spacing
 */
export function CandidateTopbar({ onMenuClick }: CandidateTopbarProps) {
  const navigate = useNavigate()
  const { token } = useAuth()

  const email = token ? getAuthEmail() : null
  const displayEmail = email || TEXT.ADMIN.USER

  const handleLogout = () => {
    logoutUser()
    navigate(ROUTES.LOGIN, { replace: true })
  }

  return (
    <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between border-b border-border bg-card px-4 sm:px-6">
      <div className="flex items-center gap-2 sm:gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </Button>
        <span className="text-xs sm:text-sm text-muted-foreground truncate max-w-[200px] sm:max-w-none">
          {displayEmail}
        </span>
      </div>
      <Button variant="outline" size="sm" onClick={handleLogout} className="shrink-0">
        {TEXT.ADMIN.LOGOUT}
      </Button>
    </header>
  )
}

