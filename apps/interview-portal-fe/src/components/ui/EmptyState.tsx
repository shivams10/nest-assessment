type EmptyStateProps = {
  icon?:        React.ReactNode
  title:        string
  description?: string
  action?:      React.ReactNode
}

export const EmptyState = ({ icon, title, description, action }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    {icon && (
      <div className="w-12 h-12 rounded-xl bg-surface-subtle flex items-center justify-center mb-4 text-content-muted">
        {icon}
      </div>
    )}
    <p className="text-content-primary font-semibold text-sm mb-1">{title}</p>
    {description && (
      <p className="text-content-secondary text-sm max-w-xs">{description}</p>
    )}
    {action && <div className="mt-4">{action}</div>}
  </div>
)
