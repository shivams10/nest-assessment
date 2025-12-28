import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSectionQuestions, useAssignQuestions } from '@/queries/questions.queries'
import { useExamSets } from '@/queries/examSets.queries'
import { useExam } from '@/queries/exams.queries'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingState } from '@/components/shared/LoadingState'
import { ErrorState } from '@/components/shared/ErrorState'
import { ROUTES } from '@/constants'
import { QuestionsAssignmentPanel } from './components/QuestionsAssignmentPanel'

/**
 * ExamSetQuestionsPage - Page for managing questions in an exam set
 * Route: /admin/exams/:examId/sets/:setId/questions
 */
export function ExamSetQuestionsPage() {
  const { examId, setId } = useParams<{ examId: string; setId: string }>()
  const navigate = useNavigate()
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null)

  const { data: exam, isLoading: examLoading } = useExam(examId)
  const { data: examSetsData, isLoading: setsLoading } = useExamSets(
    { examId: examId || '' },
    { enabled: !!examId },
  )

  const examSet = examSetsData?.items?.find((set) => set.id === setId)
  const aptitudeSection = examSet?.sections?.find((s) => s.sectionType === 'aptitude')
  const technicalSection = examSet?.sections?.find((s) => s.sectionType === 'technical')

  // Use the first section as default if none selected
  const activeSectionId = selectedSectionId || aptitudeSection?.id || technicalSection?.id

  const { data: sectionQuestions, isLoading: questionsLoading } = useSectionQuestions(
    activeSectionId || undefined,
  )

  const assignQuestionsMutation = useAssignQuestions()

  const isPublished = exam?.isPublished ?? false

  if (!examId || !setId) {
    return <ErrorState message="Exam ID or Set ID is missing." />
  }

  if (examLoading || setsLoading) {
    return <LoadingState message="Loading exam details..." />
  }

  if (!examSet) {
    return <ErrorState message="Exam set not found." />
  }

  if (!aptitudeSection && !technicalSection) {
    return (
      <ErrorState
        message="No sections found for this exam set. Please create sections first."
        onRetry={() => navigate(ROUTES.ADMIN_EXAM_SETS.replace(':examId', examId))}
      />
    )
  }

  const handleAssignQuestions = (sectionId: string, questionIds: string[]) => {
    assignQuestionsMutation.mutate(
      {
        examSetSectionId: sectionId,
        questionIds,
      },
      {
        onSuccess: () => {
          // Success handled by query invalidation
        },
      },
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Manage Questions</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Assign questions to exam set sections for: {examSet.name}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate(ROUTES.ADMIN_EXAM_SETS.replace(':examId', examId))}
        >
          ← Back to Exam Sets
        </Button>
      </div>

      {isPublished && (
        <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
          <CardContent className="pt-6">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              This exam is published. Question assignments cannot be modified.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {aptitudeSection && (
          <Card>
            <CardHeader>
              <CardTitle>Aptitude Section</CardTitle>
              <p className="text-sm text-muted-foreground">
                Required: {aptitudeSection.questionCount} questions | Assigned:{' '}
                {activeSectionId === aptitudeSection.id && sectionQuestions
                  ? sectionQuestions.assignedQuestions.length
                  : aptitudeSection.assignedQuestionsCount ?? 0}
              </p>
            </CardHeader>
            <CardContent>
              {selectedSectionId === aptitudeSection.id || !selectedSectionId ? (
                <QuestionsAssignmentPanel
                  section={aptitudeSection}
                  sectionQuestions={activeSectionId === aptitudeSection.id ? sectionQuestions : undefined}
                  isLoading={questionsLoading && activeSectionId === aptitudeSection.id}
                  onAssign={(questionIds) => handleAssignQuestions(aptitudeSection.id, questionIds)}
                  isAssigning={assignQuestionsMutation.isPending}
                  isPublished={isPublished}
                />
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setSelectedSectionId(aptitudeSection.id)}
                >
                  Load Questions
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {technicalSection && (
          <Card>
            <CardHeader>
              <CardTitle>Technical Section</CardTitle>
              <p className="text-sm text-muted-foreground">
                Required: {technicalSection.questionCount} questions | Assigned:{' '}
                {activeSectionId === technicalSection.id && sectionQuestions
                  ? sectionQuestions.assignedQuestions.length
                  : technicalSection.assignedQuestionsCount ?? 0}
              </p>
            </CardHeader>
            <CardContent>
              {selectedSectionId === technicalSection.id ? (
                <QuestionsAssignmentPanel
                  section={technicalSection}
                  sectionQuestions={sectionQuestions}
                  isLoading={questionsLoading}
                  onAssign={(questionIds) => handleAssignQuestions(technicalSection.id, questionIds)}
                  isAssigning={assignQuestionsMutation.isPending}
                  isPublished={isPublished}
                />
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setSelectedSectionId(technicalSection.id)}
                >
                  Load Questions
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
