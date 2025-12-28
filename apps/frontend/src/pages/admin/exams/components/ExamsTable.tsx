import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/constants'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { SubmitDialog } from '@/pages/exam/components/SubmitDialog'
import { ExamStatusBadge } from './ExamStatusBadge'
import type { Exam } from '@/types/exam.types'

interface ExamsTableProps {
  exams: Exam[]
  isLoading?: boolean
  onPublish?: (examId: string, onError?: (error: Error) => void, onSuccess?: () => void) => void
  onUnpublish?: (examId: string) => void
  onEdit?: (examId: string) => void
  onDelete?: (examId: string) => void
  isPublishing?: boolean
  isUnpublishing?: boolean
  isDeleting?: boolean
}

/**
 * ExamsTable - Table component for displaying exams
 */
export function ExamsTable({
  exams,
  isLoading,
  onPublish,
  onUnpublish,
  onEdit,
  onDelete,
  isPublishing = false,
  isUnpublishing = false,
  isDeleting = false,
}: ExamsTableProps) {
  const navigate = useNavigate()
  const [showPublishDialog, setShowPublishDialog] = useState(false)
  const [showUnpublishDialog, setShowUnpublishDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null)
  const [localPublishError, setLocalPublishError] = useState<Error | null>(null)
  const [copiedSessionId, setCopiedSessionId] = useState<string | null>(null)

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const handleCopySessionId = async (sessionId: string) => {
    try {
      await navigator.clipboard.writeText(sessionId)
      setCopiedSessionId(sessionId)
      setTimeout(() => {
        setCopiedSessionId(null)
      }, 2000)
    } catch (error) {
      console.error('Failed to copy session ID:', error)
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = sessionId
      textArea.style.position = 'fixed'
      textArea.style.opacity = '0'
      document.body.appendChild(textArea)
      textArea.select()
      try {
        document.execCommand('copy')
        setCopiedSessionId(sessionId)
        setTimeout(() => {
          setCopiedSessionId(null)
        }, 2000)
      } catch (err) {
        console.error('Fallback copy failed:', err)
      }
      document.body.removeChild(textArea)
    }
  }

  const handlePublishClick = (examId: string) => {
    // Clear any previous error when opening dialog for a different exam
    if (selectedExamId !== examId) {
      setLocalPublishError(null)
    }
    setSelectedExamId(examId)
    setShowPublishDialog(true)
  }

  const handleUnpublishClick = (examId: string) => {
    setSelectedExamId(examId)
    setShowUnpublishDialog(true)
  }

  const handleConfirmPublish = () => {
    if (selectedExamId && onPublish) {
      setLocalPublishError(null) // Clear previous error
      onPublish(
        selectedExamId,
        error => {
          // Callback to set error when mutation fails
          setLocalPublishError(error)
        },
        () => {
          // Callback to close dialog when mutation succeeds
          setShowPublishDialog(false)
          setSelectedExamId(null)
          setLocalPublishError(null)
        }
      )
    }
  }

  const handleConfirmUnpublish = () => {
    if (selectedExamId && onUnpublish) {
      onUnpublish(selectedExamId)
      setShowUnpublishDialog(false)
      setSelectedExamId(null)
    }
  }

  const handleDeleteClick = (examId: string) => {
    setSelectedExamId(examId)
    setShowDeleteDialog(true)
  }

  const handleConfirmDelete = () => {
    if (selectedExamId && onDelete) {
      onDelete(selectedExamId)
      setShowDeleteDialog(false)
      setSelectedExamId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded-md bg-muted" />
        ))}
      </div>
    )
  }

  if (exams.length === 0) {
    return <div className="py-8 text-center text-sm text-muted-foreground">No exams found</div>
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Session ID</TableHead>
            <TableHead>Window Start</TableHead>
            <TableHead>Window End</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {exams.map(exam => (
            <TableRow key={exam.id}>
              <TableCell className="font-medium">{exam.title}</TableCell>
              <TableCell className="max-w-xs truncate text-muted-foreground">
                {exam.description || 'No description'}
              </TableCell>
              <TableCell>
                <div className="relative">
                  <button
                    onClick={() => handleCopySessionId(exam.collegeSessionId)}
                    className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors cursor-pointer group"
                    title={exam.collegeSessionId}
                  >
                    <span className="font-mono text-xs max-w-[120px] truncate block">
                      {exam.collegeSessionId}
                    </span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </button>
                  {copiedSessionId === exam.collegeSessionId && (
                    <div className="absolute left-0 top-full mt-1 px-2 py-1 text-xs text-green-600 bg-green-50 dark:bg-green-950 rounded border border-green-200 dark:border-green-800 whitespace-nowrap z-10">
                      ✓ Copied!
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>{formatDate(exam.windowStartsAt)}</TableCell>
              <TableCell>{formatDate(exam.windowEndsAt)}</TableCell>
              <TableCell>{formatDuration(exam.durationSeconds)}</TableCell>
              <TableCell>
                <ExamStatusBadge isPublished={exam.isPublished} />
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigate(ROUTES.ADMIN_EXAM_SETS.replace(':examId', exam.id))
                    }}
                  >
                    View Sets
                  </Button>
                  {!exam.isPublished && onEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (onEdit) {
                          onEdit(exam.id)
                        } else {
                          navigate(ROUTES.ADMIN_EXAMS_EDIT.replace(':id', exam.id))
                        }
                      }}
                    >
                      Edit
                    </Button>
                  )}
                  {exam.isPublished ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUnpublishClick(exam.id)}
                      disabled={isUnpublishing}
                    >
                      Unpublish
                    </Button>
                  ) : (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handlePublishClick(exam.id)}
                      disabled={isPublishing}
                    >
                      Publish
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteClick(exam.id)}
                      disabled={isDeleting}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {showPublishDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => !isPublishing && setShowPublishDialog(false)}
        >
          <Card className="w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Publish Exam</h2>
              <p className="text-sm text-muted-foreground">
                Are you sure you want to publish this exam? Once published, candidates will be able
                to see and take it.
              </p>

              {localPublishError &&
                (() => {
                  const error = localPublishError
                  const errorWithReasons = error as any
                  const hasReasons =
                    errorWithReasons?.reasons &&
                    Array.isArray(errorWithReasons.reasons) &&
                    errorWithReasons.reasons.length > 0

                  return (
                    <div className="rounded-md border border-destructive bg-destructive/10 p-4">
                      <h3 className="text-sm font-semibold text-destructive mb-2">
                        Cannot Publish Exam
                      </h3>
                      <p className="text-sm text-destructive mb-2">
                        {error?.message || 'Failed to publish exam'}
                      </p>
                      {hasReasons && (
                        <ul className="list-inside list-disc space-y-1 text-sm text-destructive/90">
                          {errorWithReasons.reasons.map((reason: string, index: number) => (
                            <li key={index}>{reason}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )
                })()}

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPublishDialog(false)
                    setSelectedExamId(null)
                    setLocalPublishError(null)
                  }}
                  disabled={isPublishing}
                >
                  {localPublishError ? 'Close' : 'Cancel'}
                </Button>
                {!localPublishError && (
                  <Button onClick={handleConfirmPublish} disabled={isPublishing}>
                    {isPublishing ? 'Publishing...' : 'Publish Exam'}
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}

      {showUnpublishDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => !isUnpublishing && setShowUnpublishDialog(false)}
        >
          <Card className="w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Unpublish Exam</h2>
              <p className="text-sm text-muted-foreground">
                Are you sure you want to unpublish this exam? Candidates will no longer be able to
                see or take it.
              </p>
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowUnpublishDialog(false)}
                  disabled={isUnpublishing}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleConfirmUnpublish}
                  disabled={isUnpublishing}
                >
                  {isUnpublishing ? 'Unpublishing...' : 'Unpublish Exam'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {showDeleteDialog && (
        <SubmitDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onConfirm={handleConfirmDelete}
          isSubmitting={isDeleting}
          title="Delete Exam"
          description="Are you sure you want to delete this exam? This action cannot be undone."
          confirmText="Delete"
          variant="destructive"
        />
      )}
    </>
  )
}
