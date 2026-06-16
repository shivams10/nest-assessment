type PageHeaderProps = {
  title:       string
  description?: string
  action?:     React.ReactNode
}

export const PageHeader = ({ title, description, action }: PageHeaderProps) => (
  <div className="flex items-start justify-between mb-6">
    <div>
      <h1 className="text-content-primary text-xl font-semibold">{title}</h1>
      {description && (
        <p className="text-content-secondary text-sm mt-0.5">{description}</p>
      )}
    </div>
    {action && <div className="flex-shrink-0">{action}</div>}
  </div>
)
