import { useState } from 'react'
import axios from 'axios'

import { TagInput } from '@/components/ui'
import { QUESTION_TYPE_LABEL } from '@/constants/questions'
import { useCreateQuestionBankItem } from '@/hooks/useCreateQuestionBankItem'
import { useUpdateQuestionBankItem } from '@/hooks/useUpdateQuestionBankItem'
import { useQuestionBankTags } from '@/hooks/useQuestionBankTags'
import type {
  QuestionBankDetailItem,
  QuestionDifficulty,
  QuestionType,
} from '@/hooks/useQuestionBank'

type Option   = { text: string; isCorrect: boolean }
type TestCase = { input: string; expectedOutput: string; isHidden: boolean; weight: number }

const EMPTY_OPTIONS: Option[]     = [{ text: '', isCorrect: false }, { text: '', isCorrect: false }]
const EMPTY_TEST_CASES: TestCase[] = [{ input: '', expectedOutput: '', isHidden: false, weight: 1 }]

const isMcq = (type: QuestionType) => type === 'mcq_single' || type === 'mcq_multi'

type QuestionFormProps = {
  onSaved:      (question: QuestionBankDetailItem) => void
  onCancel?:    () => void
  initialTags?: string[]
  // When set, the form edits this question instead of creating a new one.
  question?:    QuestionBankDetailItem
}

export const QuestionForm = ({
  onSaved,
  onCancel,
  initialTags = [],
  question,
}: QuestionFormProps) => {
  const isEditing = Boolean(question)

  const [tags, setTags] = useState<string[]>(question?.tags ?? initialTags)
  const [type, setType] = useState<QuestionType>(question?.type ?? 'mcq_single')
  const [prompt, setPrompt] = useState(question?.prompt ?? '')
  const [difficulty, setDifficulty] = useState<QuestionDifficulty>(
    question?.difficulty ?? 'medium',
  )
  const [points, setPoints] = useState(String(question?.points ?? 1))
  const [options, setOptions] = useState<Option[]>(
    question?.options?.length ? question.options : EMPTY_OPTIONS,
  )
  const [testCases, setTestCases] = useState<TestCase[]>(
    question?.testCases?.length
      ? question.testCases.map((tc) => ({
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          isHidden: tc.isHidden,
          weight: tc.weight,
        }))
      : EMPTY_TEST_CASES,
  )
  const [error, setError] = useState<string | null>(null)

  const { data: tagSuggestions } = useQuestionBankTags()
  const createQuestion = useCreateQuestionBankItem()
  const updateQuestion = useUpdateQuestionBankItem()
  const saving = createQuestion.isPending || updateQuestion.isPending

  const reset = () => {
    setPrompt('')
    setOptions(EMPTY_OPTIONS)
    setTestCases(EMPTY_TEST_CASES)
  }

  const handleError = (err: unknown) => {
    const message =
      axios.isAxiosError(err) && typeof err.response?.data?.message === 'string'
        ? err.response.data.message
        : 'Could not save the question. Please try again.'
    setError(message)
  }

  const handleSubmit = () => {
    setError(null)

    if (tags.length === 0) {
      setError('Add at least one tag.')
      return
    }
    if (!prompt.trim()) {
      setError('Prompt is required.')
      return
    }

    const filledOptions = options.filter((o) => o.text.trim())
    if (isMcq(type)) {
      if (filledOptions.length < 2) {
        setError('Add at least 2 options.')
        return
      }
      const correct = filledOptions.filter((o) => o.isCorrect).length
      if (type === 'mcq_single' && correct !== 1) {
        setError('Mark exactly one option as correct.')
        return
      }
      if (type === 'mcq_multi' && correct < 1) {
        setError('Mark at least one option as correct.')
        return
      }
    }

    const filledTestCases = testCases.filter((tc) => tc.input.trim() && tc.expectedOutput.trim())
    if (type === 'coding' && filledTestCases.length < 1) {
      setError('Add at least one test case with input and expected output.')
      return
    }

    if (question) {
      updateQuestion.mutate(
        {
          id: question.id,
          tags,
          difficulty,
          prompt: prompt.trim(),
          points: Number(points) || 1,
          options: isMcq(type) ? filledOptions : undefined,
          testCases: type === 'coding' ? filledTestCases : undefined,
        },
        { onSuccess: onSaved, onError: handleError },
      )
      return
    }

    createQuestion.mutate(
      {
        tags,
        type,
        difficulty,
        prompt: prompt.trim(),
        points: Number(points) || 1,
        options: isMcq(type) ? filledOptions : undefined,
        testCases: type === 'coding' ? filledTestCases : undefined,
      },
      {
        onSuccess: (created) => {
          reset()
          onSaved(created)
        },
        onError: handleError,
      },
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-content-secondary">Tags</label>
        <TagInput
          value={tags}
          onChange={setTags}
          suggestions={tagSuggestions ?? []}
          placeholder="e.g. backend, react, typescript"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-content-secondary">Type</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as QuestionType)}
          disabled={isEditing}
          className="h-9 w-full rounded-md border border-border px-2 text-sm text-content-primary disabled:bg-surface-subtle disabled:text-content-secondary"
        >
          {Object.entries(QUESTION_TYPE_LABEL).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        {isEditing && (
          <p className="mt-1 text-xs text-content-muted">
            Type cannot be changed. Delete the question and add a new one instead.
          </p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-content-secondary">Question</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
          placeholder="Write the question here"
          className="w-full rounded-md border border-border px-3 py-2 text-sm text-content-primary focus:border-brand focus:outline-none"
        />
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <label className="mb-1 block text-xs font-medium text-content-secondary">Difficulty</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as QuestionDifficulty)}
            className="h-9 w-full rounded-md border border-border px-2 text-sm text-content-primary"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        <div className="w-24">
          <label className="mb-1 block text-xs font-medium text-content-secondary">Points</label>
          <input
            type="number"
            min={1}
            value={points}
            onChange={(e) => setPoints(e.target.value)}
            className="h-9 w-full rounded-md border border-border px-2 text-sm text-content-primary"
          />
        </div>
      </div>

      {isMcq(type) && (
        <div>
          <label className="mb-1 block text-xs font-medium text-content-secondary">
            Options — tick the correct {type === 'mcq_single' ? 'answer' : 'answers'}
          </label>
          <div className="flex flex-col gap-1.5">
            {options.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={option.isCorrect}
                  onChange={(e) =>
                    setOptions((prev) =>
                      prev.map((o, i) => {
                        if (i !== index) {
                          // Single-select allows only one correct option at a time.
                          return type === 'mcq_single' && e.target.checked
                            ? { ...o, isCorrect: false }
                            : o
                        }
                        return { ...o, isCorrect: e.target.checked }
                      }),
                    )
                  }
                />
                <input
                  placeholder={`Option ${index + 1}`}
                  value={option.text}
                  onChange={(e) =>
                    setOptions((prev) =>
                      prev.map((o, i) => (i === index ? { ...o, text: e.target.value } : o)),
                    )
                  }
                  className="h-8 flex-1 rounded-md border border-border px-2 text-sm text-content-primary"
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => setOptions((prev) => prev.filter((_, i) => i !== index))}
                    className="text-xs text-content-muted hover:text-content-secondary"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => setOptions((prev) => [...prev, { text: '', isCorrect: false }])}
              className="self-start text-xs font-medium text-brand hover:underline"
            >
              + Add option
            </button>
          </div>
        </div>
      )}

      {type === 'coding' && (
        <div>
          <label className="mb-1 block text-xs font-medium text-content-secondary">Test cases</label>
          <div className="flex flex-col gap-2">
            {testCases.map((testCase, index) => (
              <div key={index} className="flex flex-col gap-1 rounded-md border border-surface-subtle p-2">
                <input
                  placeholder="Input"
                  value={testCase.input}
                  onChange={(e) =>
                    setTestCases((prev) =>
                      prev.map((tc, i) => (i === index ? { ...tc, input: e.target.value } : tc)),
                    )
                  }
                  className="h-8 rounded-md border border-border px-2 text-sm text-content-primary"
                />
                <input
                  placeholder="Expected output"
                  value={testCase.expectedOutput}
                  onChange={(e) =>
                    setTestCases((prev) =>
                      prev.map((tc, i) =>
                        i === index ? { ...tc, expectedOutput: e.target.value } : tc,
                      ),
                    )
                  }
                  className="h-8 rounded-md border border-border px-2 text-sm text-content-primary"
                />
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-xs text-content-secondary">
                    <input
                      type="checkbox"
                      checked={testCase.isHidden}
                      onChange={(e) =>
                        setTestCases((prev) =>
                          prev.map((tc, i) =>
                            i === index ? { ...tc, isHidden: e.target.checked } : tc,
                          ),
                        )
                      }
                    />
                    Hidden from candidate
                  </label>
                  {testCases.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setTestCases((prev) => prev.filter((_, i) => i !== index))}
                      className="text-xs text-content-muted hover:text-content-secondary"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setTestCases((prev) => [
                  ...prev,
                  { input: '', expectedOutput: '', isHidden: false, weight: 1 },
                ])
              }
              className="self-start text-xs font-medium text-brand hover:underline"
            >
              + Add test case
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-status-error-text">{error}</p>}

      <div className="flex justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="h-9 rounded-md border border-border px-4 text-sm font-medium text-content-primary disabled:opacity-50"
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="h-9 rounded-md bg-brand px-4 text-sm font-medium text-white hover:bg-brand-hover disabled:opacity-50"
        >
          {saving ? 'Saving…' : isEditing ? 'Save Changes' : 'Add Question'}
        </button>
      </div>
    </div>
  )
}
