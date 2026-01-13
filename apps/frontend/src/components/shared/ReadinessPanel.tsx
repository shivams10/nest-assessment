import { Card, CardContent } from '@/components/ui/card'

interface ReadinessPanelProps {
  isReady: boolean
  reasons: string[]
  isLoading?: boolean
}

/**
 * ReadinessPanel - Displays exam readiness status
 */
export function ReadinessPanel({
  isReady,
  reasons,
  isLoading = false,
}: ReadinessPanelProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-pulse rounded-full bg-muted" />
            <span className="text-sm text-muted-foreground">Checking readiness...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className={
        isReady
          ? 'border-green-500 bg-green-50 dark:bg-green-950'
          : 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950'
      }
    >
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          {isReady ? (
            <span className="text-green-600 dark:text-green-400 text-lg flex-shrink-0 mt-0.5">
              ✓
            </span>
          ) : (
            <span className="text-yellow-600 dark:text-yellow-400 text-lg flex-shrink-0 mt-0.5">
              ✗
            </span>
          )}
          <div className="flex-1 space-y-2">
            <div className="font-medium text-sm">
              {isReady ? 'Exam is ready to publish' : 'Exam is not ready to publish'}
            </div>
            {!isReady && reasons.length > 0 && (
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                {reasons.map((reason, index) => (
                  <li key={index}>{reason}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

