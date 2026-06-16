import { cn } from '@/lib/utils'

const getInitials = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')

type AvatarProps = {
  name:      string
  size?:     'sm' | 'md' | 'lg'
  className?: string
}

const SIZE: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'w-7 h-7 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-11 h-11 text-base',
}

export const Avatar = ({ name, size = 'md', className }: AvatarProps) => (
  <div className={cn('rounded-full bg-brand flex items-center justify-center font-semibold text-white flex-shrink-0', SIZE[size], className)}>
    {getInitials(name) || '?'}
  </div>
)
