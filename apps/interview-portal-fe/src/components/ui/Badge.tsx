import { cn } from '@/lib/utils'

export type BadgeVariant = 'default' | 'brand' | 'success' | 'warning' | 'error' | 'info'

const VARIANTS: Record<BadgeVariant, string> = {
  default: 'bg-surface-subtle  text-content-secondary',
  brand:   'bg-brand-light     text-brand',
  success: 'bg-status-success  text-green-700',
  warning: 'bg-status-warning  text-amber-700',
  error:   'bg-status-error-bg text-status-error-text',
  info:    'bg-status-info     text-blue-700',
}

type BadgeProps = {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

export const Badge = ({ children, variant = 'default', className }: BadgeProps) => (
  <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', VARIANTS[variant], className)}>
    {children}
  </span>
)
