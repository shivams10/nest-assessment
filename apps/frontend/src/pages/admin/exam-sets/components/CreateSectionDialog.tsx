import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { SectionType } from '@/types/examSet.types'

const createSectionSchema = z.object({
  questionCount: z.number().int().min(1, 'Question count must be at least 1'),
})

type CreateSectionFormData = z.infer<typeof createSectionSchema>

interface CreateSectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (sectionType: SectionType, questionCount: number) => void
  sectionType: SectionType
  isLoading?: boolean
}

/**
 * CreateSectionDialog - Dialog for creating a new exam set section
 */
export function CreateSectionDialog({
  open,
  onOpenChange,
  onSubmit,
  sectionType,
  isLoading = false,
}: CreateSectionDialogProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateSectionFormData>({
    resolver: zodResolver(createSectionSchema),
    defaultValues: {
      questionCount: 10,
    },
  })

  useEffect(() => {
    if (!open) {
      reset()
    }
  }, [open, reset])

  const handleFormSubmit = (data: CreateSectionFormData) => {
    onSubmit(sectionType, data.questionCount)
    reset()
    onOpenChange(false)
  }

  const handleCancel = () => {
    if (!isLoading) {
      reset()
      onOpenChange(false)
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={handleCancel}
    >
      <Card
        className="w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Create {sectionType === 'aptitude' ? 'Aptitude' : 'Technical'} Section
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Set the number of questions required for this section
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="questionCount">Question Count</Label>
            <Input
              id="questionCount"
              type="number"
              min="1"
              {...register('questionCount', { valueAsNumber: true })}
              placeholder="e.g., 10"
              disabled={isLoading}
              autoFocus
            />
            {errors.questionCount && (
              <p className="text-sm text-destructive">{errors.questionCount.message}</p>
            )}
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
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Section'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

