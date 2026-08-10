import type { IconProps } from './types'

export function HelpCircleIcon({ size = 18, className, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M9.6 9.3a2.5 2.5 0 114.05 2.15c-.9.7-1.65 1.1-1.65 2.05" />
      <line x1="12" y1="17" x2="12" y2="17" />
    </svg>
  )
}
