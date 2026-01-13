import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { LoadingState } from '@/components/shared/LoadingState'
import { EmptyState } from '@/components/shared/EmptyState'
import type { ExamSetSection } from '@/types/examSet.types'
import type { SectionQuestionsResponse } from '@/types/question.types'

interface QuestionsAssignmentPanelProps {
  section: ExamSetSection
  sectionQuestions?: SectionQuestionsResponse
  isLoading?: boolean
  onAssign: (questionIds: string[]) => void
  isAssigning?: boolean
  isPublished?: boolean
}

/**
 * QuestionsAssignmentPanel - Panel for assigning questions to a section
 */
export function QuestionsAssignmentPanel({
  section,
  sectionQuestions,
  isLoading = false,
  onAssign,
  isAssigning = false,
  isPublished = false,
}: QuestionsAssignmentPanelProps) {
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<string>>(new Set())

  const assignedQuestions = sectionQuestions?.assignedQuestions || []
  const availableQuestions = sectionQuestions?.availableQuestions || []
  const assignedCount = assignedQuestions.length
  const requiredCount = section.questionCount
  const remainingCount = Math.max(0, requiredCount - assignedCount)

  const handleToggleQuestion = (questionId: string) => {
    const newSelected = new Set(selectedQuestionIds)
    if (newSelected.has(questionId)) {
      newSelected.delete(questionId)
    } else {
      // Check if adding would exceed limit
      if (assignedCount + newSelected.size + 1 > requiredCount) {
        alert(`Cannot assign more than ${requiredCount} questions to this section`)
        return
      }
      newSelected.add(questionId)
    }
    setSelectedQuestionIds(newSelected)
  }

  const handleAssign = () => {
    if (selectedQuestionIds.size === 0) {
      alert('Please select at least one question')
      return
    }
    if (assignedCount + selectedQuestionIds.size > requiredCount) {
      alert(`Cannot assign more than ${requiredCount} questions to this section`)
      return
    }
    onAssign(Array.from(selectedQuestionIds))
    setSelectedQuestionIds(new Set())
  }

  if (isLoading) {
    return <LoadingState message="Loading questions..." />
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm">
          <span className="font-medium">Status:</span>{' '}
          <span className={assignedCount >= requiredCount ? 'text-green-600' : 'text-yellow-600'}>
            {assignedCount} / {requiredCount} assigned
          </span>
          {remainingCount > 0 && (
            <span className="ml-2 text-muted-foreground">
              ({remainingCount} more needed)
            </span>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium mb-2">Assigned Questions ({assignedCount})</h3>
          {assignedQuestions.length === 0 ? (
            <EmptyState
              title="No questions assigned"
              description="Select questions from available list below"
            />
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {assignedQuestions.map((q) => (
                <div
                  key={q.id}
                  className="p-2 border rounded text-sm bg-muted/50"
                >
                  {q.stem}
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-sm font-medium mb-2">
            Available Questions ({availableQuestions.length})
          </h3>
          {availableQuestions.length === 0 ? (
            <EmptyState
              title="No available questions"
              description="All questions of this category are already assigned"
            />
          ) : (
            <>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {availableQuestions.map((q) => (
                  <label
                    key={q.id}
                    className="flex items-start gap-2 p-2 border rounded cursor-pointer hover:bg-accent"
                  >
                    <input
                      type="checkbox"
                      checked={selectedQuestionIds.has(q.id)}
                      onChange={() => handleToggleQuestion(q.id)}
                      disabled={isPublished || isAssigning}
                      className="mt-1"
                    />
                    <span className="text-sm flex-1">{q.stem}</span>
                  </label>
                ))}
              </div>
              {!isPublished && (
                <Button
                  onClick={handleAssign}
                  disabled={isAssigning || selectedQuestionIds.size === 0}
                  className="mt-4 w-full"
                >
                  {isAssigning
                    ? 'Assigning...'
                    : `Assign ${selectedQuestionIds.size} Question${selectedQuestionIds.size !== 1 ? 's' : ''}`}
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

