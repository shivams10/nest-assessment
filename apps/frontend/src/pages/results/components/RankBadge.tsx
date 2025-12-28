import { cn } from '@/lib/utils'

interface RankBadgeProps {
  rank: number | null
  className?: string
}

/**
 * RankBadge - Displays candidate rank
 * Shows "N/A" if rank is not available
 */
export function RankBadge({ rank, className }: RankBadgeProps) {
  if (rank === null) {
    return (
      <div
        className={cn(
          'inline-flex items-center rounded-md bg-muted px-3 py-1 text-sm font-medium text-muted-foreground',
          className,
        )}
      >
        N/A
      </div>
    )
  }

  // Color based on rank tier
  const getRankColor = (r: number) => {
    if (r <= 3) return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
    if (r <= 10) return 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
    return 'bg-muted text-muted-foreground'
  }

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-md px-3 py-1 text-sm font-semibold',
        getRankColor(rank),
        className,
      )}
    >
      #{rank}
    </div>
  )
}

