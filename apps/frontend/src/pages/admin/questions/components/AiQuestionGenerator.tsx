import { useState } from 'react'
import {
  useGenerateAiQuestions,
  useCommitAiQuestions,
} from '@/queries/ai-questions.queries'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { LoadingState } from '@/components/shared/LoadingState'
import { ErrorState } from '@/components/shared/ErrorState'
import { GeneratedQuestionsPreview } from './GeneratedQuestionsPreview'
import type {
  GenerateQuestionsRequest,
  GeneratedQuestion,
} from '@/types/ai-question.types'

/**
 * AiQuestionGenerator - Component for generating AI questions
 * Allows admins to generate, preview, and select questions
 */
export function AiQuestionGenerator() {
  const [category, setCategory] = useState<GenerateQuestionsRequest['category']>('aptitude')
  const [type, setType] = useState<GenerateQuestionsRequest['type']>('single_select')
  const [difficulty, setDifficulty] = useState<GenerateQuestionsRequest['difficulty'] | ''>('')
  const [count, setCount] = useState<number>(0)
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([])
  const [selectedTempIds, setSelectedTempIds] = useState<Set<string>>(new Set())
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const generateMutation = useGenerateAiQuestions()
  const commitMutation = useCommitAiQuestions()

  const handleGenerate = () => {
    const request: GenerateQuestionsRequest = {
      category,
      type,
      count,
      ...(difficulty ? { difficulty: difficulty as GenerateQuestionsRequest['difficulty'] } : {}),
    }

    generateMutation.mutate(request, {
      onSuccess: (data) => {
        setGeneratedQuestions(data.generated)
        setSelectedTempIds(new Set())
      },
    })
  }

  const handleToggleSelect = (tempId: string) => {
    const newSelected = new Set(selectedTempIds)
    if (newSelected.has(tempId)) {
      newSelected.delete(tempId)
    } else {
      newSelected.add(tempId)
    }
    setSelectedTempIds(newSelected)
  }

  const handleApproveSelected = () => {
    const selected = generatedQuestions.filter((q) => selectedTempIds.has(q.tempId))
    
    if (selected.length === 0) {
      return
    }

    commitMutation.mutate(
      { approved: selected },
      {
        onSuccess: (data) => {
          setSuccessMessage(
            `Successfully saved ${data.insertedCount} question${data.insertedCount !== 1 ? 's' : ''} to the database.`,
          )
          // Clear preview after success
          setGeneratedQuestions([])
          setSelectedTempIds(new Set())
          // Clear success message after 5 seconds
          setTimeout(() => setSuccessMessage(null), 5000)
        },
        onError: (error) => {
          // Error will be displayed via ErrorState component
          console.error('Failed to commit questions:', error)
        },
      },
    )
  }

  const hasSelected = selectedTempIds.size > 0
  const isGenerating = generateMutation.isPending
  const isCommitting = commitMutation.isPending

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI Question Generator</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value as GenerateQuestionsRequest['category'])
                }
                disabled={isGenerating}
              >
                <option value="aptitude">Aptitude</option>
                <option value="technical">Technical</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={type}
                onChange={(e) =>
                  setType(e.target.value as GenerateQuestionsRequest['type'])
                }
                disabled={isGenerating}
              >
                <option value="single_select">Single Select</option>
                <option value="multi_select">Multi Select</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Difficulty</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={difficulty}
                onChange={(e) =>
                  setDifficulty(
                    e.target.value as GenerateQuestionsRequest['difficulty'] | '',
                  )
                }
                disabled={isGenerating}
              >
                <option value="">Auto</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Count</label>
              <Input
                type="number"
                min={1}
                max={20}
                value={count}
                onChange={(e) => {
                  const value = parseInt(e.target.value, 10)
                  if (!isNaN(value) && value >= 1 && value <= 20) {
                    setCount(value)
                  }
                }}
                disabled={isGenerating}
              />
            </div>
          </div>

          <div className="mt-4">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || count < 1 || count > 20}
            >
              {isGenerating ? 'Generating...' : 'Generate Questions'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {generateMutation.isError && (
        <Card>
          <CardContent className="pt-6">
            <ErrorState
              message={
                generateMutation.error instanceof Error
                  ? generateMutation.error.message
                  : 'Failed to generate questions'
              }
              onRetry={() => generateMutation.reset()}
            />
          </CardContent>
        </Card>
      )}

      {isGenerating && (
        <Card>
          <CardContent className="pt-6">
            <LoadingState message="Generating questions with AI..." />
          </CardContent>
        </Card>
      )}

      {successMessage && (
        <Card>
          <CardContent className="pt-6">
            <div className="rounded-md bg-green-50 p-4 text-sm text-green-800 dark:bg-green-950/20 dark:text-green-400">
              {successMessage}
            </div>
          </CardContent>
        </Card>
      )}

      {commitMutation.isError && (
        <Card>
          <CardContent className="pt-6">
            <ErrorState
              message={
                commitMutation.error instanceof Error
                  ? commitMutation.error.message
                  : 'Failed to save questions'
              }
              onRetry={() => commitMutation.reset()}
            />
          </CardContent>
        </Card>
      )}

      {isCommitting && (
        <Card>
          <CardContent className="pt-6">
            <LoadingState message="Saving questions to database..." />
          </CardContent>
        </Card>
      )}

      {!isGenerating && generatedQuestions.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Generated Questions ({generatedQuestions.length})
              </CardTitle>
              <Button
                onClick={handleApproveSelected}
                disabled={!hasSelected || isCommitting}
                variant="default"
              >
                {isCommitting
                  ? 'Saving...'
                  : `Save Selected (${selectedTempIds.size})`}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <GeneratedQuestionsPreview
              questions={generatedQuestions}
              selectedTempIds={selectedTempIds}
              onToggleSelect={handleToggleSelect}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
