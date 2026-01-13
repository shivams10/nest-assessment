import { useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Question, CreateQuestionRequest, UpdateQuestionRequest } from '@/types/question.types'

const questionSchema = z.object({
  stem: z.string().min(1, 'Question text is required'),
  type: z.enum(['single_select', 'multi_select']),
  category: z.enum(['aptitude', 'technical']),
  options: z
    .array(
      z.object({
        optionText: z.string().min(1, 'Option text is required'),
        isCorrect: z.boolean(),
      }),
    )
    .min(2, 'At least 2 options are required'),
}).refine(
  (data) => {
    const correctCount = data.options.filter((opt) => opt.isCorrect).length
    if (data.type === 'single_select') {
      return correctCount === 1
    }
    return correctCount >= 1
  },
  {
    message: 'Single select must have exactly 1 correct answer, multi select must have at least 1',
    path: ['options'],
  },
)

type QuestionFormData = z.infer<typeof questionSchema>

interface QuestionFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateQuestionRequest | UpdateQuestionRequest) => void
  isLoading?: boolean
  question?: Question
  isEdit?: boolean
}

/**
 * QuestionFormDialog - Dialog for creating/editing questions
 */
export function QuestionFormDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
  question,
  isEdit = false,
}: QuestionFormDialogProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      stem: question?.stem || '',
      type: question?.type || 'single_select',
      category: (question?.category as 'aptitude' | 'technical') || 'aptitude',
      options: question?.options?.map((opt) => ({
        optionText: opt.optionText,
        isCorrect: opt.isCorrect || false,
      })) || [
        { optionText: '', isCorrect: false },
        { optionText: '', isCorrect: false },
      ],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'options',
  })

  useEffect(() => {
    if (open && question) {
      reset({
        stem: question.stem,
        type: question.type,
        category: question.category as 'aptitude' | 'technical',
        options: question.options?.map((opt) => ({
          optionText: opt.optionText,
          isCorrect: opt.isCorrect || false,
        })) || [],
      })
    } else if (open && !question) {
      reset({
        stem: '',
        type: 'single_select',
        category: 'aptitude',
        options: [
          { optionText: '', isCorrect: false },
          { optionText: '', isCorrect: false },
        ],
      })
    }
  }, [open, question, reset])

  const handleFormSubmit = (data: QuestionFormData) => {
    onSubmit(data)
  }

  const handleCancel = () => {
    if (!isLoading) {
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
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {isEdit ? 'Edit Question' : 'Create Question'}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {isEdit
                ? 'Update the question details below.'
                : 'Fill in the question details below.'}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="stem">Question Text</Label>
            <Input
              id="stem"
              {...register('stem')}
              placeholder="Enter the question..."
              disabled={isLoading}
            />
            {errors.stem && (
              <p className="text-sm text-destructive">{errors.stem.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <select
                id="type"
                {...register('type')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                disabled={isLoading}
              >
                <option value="single_select">Single Select</option>
                <option value="multi_select">Multi Select</option>
              </select>
              {errors.type && (
                <p className="text-sm text-destructive">{errors.type.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                {...register('category')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                disabled={isLoading}
              >
                <option value="aptitude">Aptitude</option>
                <option value="technical">Technical</option>
              </select>
              {errors.category && (
                <p className="text-sm text-destructive">{errors.category.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Options</Label>
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-2 items-start">
                <Input
                  {...register(`options.${index}.optionText`)}
                  placeholder={`Option ${index + 1}`}
                  disabled={isLoading}
                  className="flex-1"
                />
                <label className="flex items-center gap-2 px-3">
                  <input
                    type="checkbox"
                    {...register(`options.${index}.isCorrect`)}
                    disabled={isLoading}
                  />
                  <span className="text-sm">Correct</span>
                </label>
                {fields.length > 2 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => remove(index)}
                    disabled={isLoading}
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
            {errors.options && (
              <p className="text-sm text-destructive">{errors.options.message}</p>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ optionText: '', isCorrect: false })}
              disabled={isLoading}
            >
              Add Option
            </Button>
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
              {isLoading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

