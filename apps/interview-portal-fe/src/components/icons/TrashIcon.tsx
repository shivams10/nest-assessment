import type { IconProps } from './types'

export function TrashIcon({ size = 18, className, ...rest }: IconProps) {
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
      <line x1="4" y1="6.5" x2="20" y2="6.5" />
      <path d="M9 6.5V5a1.5 1.5 0 011.5-1.5h3A1.5 1.5 0 0115 5v1.5" />
      <path d="M6.5 6.5l.8 12.1a1.5 1.5 0 001.5 1.4h6.4a1.5 1.5 0 001.5-1.4l.8-12.1" />
      <line x1="10.5" y1="10.5" x2="10.5" y2="16.5" />
      <line x1="13.5" y1="10.5" x2="13.5" y2="16.5" />
    </svg>
  )
}
