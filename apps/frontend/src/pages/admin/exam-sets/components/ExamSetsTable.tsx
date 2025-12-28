import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { SubmitDialog } from '@/pages/exam/components/SubmitDialog'
import type { ExamSet } from '@/types/examSet.types'

interface ExamSetsTableProps {
  examSets: ExamSet[]
  isLoading?: boolean
  onDelete?: (setId: string) => void
  isDeleting?: boolean
  isPublished?: boolean
}

/**
 * ExamSetsTable - Table component for displaying exam sets
 */
export function ExamSetsTable({
  examSets,
  isLoading,
  onDelete,
  isDeleting = false,
  isPublished = false,
}: ExamSetsTableProps) {
  const navigate = useNavigate()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedSetId, setSelectedSetId] = useState<string | null>(null)

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded-md bg-muted" />
        ))}
      </div>
    )
  }

  if (examSets.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        No exam sets found
      </div>
    )
  }

  const handleDeleteClick = (setId: string) => {
    setSelectedSetId(setId)
    setShowDeleteDialog(true)
  }

  const handleConfirmDelete = () => {
    if (selectedSetId && onDelete) {
      onDelete(selectedSetId)
      setShowDeleteDialog(false)
      setSelectedSetId(null)
    }
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Sections</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {examSets.map((set) => {
            const aptitudeSection = set.sections?.find((s) => s.sectionType === 'aptitude')
            const technicalSection = set.sections?.find((s) => s.sectionType === 'technical')
            const hasBothSections = aptitudeSection && technicalSection

            return (
              <TableRow key={set.id}>
                <TableCell className="font-medium">{set.name}</TableCell>
                <TableCell>
                  <div className="space-y-1 text-sm">
                    <div>
                      Aptitude:{' '}
                      {aptitudeSection ? (
                        <span className="text-muted-foreground">
                          {aptitudeSection.questionCount} questions
                        </span>
                      ) : (
                        <span className="text-destructive">Missing</span>
                      )}
                    </div>
                    <div>
                      Technical:{' '}
                      {technicalSection ? (
                        <span className="text-muted-foreground">
                          {technicalSection.questionCount} questions
                        </span>
                      ) : (
                        <span className="text-destructive">Missing</span>
                      )}
                    </div>
                    {hasBothSections && (
                      <div className="text-xs text-green-600 dark:text-green-400">
                        ✓ Ready
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(set.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Navigate to questions assignment page
                        navigate(`/admin/exams/${set.examId}/sets/${set.id}/questions`)
                      }}
                    >
                      Manage Questions
                    </Button>
                    {!isPublished && onDelete && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteClick(set.id)}
                        disabled={isDeleting}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      {showDeleteDialog && (
        <SubmitDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onConfirm={handleConfirmDelete}
          isSubmitting={isDeleting}
          title="Delete Exam Set"
          description="Are you sure you want to delete this exam set? This action cannot be undone."
          confirmText="Delete"
          variant="destructive"
        />
      )}
    </>
  )
}

