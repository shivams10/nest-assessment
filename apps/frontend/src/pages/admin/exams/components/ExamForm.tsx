import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { CreateExamRequest } from '@/types/exam.types'
import type { RecruitmentSession } from '@/types/session.types'

const examSchema = z.object({
  collegeSessionId: z.string().uuid('Please select a recruitment session'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  windowStartsAt: z.string().min(1, 'Window start date is required'),
  windowEndsAt: z.string().min(1, 'Window end date is required'),
  durationSeconds: z.number().int().min(60, 'Duration must be at least 60 seconds'),
  masterPassword: z.string().min(1, 'Master password is required'),
}).refine((data) => {
  if (data.windowStartsAt && data.windowEndsAt) {
    return new Date(data.windowEndsAt) >= new Date(data.windowStartsAt)
  }
  return true
}, {
  message: 'Window end date must be after start date',
  path: ['windowEndsAt'],
})

type ExamFormData = z.infer<typeof examSchema>

interface ExamFormProps {
  onSubmit: (data: CreateExamRequest) => void
  isLoading?: boolean
  sessions: RecruitmentSession[]
  defaultValues?: Partial<ExamFormData>
}

/**
 * ExamForm - Form component for creating exams
 */
export function ExamForm({
  onSubmit,
  isLoading = false,
  sessions,
  defaultValues,
}: ExamFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ExamFormData>({
    resolver: zodResolver(examSchema),
    defaultValues,
  })


  const handleFormSubmit = (data: ExamFormData) => {
    onSubmit({
      collegeSessionId: data.collegeSessionId,
      title: data.title,
      description: data.description,
      windowStartsAt: data.windowStartsAt,
      windowEndsAt: data.windowEndsAt,
      durationSeconds: data.durationSeconds,
      masterPassword: data.masterPassword,
    })
  }

  const handleDurationChange = (value: string) => {
    // Convert hours to seconds
    const hours = parseFloat(value) || 0
    setValue('durationSeconds', Math.round(hours * 3600), { shouldValidate: true })
  }

  const durationHours = watch('durationSeconds') / 3600

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Exam</CardTitle>
        <CardDescription>
          Create a new exam for a recruitment session
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="collegeSessionId">Recruitment Session</Label>
            <select
              id="collegeSessionId"
              {...register('collegeSessionId')}
              disabled={isLoading}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select a session</option>
              {sessions.map((session) => (
                <option key={session.id} value={session.id}>
                  {session.name} ({session.year})
                </option>
              ))}
            </select>
            {errors.collegeSessionId && (
              <p className="text-sm text-destructive">
                {errors.collegeSessionId.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Exam Title</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="e.g., Technical Assessment 2024"
              disabled={isLoading}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              {...register('description')}
              placeholder="Exam description"
              disabled={isLoading}
            />
            {errors.description && (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="windowStartsAt">Window Start Date</Label>
              <Input
                id="windowStartsAt"
                type="datetime-local"
                {...register('windowStartsAt')}
                disabled={isLoading}
              />
              {errors.windowStartsAt && (
                <p className="text-sm text-destructive">
                  {errors.windowStartsAt.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="windowEndsAt">Window End Date</Label>
              <Input
                id="windowEndsAt"
                type="datetime-local"
                {...register('windowEndsAt')}
                disabled={isLoading}
              />
              {errors.windowEndsAt && (
                <p className="text-sm text-destructive">
                  {errors.windowEndsAt.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (Hours)</Label>
              <Input
                id="duration"
                type="number"
                step="0.5"
                min="0.5"
                value={durationHours}
                onChange={(e) => handleDurationChange(e.target.value)}
                placeholder="1.5"
                disabled={isLoading}
              />
              {errors.durationSeconds && (
                <p className="text-sm text-destructive">
                  {errors.durationSeconds.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="masterPassword">Master Password</Label>
              <Input
                id="masterPassword"
                type="password"
                {...register('masterPassword')}
                placeholder="Enter master password"
                disabled={isLoading}
              />
              {errors.masterPassword && (
                <p className="text-sm text-destructive">
                  {errors.masterPassword.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? 'Creating...' : 'Create Exam'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
