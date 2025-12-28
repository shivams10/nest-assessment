import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  selected: boolean
  className?: string
}

/**
 * StatusBadge - Displays selection status for next round
 */
export function StatusBadge({ selected, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium',
        selected
          ? 'bg-green-500/10 text-green-600 dark:text-green-400'
          : 'bg-muted text-muted-foreground',
        className,
      )}
    >
      {selected ? 'Selected' : 'Not Selected'}
    </span>
  )
}

