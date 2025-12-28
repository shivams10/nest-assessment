import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface CreateExamSetDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (name: string) => void
  isLoading?: boolean
}

/**
 * CreateExamSetDialog - Dialog for creating a new exam set
 */
export function CreateExamSetDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
}: CreateExamSetDialogProps) {
  const [name, setName] = useState('')

  if (!open) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      onSubmit(name.trim())
      setName('')
    }
  }

  const handleCancel = () => {
    setName('')
    onOpenChange(false)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={() => !isLoading && handleCancel()}
    >
      <Card
        className="w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Create Exam Set
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter a name for the new exam set (e.g., "Set A", "Set B")
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Exam Set Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Set A"
              disabled={isLoading}
              autoFocus
              required
            />
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !name.trim()}>
              {isLoading ? 'Creating...' : 'Create Exam Set'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

