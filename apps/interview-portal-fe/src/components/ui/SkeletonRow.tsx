import { cn } from '@/lib/utils'

type SkeletonProps = { className?: string }

export const Skeleton = ({ className }: SkeletonProps) => (
  <div className={cn('animate-pulse rounded bg-surface-subtle', className)} />
)

export const SkeletonRow = () => (
  <div className="flex items-center gap-3 py-3 px-4 border-b border-border last:border-0">
    <Skeleton className="w-9 h-9 rounded-full flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-3.5 w-1/3" />
      <Skeleton className="h-3 w-1/2" />
    </div>
    <Skeleton className="h-6 w-16 rounded-full" />
  </div>
)
