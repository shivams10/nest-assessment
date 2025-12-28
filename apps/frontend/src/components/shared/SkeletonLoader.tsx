import { cn } from '@/lib/utils'

interface SkeletonLoaderProps {
  className?: string
  lines?: number
}

/**
 * SkeletonLoader - Skeleton loading component
 * Better UX than spinners for content that's loading
 */
export function SkeletonLoader({ className, lines = 3 }: SkeletonLoaderProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 w-full animate-pulse rounded-md bg-muted"
          aria-hidden="true"
        />
      ))}
    </div>
  )
}

interface SkeletonCardProps {
  className?: string
}

/**
 * SkeletonCard - Skeleton for card components
 */
export function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-card p-6',
        className,
      )}
    >
      <div className="space-y-4">
        <div className="h-4 w-24 animate-pulse rounded-md bg-muted" />
        <div className="h-8 w-32 animate-pulse rounded-md bg-muted" />
        <div className="h-3 w-40 animate-pulse rounded-md bg-muted" />
      </div>
    </div>
  )
}

