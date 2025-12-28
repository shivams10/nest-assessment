import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface SubmitDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  isSubmitting?: boolean
  title?: string
  description?: string
  confirmText?: string
  variant?: 'default' | 'destructive'
}

/**
 * SubmitDialog - Confirmation dialog for exam submission or other actions
 * Simple modal implementation without external dependencies
 */
export function SubmitDialog({
  open,
  onOpenChange,
  onConfirm,
  isSubmitting = false,
  title = 'Submit Exam',
  description = 'Are you sure you want to submit your exam? Once submitted, you cannot make any changes to your answers.',
  confirmText = 'Submit Exam',
  variant = 'destructive',
}: SubmitDialogProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={() => !isSubmitting && onOpenChange(false)}
    >
      <Card
        className="w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="sm:flex-1 sm:max-w-none"
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isSubmitting}
              className={
                variant === 'destructive'
                  ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90 sm:flex-1 sm:max-w-none'
                  : 'sm:flex-1 sm:max-w-none'
              }
            >
              {isSubmitting ? 'Processing...' : confirmText}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

