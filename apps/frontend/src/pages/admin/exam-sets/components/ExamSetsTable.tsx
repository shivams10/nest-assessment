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
import { Input } from '@/components/ui/input'
import { SubmitDialog } from '@/pages/exam/components/SubmitDialog'
import { useUpdateExamSetSection, useCreateExamSetSection } from '@/queries/examSets.queries'
import { CreateSectionDialog } from './CreateSectionDialog'
import { ROUTES } from '@/constants'
import type { ExamSet, SectionType } from '@/types/examSet.types'

interface ExamSetsTableProps {
  examSets: ExamSet[]
  isLoading?: boolean
  onDelete?: (setId: string) => void
  isDeleting?: boolean
  isPublished?: boolean
  onSectionCreated?: () => void
}

/**
 * ExamSetsTable - Table component for displaying exam sets with inline editing
 */
export function ExamSetsTable({
  examSets,
  isLoading,
  onDelete,
  isDeleting = false,
  isPublished = false,
  onSectionCreated,
}: ExamSetsTableProps) {
  const navigate = useNavigate()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedSetId, setSelectedSetId] = useState<string | null>(null)
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null)
  const [editingValue, setEditingValue] = useState<string>('')
  const [showCreateSectionDialog, setShowCreateSectionDialog] = useState(false)
  const [selectedSetForSection, setSelectedSetForSection] = useState<{
    setId: string
    sectionType: SectionType
  } | null>(null)

  const updateSectionMutation = useUpdateExamSetSection()
  const createSectionMutation = useCreateExamSetSection()

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

  const handleEditClick = (sectionId: string, currentCount: number) => {
    setEditingSectionId(sectionId)
    setEditingValue(currentCount.toString())
  }

  const handleSaveEdit = (sectionId: string) => {
    const newCount = parseInt(editingValue, 10)
    if (isNaN(newCount) || newCount < 1) {
      alert('Question count must be at least 1')
      return
    }

    updateSectionMutation.mutate(
      {
        sectionId,
        data: { questionCount: newCount },
      },
      {
        onSuccess: () => {
          setEditingSectionId(null)
          setEditingValue('')
        },
      },
    )
  }

  const handleCancelEdit = () => {
    setEditingSectionId(null)
    setEditingValue('')
  }

  const handleCreateSectionClick = (setId: string, sectionType: SectionType) => {
    setSelectedSetForSection({ setId, sectionType })
    setShowCreateSectionDialog(true)
  }

  const handleCreateSection = (sectionType: SectionType, questionCount: number) => {
    if (!selectedSetForSection) return

    createSectionMutation.mutate(
      {
        examSetId: selectedSetForSection.setId,
        sectionType,
        questionCount,
      },
      {
        onSuccess: () => {
          setShowCreateSectionDialog(false)
          setSelectedSetForSection(null)
          if (onSectionCreated) {
            onSectionCreated()
          }
        },
      },
    )
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
                  <div className="space-y-2 text-sm">
                    <div>
                      Aptitude:{' '}
                      {aptitudeSection ? (
                        <span className="flex items-center gap-2">
                          {editingSectionId === aptitudeSection.id ? (
                            <>
                              <Input
                                type="number"
                                min="1"
                                value={editingValue}
                                onChange={(e) => setEditingValue(e.target.value)}
                                className="h-8 w-20"
                                disabled={updateSectionMutation.isPending}
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSaveEdit(aptitudeSection.id)}
                                disabled={updateSectionMutation.isPending}
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleCancelEdit}
                                disabled={updateSectionMutation.isPending}
                              >
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <>
                              <span className="text-muted-foreground">
                                {aptitudeSection.assignedQuestionsCount ?? 0} /{' '}
                                {aptitudeSection.questionCount} assigned
                              </span>
                              {!isPublished && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() =>
                                    handleEditClick(aptitudeSection.id, aptitudeSection.questionCount)
                                  }
                                  className="ml-2 h-6 px-2 text-xs"
                                >
                                  Edit
                                </Button>
                              )}
                            </>
                          )}
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <span className="text-destructive">Missing</span>
                          {!isPublished && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCreateSectionClick(set.id, 'aptitude')}
                              className="h-6 px-2 text-xs"
                            >
                              Create
                            </Button>
                          )}
                        </span>
                      )}
                    </div>
                    <div>
                      Technical:{' '}
                      {technicalSection ? (
                        <span className="flex items-center gap-2">
                          {editingSectionId === technicalSection.id ? (
                            <>
                              <Input
                                type="number"
                                min="1"
                                value={editingValue}
                                onChange={(e) => setEditingValue(e.target.value)}
                                className="h-8 w-20"
                                disabled={updateSectionMutation.isPending}
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSaveEdit(technicalSection.id)}
                                disabled={updateSectionMutation.isPending}
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleCancelEdit}
                                disabled={updateSectionMutation.isPending}
                              >
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <>
                              <span className="text-muted-foreground">
                                {technicalSection.assignedQuestionsCount ?? 0} /{' '}
                                {technicalSection.questionCount} assigned
                              </span>
                              {!isPublished && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() =>
                                    handleEditClick(
                                      technicalSection.id,
                                      technicalSection.questionCount,
                                    )
                                  }
                                  className="ml-2 h-6 px-2 text-xs"
                                >
                                  Edit
                                </Button>
                              )}
                            </>
                          )}
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <span className="text-destructive">Missing</span>
                          {!isPublished && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCreateSectionClick(set.id, 'technical')}
                              className="h-6 px-2 text-xs"
                            >
                              Create
                            </Button>
                          )}
                        </span>
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
                        navigate(
                          ROUTES.ADMIN_EXAM_SET_QUESTIONS.replace(':examId', set.examId).replace(
                            ':setId',
                            set.id,
                          ),
                        )
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

      {showCreateSectionDialog && selectedSetForSection && (
        <CreateSectionDialog
          open={showCreateSectionDialog}
          onOpenChange={setShowCreateSectionDialog}
          onSubmit={handleCreateSection}
          sectionType={selectedSetForSection.sectionType}
          isLoading={createSectionMutation.isPending}
        />
      )}
    </>
  )
}
