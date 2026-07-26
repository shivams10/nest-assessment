import clsx from 'clsx'
import type { ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'icon'
type ButtonSize = 'sm' | 'md'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

export const Button = ({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) => (
  <button
    className={clsx(
      'recruiter-button',
      `recruiter-button--${variant}`,
      `recruiter-button--${size}`,
      className,
    )}
    {...props}
  >
    {children}
  </button>
)
