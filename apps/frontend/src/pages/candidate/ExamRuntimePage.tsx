import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useExam, useSubmitAnswers, useSubmitExam } from '@/hooks/queries/useExamRuntime'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { LoadingState } from '@/components/shared/LoadingState'
import { ErrorState } from '@/components/shared/ErrorState'

export function ExamRuntimePage() {
  const { submissionId } = useParams<{ submissionId: string }>()
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string[]>>({})
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)

  const { data, isLoading, isError, error } = useExam(submissionId)
  const submitAnswersMutation = useSubmitAnswers(submissionId)
  const submitExamMutation = useSubmitExam(submissionId)

  // Calculate time remaining
  useEffect(() => {
    // Calculate expiresAt from startedAt + duration if not provided
    let expiresAt: string | undefined = data?.expiresAt

    if (!expiresAt && data?.startedAt && data?.durationSeconds) {
      const started = new Date(data.startedAt).getTime()
      const expires = new Date(started + data.durationSeconds * 1000)
      expiresAt = expires.toISOString()
    }

    if (!expiresAt) {
      // If we can't calculate timer, leave timeRemaining as null (already initialized)
      return
    }

    const updateTimer = () => {
      const now = new Date().getTime()
      const expires = new Date(expiresAt!).getTime()
      const remaining = Math.max(0, Math.floor((expires - now) / 1000))
      setTimeRemaining(remaining)
      if (remaining === 0 && !submitExamMutation.isPending) {
        submitExamMutation.mutate()
      }
    }
    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [data?.expiresAt, data?.startedAt, data?.durationSeconds, submissionId, submitExamMutation])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const handleAnswerChange = (questionId: string, optionId: string) => {
    setSelectedAnswers(prev => {
      const current = prev[questionId] || []
      const question = data?.sections.flatMap(s => s.questions).find(q => q.id === questionId)

      if (question?.type === 'single_select') {
        return { ...prev, [questionId]: [optionId] }
      } else {
        const newAnswers = current.includes(optionId)
          ? current.filter(id => id !== optionId)
          : [...current, optionId]
        return { ...prev, [questionId]: newAnswers }
      }
    })
  }

  const handleSaveAnswers = () => {
    if (!submissionId || !data) return

    const answers = Object.entries(selectedAnswers).map(([questionId, optionIds]) => ({
      questionId,
      selectedOptionIds: optionIds,
    }))

    submitAnswersMutation.mutate({
      submissionId,
      answers,
    })
  }

  const handleSubmit = () => {
    if (submissionId) {
      submitExamMutation.mutate()
    }
  }

  if (isLoading) {
    return <LoadingState message="Loading exam..." />
  }

  if (isError) {
    return <ErrorState message={error instanceof Error ? error.message : 'Failed to load exam'} />
  }

  if (!data) {
    return <ErrorState message="Exam data not found" />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{data.examTitle}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Submission ID: {data.submissionId}</p>
        </div>
        <div className="flex items-center gap-4">
          {timeRemaining !== null ? (
            <div className="rounded-md bg-muted px-4 py-2">
              <span className="text-lg font-mono font-semibold">{formatTime(timeRemaining)}</span>
            </div>
          ) : (
            <div className="rounded-md bg-muted px-4 py-2">
              <span className="text-lg font-mono font-semibold text-muted-foreground">
                Calculating...
              </span>
            </div>
          )}
          <Button
            variant="outline"
            onClick={handleSaveAnswers}
            disabled={submitAnswersMutation.isPending || timeRemaining === 0}
          >
            {submitAnswersMutation.isPending ? 'Saving...' : 'Save Answers'}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitExamMutation.isPending || timeRemaining === 0}
          >
            {submitExamMutation.isPending ? 'Submitting...' : 'Submit Exam'}
          </Button>
        </div>
      </div>

      <div className="space-y-8">
        {data.sections.map(section => (
          <Card key={section.id} className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-foreground">{section.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {section.type.charAt(0).toUpperCase() + section.type.slice(1)} Section
              </p>
            </div>

            <div className="space-y-6">
              {section.questions.map((question, qIndex) => (
                <div key={question.id} className="space-y-3">
                  <div className="flex items-start gap-2">
                    <span className="mt-1 text-sm font-medium text-muted-foreground">
                      {qIndex + 1}.
                    </span>
                    <p className="flex-1 text-sm font-medium text-foreground">{question.text}</p>
                  </div>

                  <div className="ml-6 space-y-2">
                    {question.options.map(option => {
                      const isSelected = selectedAnswers[question.id]?.includes(option.id)
                      return (
                        <label
                          key={option.id}
                          className="flex cursor-pointer items-center gap-2 rounded-md border border-border p-3 hover:bg-accent"
                        >
                          <input
                            type={question.type === 'single_select' ? 'radio' : 'checkbox'}
                            name={question.id}
                            checked={isSelected}
                            onChange={() => handleAnswerChange(question.id, option.id)}
                            className="h-4 w-4"
                          />
                          <span className="text-sm text-foreground">{option.text}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
