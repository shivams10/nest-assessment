import { cn } from '@/lib/utils'

type LoadingSpinnerProps = {
  size?:      'sm' | 'md' | 'lg'
  className?: string
}

const SIZE = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' }

export const LoadingSpinner = ({ size = 'md', className }: LoadingSpinnerProps) => (
  <div className={cn('rounded-full border-2 border-brand border-t-transparent animate-spin', SIZE[size], className)} />
)

export const PageLoader = () => (
  <div className="flex min-h-[60vh] items-center justify-center">
    <LoadingSpinner size="lg" />
  </div>
)
