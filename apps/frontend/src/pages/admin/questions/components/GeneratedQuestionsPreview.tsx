import { Card } from '@/components/ui/card'
import type { GeneratedQuestion } from '@/types/ai-question.types'

interface GeneratedQuestionsPreviewProps {
  questions: GeneratedQuestion[]
  selectedTempIds: Set<string>
  onToggleSelect: (tempId: string) => void
}

/**
 * GeneratedQuestionsPreview - Preview component for generated AI questions
 * Shows questions with checkboxes for selection
 */
export function GeneratedQuestionsPreview({
  questions,
  selectedTempIds,
  onToggleSelect,
}: GeneratedQuestionsPreviewProps) {
  if (questions?.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      {questions?.map((question) => (
        <Card key={question?.tempId} className="p-4">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={selectedTempIds.has(question?.tempId)}
              onChange={() => onToggleSelect(question?.tempId)}
              className="mt-1 h-4 w-4 shrink-0 cursor-pointer accent-primary"
              aria-label={`Select question: ${question?.stem}`}
            />
            <div className="flex-1 space-y-3">
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <p className="text-sm font-medium leading-relaxed text-foreground">
                    {question?.stem}
                  </p>
                  <div className="mt-1 flex gap-2 text-xs text-muted-foreground">
                    <span className="capitalize">{question?.category}</span>
                    <span>•</span>
                    <span className="capitalize">{question?.difficulty}</span>
                    <span>•</span>
                    <span>
                      {question?.type === 'single_select' ? 'Single' : 'Multi'} Select
                    </span>
                  </div>
                </div>
              </div>

              <div className="ml-0 space-y-2">
                {question?.options.map((option, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-2 rounded-md border p-2 text-sm ${
                      option.isCorrect
                        ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                        : 'border-border bg-card'
                    }`}
                  >
                    <span
                      className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${
                        option?.isCorrect ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    />
                    <span
                      className={`flex-1 ${
                        option?.isCorrect
                          ? 'font-medium text-green-700 dark:text-green-400'
                          : 'text-foreground'
                      }`}
                    >
                      {option?.optionText}
                    </span>
                    {option?.isCorrect && (
                      <span className="text-xs font-medium text-green-600 dark:text-green-400">
                        Correct
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
