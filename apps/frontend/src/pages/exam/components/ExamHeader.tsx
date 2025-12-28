import { Button } from '@/components/ui/button'

interface ExamHeaderProps {
  examTitle: string
  timeRemaining: string
  isExpired: boolean
  onSaveAnswers: () => void
  onSubmit: () => void
  isSaving: boolean
  isSubmitting: boolean
}

/**
 * ExamHeader - Fixed header for exam runtime
 * Shows exam title, countdown timer, and action buttons
 */
export function ExamHeader({
  examTitle,
  timeRemaining,
  isExpired,
  onSaveAnswers,
  onSubmit,
  isSaving,
  isSubmitting,
}: ExamHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card shadow-sm">
      <div className="container mx-auto px-4 py-3 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-semibold text-foreground sm:text-xl">
              {examTitle}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div
              className={`rounded-md px-4 py-2 font-mono text-lg font-semibold ${
                isExpired
                  ? 'bg-destructive/10 text-destructive'
                  : 'bg-muted text-foreground'
              }`}
            >
              {timeRemaining}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onSaveAnswers}
                disabled={isSaving || isSubmitting || isExpired}
              >
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
              <Button
                size="sm"
                onClick={onSubmit}
                disabled={isSubmitting || isExpired}
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

