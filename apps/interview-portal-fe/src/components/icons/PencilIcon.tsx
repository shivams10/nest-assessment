import type { IconProps } from './types'

export function PencilIcon({ size = 18, className, ...rest }: IconProps) {
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
      <path d="M16.86 4.49l2.65 2.65a1.2 1.2 0 010 1.7L9.4 18.95l-4.4 1.05 1.05-4.4L16.16 4.49a1.2 1.2 0 011.7 0z" />
      <line x1="15.1" y1="6.25" x2="17.75" y2="8.9" />
    </svg>
  )
}
