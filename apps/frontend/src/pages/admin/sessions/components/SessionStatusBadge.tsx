import { cn } from '@/lib/utils'
import type { SessionStatus } from '@/types/session.types'

interface SessionStatusBadgeProps {
  status: SessionStatus
}

/**
 * SessionStatusBadge - Displays recruitment session status
 */
export function SessionStatusBadge({ status }: SessionStatusBadgeProps) {
  const statusConfig = {
    upcoming: {
      label: 'Upcoming',
      className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    },
    active: {
      label: 'Active',
      className: 'bg-green-500/10 text-green-600 dark:text-green-400',
    },
    completed: {
      label: 'Completed',
      className: 'bg-muted text-muted-foreground',
    },
  }

  const config = statusConfig[status]

  return (
    <span
      className={cn(
        'rounded-md px-2 py-1 text-xs font-medium',
        config.className,
      )}
    >
      {config.label}
    </span>
  )
}

