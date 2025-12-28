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
import type { CreateSessionRequest, UpdateSessionRequest } from '@/types/session.types'

const createSessionSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  year: z.number().int().min(2000).max(2100),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
}).refine((data) => {
  if (data.startDate && data.endDate) {
    return new Date(data.endDate) >= new Date(data.startDate)
  }
  return true
}, {
  message: 'End date must be after start date',
  path: ['endDate'],
})

const updateSessionSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  year: z.number().int().min(2000).max(2100).optional(),
  startDate: z.string().min(1, 'Start date is required').optional(),
  endDate: z.string().min(1, 'End date is required').optional(),
}).refine((data) => {
  if (data.startDate && data.endDate) {
    return new Date(data.endDate) >= new Date(data.startDate)
  }
  return true
}, {
  message: 'End date must be after start date',
  path: ['endDate'],
})

type SessionFormData = z.infer<typeof createSessionSchema> | z.infer<typeof updateSessionSchema>

interface SessionFormProps {
  onSubmit: (data: CreateSessionRequest | UpdateSessionRequest) => void
  isLoading?: boolean
  defaultValues?: Partial<SessionFormData>
  isEdit?: boolean
}

/**
 * SessionForm - Form component for creating recruitment sessions
 */
export function SessionForm({
  onSubmit,
  isLoading = false,
  defaultValues,
  isEdit = false,
}: SessionFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SessionFormData>({
    resolver: zodResolver(isEdit ? updateSessionSchema : createSessionSchema),
    defaultValues: defaultValues || {
      year: new Date().getFullYear(),
    },
  })

  const handleFormSubmit = (data: SessionFormData) => {
    if (isEdit) {
      onSubmit({
        ...(data.name !== undefined && { name: data.name }),
        ...(data.year !== undefined && { year: data.year }),
        ...(data.startDate !== undefined && { startDate: data.startDate }),
        ...(data.endDate !== undefined && { endDate: data.endDate }),
      } as UpdateSessionRequest)
    } else {
      onSubmit({
        name: data.name!,
        year: data.year!,
        startDate: data.startDate!,
        endDate: data.endDate!,
      } as CreateSessionRequest)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEdit ? 'Edit Recruitment Session' : 'Create Recruitment Session'}</CardTitle>
        <CardDescription>
          {isEdit
            ? 'Update recruitment session details'
            : 'Create a new recruitment session for organizing exams'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Session Name</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="e.g., Spring 2024 Recruitment"
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="year">Year</Label>
            <Input
              id="year"
              type="number"
              {...register('year', { valueAsNumber: true })}
              placeholder="2024"
              disabled={isLoading}
            />
            {errors.year && (
              <p className="text-sm text-destructive">{errors.year.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              {...register('startDate')}
              disabled={isLoading}
            />
            {errors.startDate && (
              <p className="text-sm text-destructive">
                {errors.startDate.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              {...register('endDate')}
              disabled={isLoading}
            />
            {errors.endDate && (
              <p className="text-sm text-destructive">{errors.endDate.message}</p>
            )}
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading
                ? isEdit
                  ? 'Updating...'
                  : 'Creating...'
                : isEdit
                  ? 'Update Session'
                  : 'Create Session'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
