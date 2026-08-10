import { useState } from 'react'
import axios from 'axios'

import { XIcon } from '@/components/icons'
import { useDeleteQuestionBankItem } from '@/hooks/useDeleteQuestionBankItem'
import type { QuestionBankListItem } from '@/hooks/useQuestionBank'

type DeleteQuestionDialogProps = {
  question: QuestionBankListItem
  onClose:  () => void
}

export const DeleteQuestionDialog = ({ question, onClose }: DeleteQuestionDialogProps) => {
  const [error, setError] = useState<string | null>(null)
  const deleteQuestion = useDeleteQuestionBankItem()

  const handleDelete = () => {
    setError(null)
    deleteQuestion.mutate(question.id, {
      onSuccess: onClose,
      onError: (err) => {
        const message =
          axios.isAxiosError(err) && typeof err.response?.data?.message === 'string'
            ? err.response.data.message
            : 'Could not delete the question. Please try again.'
        setError(message)
      },
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 py-10"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg border border-border bg-surface p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between">
          <h2 className="text-base font-semibold text-content-primary">Delete question</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-content-muted hover:text-content-secondary"
          >
            <XIcon size={18} />
          </button>
        </div>

        <p className="mb-3 rounded-md bg-surface-subtle px-3 py-2 text-sm text-content-secondary">
          {question.prompt}
        </p>

        <p className="mb-4 text-sm text-content-secondary">
          This removes the question from the bank. This cannot be undone.
        </p>

        {error && <p className="mb-3 text-sm text-status-error-text">{error}</p>}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={deleteQuestion.isPending}
            className="h-9 rounded-md border border-border px-4 text-sm font-medium text-content-primary disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleteQuestion.isPending}
            className="h-9 rounded-md bg-status-error-text px-4 text-sm font-medium text-white disabled:opacity-50"
          >
            {deleteQuestion.isPending ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}
