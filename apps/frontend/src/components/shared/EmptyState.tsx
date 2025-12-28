/**
 * EmptyState - Reusable empty state component
 */
export function EmptyState({
  title = 'No items found',
  description,
}: {
  title?: string
  description?: string
}) {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="text-center">
        <p className="mb-2 text-lg font-semibold text-foreground">{title}</p>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  )
}

