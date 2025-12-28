import { cn } from '@/lib/utils'

interface ExamStatusBadgeProps {
  isPublished: boolean
}

/**
 * ExamStatusBadge - Displays exam publication status
 */
export function ExamStatusBadge({ isPublished }: ExamStatusBadgeProps) {
  return (
    <span
      className={cn(
        'rounded-md px-2 py-1 text-xs font-medium',
        isPublished
          ? 'bg-green-500/10 text-green-600 dark:text-green-400'
          : 'bg-muted text-muted-foreground',
      )}
    >
      {isPublished ? 'Published' : 'Draft'}
    </span>
  )
}

