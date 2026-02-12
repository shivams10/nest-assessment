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
import type { CreateExamRequest, UpdateExamRequest } from '@/types/exam.types'
import type { RecruitmentSession } from '@/types/session.types'

// Base schemas - will be extended with session date validation
const createExamBaseSchema = z.object({
  collegeSessionId: z.string().uuid('Please select a recruitment session'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  windowStartsAt: z.string().min(1, 'Window start date is required'),
  windowEndsAt: z.string().min(1, 'Window end date is required'),
  durationSeconds: z.number().int().min(60, 'Duration must be at least 60 seconds'),
  masterPassword: z.string().min(1, 'Master password is required'),
})

const updateExamBaseSchema = z.object({
  collegeSessionId: z.string().uuid('Please select a recruitment session').optional(),
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().optional(),
  windowStartsAt: z.string().min(1, 'Window start date is required').optional(),
  windowEndsAt: z.string().min(1, 'Window end date is required').optional(),
  durationSeconds: z.number().int().min(60, 'Duration must be at least 60 seconds').optional(),
  masterPassword: z.string().min(1, 'Master password is required').optional(),
})

type ExamFormData = z.infer<typeof createExamBaseSchema> | z.infer<typeof updateExamBaseSchema>

interface ExamFormProps {
  onSubmit: (data: CreateExamRequest | UpdateExamRequest) => void
  isLoading?: boolean
  sessions: RecruitmentSession[]
  defaultValues?: Partial<ExamFormData>
  isEdit?: boolean
  /** When true, all fields are disabled and submit is hidden (e.g. published exam view) */
  readOnly?: boolean
  /** Current master password (admin only); shown in edit mode when available */
  currentMasterPassword?: string | null
}

/**
 * ExamForm - Form component for creating exams
 */
export function ExamForm({
  onSubmit,
  isLoading = false,
  sessions,
  defaultValues,
  isEdit = false,
  readOnly = false,
  currentMasterPassword,
}: ExamFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors },
  } = useForm<ExamFormData>({
    resolver: zodResolver(isEdit ? updateExamBaseSchema : createExamBaseSchema),
    defaultValues,
  })

  const selectedSessionId = watch('collegeSessionId')
  const selectedSession = sessions?.find((s) => s.id === selectedSessionId)


  const handleFormSubmit = (data: ExamFormData) => {
    // Validate exam window dates against session dates
    // Compare only the date portion (year, month, day) to avoid timezone issues
    // Extract date string (YYYY-MM-DD) from both values for comparison
    if (selectedSession) {
      if (data.windowStartsAt && selectedSession.startDate) {
        // Extract date portion from datetime-local input (format: YYYY-MM-DDTHH:mm)
        const windowStartDateStr = data.windowStartsAt.split('T')[0]
        // Extract date portion from ISO string (format: YYYY-MM-DDTHH:mm:ss.sssZ)
        const sessionStartDateStr = selectedSession.startDate.split('T')[0]
        
        if (windowStartDateStr < sessionStartDateStr) {
          setError('windowStartsAt', {
            type: 'manual',
            message: 'Window start date must be on or after the session start date',
          })
          return
        }
      }

      if (data.windowEndsAt && selectedSession.endDate) {
        // Extract date portion from datetime-local input (format: YYYY-MM-DDTHH:mm)
        const windowEndDateStr = data.windowEndsAt.split('T')[0]
        // Extract date portion from ISO string (format: YYYY-MM-DDTHH:mm:ss.sssZ)
        const sessionEndDateStr = selectedSession.endDate.split('T')[0]
        
        if (windowEndDateStr > sessionEndDateStr) {
          setError('windowEndsAt', {
            type: 'manual',
            message: 'Window end date must be on or before the session end date',
          })
          return
        }
      }
    }

    if (isEdit) {
      onSubmit({
        ...(data.collegeSessionId !== undefined && { collegeSessionId: data.collegeSessionId }),
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.windowStartsAt !== undefined && { windowStartsAt: data.windowStartsAt }),
        ...(data.windowEndsAt !== undefined && { windowEndsAt: data.windowEndsAt }),
        ...(data.durationSeconds !== undefined && { durationSeconds: data.durationSeconds }),
        ...(data.masterPassword !== undefined && data.masterPassword !== '' && { masterPassword: data.masterPassword }),
      } as UpdateExamRequest)
    } else {
      onSubmit({
        collegeSessionId: data.collegeSessionId!,
        title: data.title!,
        description: data.description,
        windowStartsAt: data.windowStartsAt!,
        windowEndsAt: data.windowEndsAt!,
        durationSeconds: data.durationSeconds!,
        masterPassword: data.masterPassword!,
      } as CreateExamRequest)
    }
  }

  const handleDurationChange = (value: string) => {
    // Convert hours to seconds
    const hours = parseFloat(value) || 0
    setValue('durationSeconds', Math.round(hours * 3600), { shouldValidate: true })
  }

  const durationSeconds = watch('durationSeconds')
  const durationHours = durationSeconds ? durationSeconds / 3600 : 0

  const disabled = isLoading || readOnly

  return (
    <Card>
      <CardHeader>
        <CardTitle>{readOnly ? 'Exam Details' : isEdit ? 'Edit Exam' : 'Create Exam'}</CardTitle>
        <CardDescription>
          {readOnly
            ? 'This exam is published and cannot be edited. Unpublish the exam to make changes.'
            : isEdit
              ? 'Update exam details (only draft exams can be edited)'
              : 'Create a new exam for a recruitment session'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="collegeSessionId">Recruitment Session {isEdit && !readOnly && '(Optional)'}</Label>
            <select
              id="collegeSessionId"
              {...register('collegeSessionId')}
              disabled={disabled}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">{isEdit ? 'Keep current session' : 'Select a session'}</option>
              {(sessions || []).map((session) => (
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
              disabled={disabled}
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
              disabled={disabled}
            />
            {errors.description && (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="windowStartsAt">
                Window Start Date
                {selectedSession?.startDate && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    (Session: {new Date(selectedSession.startDate).toLocaleDateString()})
                  </span>
                )}
              </Label>
              <Input
                id="windowStartsAt"
                type="datetime-local"
                {...register('windowStartsAt')}
                disabled={disabled}
                min={
                  selectedSession?.startDate
                    ? (() => {
                        // Extract date portion and format as YYYY-MM-DDTHH:mm in local timezone
                        const date = new Date(selectedSession.startDate)
                        const year = date.getFullYear()
                        const month = String(date.getMonth() + 1).padStart(2, '0')
                        const day = String(date.getDate()).padStart(2, '0')
                        return `${year}-${month}-${day}T00:00`
                      })()
                    : undefined
                }
                max={
                  selectedSession?.endDate
                    ? (() => {
                        // Extract date portion and format as YYYY-MM-DDTHH:mm in local timezone
                        const date = new Date(selectedSession.endDate)
                        const year = date.getFullYear()
                        const month = String(date.getMonth() + 1).padStart(2, '0')
                        const day = String(date.getDate()).padStart(2, '0')
                        return `${year}-${month}-${day}T23:59`
                      })()
                    : undefined
                }
              />
              {errors.windowStartsAt && (
                <p className="text-sm text-destructive">
                  {errors.windowStartsAt.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="windowEndsAt">
                Window End Date
                {selectedSession?.endDate && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    (Session: {new Date(selectedSession.endDate).toLocaleDateString()})
                  </span>
                )}
              </Label>
              <Input
                id="windowEndsAt"
                type="datetime-local"
                {...register('windowEndsAt')}
                disabled={disabled}
                min={
                  selectedSession?.startDate
                    ? (() => {
                        // Extract date portion and format as YYYY-MM-DDTHH:mm in local timezone
                        const date = new Date(selectedSession.startDate)
                        const year = date.getFullYear()
                        const month = String(date.getMonth() + 1).padStart(2, '0')
                        const day = String(date.getDate()).padStart(2, '0')
                        return `${year}-${month}-${day}T00:00`
                      })()
                    : undefined
                }
                max={
                  selectedSession?.endDate
                    ? (() => {
                        // Extract date portion and format as YYYY-MM-DDTHH:mm in local timezone
                        const date = new Date(selectedSession.endDate)
                        const year = date.getFullYear()
                        const month = String(date.getMonth() + 1).padStart(2, '0')
                        const day = String(date.getDate()).padStart(2, '0')
                        return `${year}-${month}-${day}T23:59`
                      })()
                    : undefined
                }
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
                disabled={disabled}
              />
              {errors.durationSeconds && (
                <p className="text-sm text-destructive">
                  {errors.durationSeconds.message}
                </p>
              )}
            </div>

            {isEdit ? (
              <div className="space-y-2">
                {currentMasterPassword != null && currentMasterPassword !== '' && (
                  <div className="space-y-1">
                    <Label>Current Master Password</Label>
                    <p className="font-mono text-sm rounded-md border bg-muted/50 px-3 py-2 truncate" title={currentMasterPassword}>
                      {currentMasterPassword}
                    </p>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="masterPassword">New Master Password (optional)</Label>
                  <Input
                    id="masterPassword"
                    type="password"
                    {...register('masterPassword')}
                    placeholder="Leave blank to keep current"
                    disabled={disabled}
                  />
                  {errors.masterPassword && (
                    <p className="text-sm text-destructive">{errors.masterPassword.message}</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="masterPassword">Master Password</Label>
                <Input
                  id="masterPassword"
                  type="password"
                  {...register('masterPassword')}
                  placeholder="Enter master password"
                  disabled={disabled}
                />
                {errors.masterPassword && (
                  <p className="text-sm text-destructive">
                    {errors.masterPassword.message}
                  </p>
                )}
              </div>
            )}
          </div>

          {!readOnly && (
            <div className="flex gap-2">
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading
                  ? isEdit
                    ? 'Updating...'
                    : 'Creating...'
                  : isEdit
                    ? 'Update Exam'
                    : 'Create Exam'}
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
