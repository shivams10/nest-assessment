import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'
import clsx from 'clsx'

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
}

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  hint?: string
}

export const TextInput = ({ label, hint, className, ...props }: TextInputProps) => (
  <label className={clsx('recruiter-field', className)}>
    {label && <span className="recruiter-field__label">{label}</span>}
    <input className="recruiter-input recruiter-input--text" {...props} />
    {hint && <span className="recruiter-field__hint">{hint}</span>}
  </label>
)

export const TextArea = ({ label, hint, className, ...props }: TextAreaProps) => (
  <label className={clsx('recruiter-field', className)}>
    {label && <span className="recruiter-field__label">{label}</span>}
    <textarea className="recruiter-input recruiter-input--textarea" {...props} />
    {hint && <span className="recruiter-field__hint">{hint}</span>}
  </label>
)
