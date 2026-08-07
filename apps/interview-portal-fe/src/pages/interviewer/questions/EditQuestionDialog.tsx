import { XIcon } from '@/components/icons'
import { LoadingSpinner } from '@/components/ui'
import { useQuestionBankItem } from '@/hooks/useQuestionBankItem'
import { QuestionForm } from '../components/QuestionForm'

type EditQuestionDialogProps = {
  questionId: string
  onClose:    () => void
}

export const EditQuestionDialog = ({ questionId, onClose }: EditQuestionDialogProps) => {
  // The list response omits options and test cases, so the full question is
  // fetched here before the form can be prefilled.
  const { data: question, isLoading, isError } = useQuestionBankItem(questionId)

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 py-10"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-lg border border-border bg-surface p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-base font-semibold text-content-primary">Edit question</h2>
            <p className="text-sm text-content-secondary">
              Changes apply everywhere this question is used
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-content-muted hover:text-content-secondary"
          >
            <XIcon size={18} />
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <LoadingSpinner size="md" />
          </div>
        ) : isError || !question ? (
          <p className="py-6 text-sm text-status-error-text">
            Could not load this question. Close and try again.
          </p>
        ) : (
          <QuestionForm question={question} onSaved={onClose} onCancel={onClose} />
        )}
      </div>
    </div>
  )
}
