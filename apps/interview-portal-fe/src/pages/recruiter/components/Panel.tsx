import type { ReactNode } from 'react'
import clsx from 'clsx'

interface PanelProps {
  title?: string
  description?: string
  children: ReactNode
  className?: string
}

export const Panel = ({ title, description, children, className }: PanelProps) => (
  <section className={clsx('recruiter-panel', className)}>
    {(title || description) && (
      <div className="recruiter-panel__header">
        {title && <h2 className="recruiter-panel__title">{title}</h2>}
        {description && <p className="recruiter-panel__description">{description}</p>}
      </div>
    )}
    <div className="recruiter-panel__body">{children}</div>
  </section>
)
