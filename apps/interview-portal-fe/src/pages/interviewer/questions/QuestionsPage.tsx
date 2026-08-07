import { useState } from 'react'

import { ClipboardListIcon, PencilIcon, TrashIcon, XIcon } from '@/components/icons'
import { EmptyState, LoadingSpinner, PageHeader } from '@/components/ui'
import { QUESTION_TYPE_LABEL, QUESTION_TYPE_SHORT_LABEL } from '@/constants/questions'
import {
  authorName,
  useQuestionBank,
  type QuestionBankListItem,
  type QuestionDifficulty,
  type QuestionType,
} from '@/hooks/useQuestionBank'
import { useQuestionBankTags } from '@/hooks/useQuestionBankTags'
import { QuestionForm } from '../components/QuestionForm'
import { DeleteQuestionDialog } from './DeleteQuestionDialog'
import { EditQuestionDialog } from './EditQuestionDialog'

const formatDate = (value: string) => new Date(value).toLocaleDateString()

export const QuestionsPage = () => {
  const [search, setSearch] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [type, setType] = useState<QuestionType | ''>('')
  const [difficulty, setDifficulty] = useState<QuestionDifficulty | ''>('')
  const [page, setPage] = useState(1)
  const [showAddModal, setShowAddModal] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<QuestionBankListItem | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

  const { data: allTags } = useQuestionBankTags()
  const { data, isLoading } = useQuestionBank({
    page,
    search: search || undefined,
    tags: selectedTags.length ? selectedTags : undefined,
    type: type || undefined,
    difficulty: difficulty || undefined,
  })

  const questions = data?.items ?? []
  const meta = data?.meta

  const toggleTag = (tag: string) => {
    setPage(1)
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    )
  }

  return (
    <>
      <PageHeader
        title="Questions"
        description="Shared question bank — tag questions so they are easy to find later"
        action={
          <button
            onClick={() => setShowAddModal(true)}
            className="h-9 rounded-md bg-brand px-4 text-sm font-medium text-white hover:bg-brand-hover"
          >
            Add Question
          </button>
        }
      />

      <div className="mb-3 flex gap-3">
        <input
          placeholder="Search questions"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="h-9 flex-1 rounded-md border border-border px-3 text-sm text-content-primary focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-border"
        />
        <select
          value={type}
          onChange={(e) => { setType(e.target.value as QuestionType | ''); setPage(1) }}
          className="h-9 rounded-md border border-border px-3 text-sm text-content-primary"
        >
          <option value="">All types</option>
          {Object.entries(QUESTION_TYPE_LABEL).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <select
          value={difficulty}
          onChange={(e) => { setDifficulty(e.target.value as QuestionDifficulty | ''); setPage(1) }}
          className="h-9 rounded-md border border-border px-3 text-sm text-content-primary"
        >
          <option value="">All difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>

      {allTags && allTags.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-1.5">
          {allTags.map((tag) => {
            const active = selectedTags.includes(tag)
            return (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={
                  active
                    ? 'rounded-full bg-brand px-2.5 py-0.5 text-xs font-medium text-white'
                    : 'rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-content-secondary hover:bg-surface-subtle'
                }
              >
                {tag}
              </button>
            )
          })}
          {selectedTags.length > 0 && (
            <button
              onClick={() => { setSelectedTags([]); setPage(1) }}
              className="ml-1 inline-flex items-center gap-1 text-xs font-medium text-content-muted hover:text-content-secondary"
            >
              <XIcon size={12} /> Clear tags
            </button>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : questions.length === 0 ? (
        <EmptyState
          icon={<ClipboardListIcon size={24} />}
          title={selectedTags.length || search ? 'No matching questions' : 'No questions yet'}
          description={
            selectedTags.length || search
              ? 'Try clearing the filters or search term.'
              : 'Add your first question to start building the bank.'
          }
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <div className="grid grid-cols-[1fr_130px_100px_70px_150px_80px] border-b border-border bg-surface-subtle px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-content-muted">
            <div>Question</div>
            <div>Type</div>
            <div>Difficulty</div>
            <div>Points</div>
            <div>Added by</div>
            <div className="text-right">Actions</div>
          </div>
          {questions.map((question) => (
            <div
              key={question.id}
              className="grid grid-cols-[1fr_130px_100px_70px_150px_80px] items-center border-b border-surface-subtle px-4 py-3 text-sm last:border-b-0"
            >
              <div className="pr-4">
                <div className="text-content-primary">{question.prompt}</div>
                {question.tags.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {question.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-surface-subtle px-2 py-0.5 text-xs text-content-secondary"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="text-content-secondary">{QUESTION_TYPE_SHORT_LABEL[question.type]}</div>
              <div className="capitalize text-content-secondary">{question.difficulty}</div>
              <div className="text-content-secondary">{question.points}</div>
              <div className="pr-2 text-content-secondary">
                <div className="truncate">{authorName(question.creator)}</div>
                <div className="text-xs text-content-muted">{formatDate(question.createdAt)}</div>
              </div>
              <div className="flex justify-end gap-1">
                <button
                  onClick={() => setEditingId(question.id)}
                  aria-label="Edit question"
                  title="Edit"
                  className="rounded-md p-1.5 text-content-muted hover:bg-surface-subtle hover:text-brand"
                >
                  <PencilIcon size={16} />
                </button>
                <button
                  onClick={() => setPendingDelete(question)}
                  aria-label="Delete question"
                  title="Delete"
                  className="rounded-md p-1.5 text-content-muted hover:bg-status-error-bg hover:text-status-error-text"
                >
                  <TrashIcon size={16} />
                </button>
              </div>
            </div>
          ))}

          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm text-content-secondary">
              <span>Page {meta.page} of {meta.totalPages}</span>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-md border border-border px-3 py-1 disabled:opacity-40"
                >
                  Prev
                </button>
                <button
                  disabled={page >= meta.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-md border border-border px-3 py-1 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 py-10"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="w-full max-w-lg rounded-lg border border-border bg-surface p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-base font-semibold text-content-primary">Add Question</h2>
                <p className="text-sm text-content-secondary">
                  Tag it so it is easy to find later
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                aria-label="Close"
                className="text-content-muted hover:text-content-secondary"
              >
                <XIcon size={18} />
              </button>
            </div>

            <QuestionForm
              onSaved={() => setShowAddModal(false)}
              onCancel={() => setShowAddModal(false)}
              initialTags={selectedTags}
            />
          </div>
        </div>
      )}

      {editingId && (
        <EditQuestionDialog questionId={editingId} onClose={() => setEditingId(null)} />
      )}

      {pendingDelete && (
        <DeleteQuestionDialog
          question={pendingDelete}
          onClose={() => setPendingDelete(null)}
        />
      )}
    </>
  )
}
