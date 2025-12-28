import { Card } from '@/components/ui/card'
import { OptionItem } from './OptionItem'
import type { ExamQuestion } from '@/services/exam-runtime.service'

interface QuestionCardProps {
  question: ExamQuestion
  questionNumber: number
  selectedOptionIds: string[]
  onAnswerChange: (optionId: string) => void
  disabled?: boolean
  sectionName?: string
}

/**
 * QuestionCard - Card component for displaying a single question
 * Shows question text and options
 * Handles answer selection
 */
export function QuestionCard({
  question,
  questionNumber,
  selectedOptionIds,
  onAnswerChange,
  disabled = false,
}: QuestionCardProps) {
  return (
    <Card className="p-4 sm:p-6">
      <div className="space-y-4">
        <div className="flex items-start gap-2">
          <span className="mt-1 shrink-0 text-sm font-semibold text-muted-foreground">
            {questionNumber}.
          </span>
          <p className="flex-1 text-sm font-medium leading-relaxed text-foreground sm:text-base">
            {question.text || question.stem || ''}
          </p>
        </div>

        <div className="ml-6 space-y-2">
          {question.options.map((option) => (
            <OptionItem
              key={option.id}
              optionId={option.id}
              optionText={option.text}
              isSelected={selectedOptionIds.includes(option.id)}
              onChange={() => onAnswerChange(option.id)}
              disabled={disabled}
              type={question.type}
            />
          ))}
        </div>
      </div>
    </Card>
  )
}

