import { useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useExam, useSubmitAnswers, useSubmitExam } from '@/queries/examRuntime.queries'
import { useExamTimer } from '@/hooks/useExamTimer'
import { useTabMonitoring } from '@/hooks/useTabMonitoring'
import { useDebouncedMutation } from '@/hooks/useDebouncedMutation'
import { ExamHeader } from './components/ExamHeader'
import { QuestionCard } from './components/QuestionCard'
import { SubmitDialog } from './components/SubmitDialog'
import { LoadingState } from '@/components/shared/LoadingState'
import { ErrorState } from '@/components/shared/ErrorState'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/constants'
import { useNavigate } from 'react-router-dom'

/**
 * ExamRuntimePage - Main exam taking page
 * Features:
 * - Backend-driven timer with 30s sync
 * - Question navigation (Previous/Next)
 * - Auto-save answers with debouncing
 * - Tab monitoring with warnings
 * - Auto-submit on timer expiry
 * - Manual submit with confirmation
 */
export function ExamRuntimePage() {
  const { submissionId } = useParams<{ submissionId: string }>()
  const navigate = useNavigate()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, string[]>
  >({})

  const { data, isLoading, isError, error } = useExam(submissionId)
  const submitAnswersMutation = useSubmitAnswers(submissionId)
  const submitExamMutation = useSubmitExam(submissionId)
  const debouncedSubmit = useDebouncedMutation(submitAnswersMutation, 500)

  // Tab monitoring
  const { violationCount, isDisabled, showWarning } = useTabMonitoring({
    submissionId,
    enabled: !!submissionId && !!data,
    maxViolations: 3,
    onMaxViolations: () => {
      // Disable exam after max violations
      submitExamMutation.mutate()
    },
  })

  // Timer - use duration from exam data if available
  const examDurationSeconds = data?.durationSeconds
  const { formattedTime, isExpired } = useExamTimer(
    data,
    examDurationSeconds,
    () => {
      // Auto-submit on expiry
      if (!submitExamMutation.isPending) {
        submitExamMutation.mutate()
      }
    },
  )

  // Flatten all questions for navigation
  const allQuestions = useMemo(() => {
    if (!data) return []
    return data.sections.flatMap((section) =>
      section.questions.map((q) => ({
        ...q,
        sectionName: section.name || section.type,
      })),
    )
  }, [data])

  const currentQuestion = allQuestions[currentQuestionIndex]
  const totalQuestions = allQuestions.length

  const handleAnswerChange = (questionId: string, optionId: string) => {
    if (isDisabled || isExpired) return

    setSelectedAnswers((prev) => {
      const current = prev[questionId] || []
      const question = allQuestions.find((q) => q.id === questionId)

      let newAnswers: string[]
      if (question?.type === 'single_select') {
        newAnswers = [optionId]
      } else {
        newAnswers = current.includes(optionId)
          ? current.filter((id) => id !== optionId)
          : [...current, optionId]
      }

      const updated = { ...prev, [questionId]: newAnswers }

      // Debounced auto-save
      if (submissionId) {
        const answersToSubmit = Object.entries(updated)
          .filter(([_, optionIds]) => optionIds.length > 0)
          .map(([qId, optionIds]) => ({
            questionId: qId,
            selectedOptionIds: optionIds,
          }))

        if (answersToSubmit.length > 0) {
          debouncedSubmit.debouncedMutate({
            submissionId,
            answers: answersToSubmit,
          })
        }
      }

      return updated
    })
  }

  const handleSaveAnswers = () => {
    if (!submissionId || !data || isDisabled || isExpired) return

    const answers = Object.entries(selectedAnswers)
      .filter(([_, optionIds]) => optionIds.length > 0)
      .map(([questionId, optionIds]) => ({
        questionId,
        selectedOptionIds: optionIds,
      }))

    if (answers.length > 0) {
      submitAnswersMutation.mutate({
        submissionId,
        answers,
      })
    }
  }

  const handleSubmit = () => {
    setShowSubmitDialog(true)
  }

  const handleConfirmSubmit = () => {
    if (submissionId) {
      submitExamMutation.mutate()
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  if (isLoading) {
    return <LoadingState message="Loading exam..." />
  }

  if (isError) {
    return (
      <ErrorState
        message={error instanceof Error ? error.message : 'Failed to load exam'}
      />
    )
  }

  if (!data || !currentQuestion) {
    return <ErrorState message="Exam data not found" />
  }

  if (isDisabled) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">
            Exam Disabled
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You have exceeded the maximum number of tab switches. Your exam has been submitted.
          </p>
          <Button
            className="mt-4"
            onClick={() => navigate(ROUTES.CANDIDATE_EXAM_RESULT.replace(':submissionId', submissionId!))}
          >
            View Results
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <ExamHeader
        examTitle={data.examTitle || data.examSetName || 'Exam'}
        timeRemaining={formattedTime}
        isExpired={isExpired}
        onSaveAnswers={handleSaveAnswers}
        onSubmit={handleSubmit}
        isSaving={submitAnswersMutation.isPending || debouncedSubmit.isPending}
        isSubmitting={submitExamMutation.isPending}
      />

      {showWarning && (
        <div className="border-b border-destructive bg-destructive/10 px-4 py-2 text-center text-sm text-destructive">
          Warning: You have switched tabs {violationCount} time(s). Please stay on this page.
        </div>
      )}

      <main className="flex-1 overflow-y-auto bg-background p-4 sm:p-6">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-6 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </span>
            <span className="text-sm text-muted-foreground">
              {currentQuestion.sectionName}
            </span>
          </div>

          <QuestionCard
            question={currentQuestion}
            questionNumber={currentQuestionIndex + 1}
            selectedOptionIds={selectedAnswers[currentQuestion.id] || []}
            onAnswerChange={(optionId) => handleAnswerChange(currentQuestion.id, optionId)}
            disabled={isDisabled || isExpired || submitExamMutation.isPending}
          />

          <div className="mt-6 flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0 || isExpired}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={handleNext}
              disabled={currentQuestionIndex === totalQuestions - 1 || isExpired}
            >
              Next
            </Button>
          </div>
        </div>
      </main>

      <SubmitDialog
        open={showSubmitDialog}
        onOpenChange={setShowSubmitDialog}
        onConfirm={handleConfirmSubmit}
        isSubmitting={submitExamMutation.isPending}
      />
    </div>
  )
}

