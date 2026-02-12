import { useState } from 'react'
import { useQuestions, useCreateQuestion, useUpdateQuestion, useDeleteQuestion } from '@/queries/questions.queries'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { LoadingState } from '@/components/shared/LoadingState'
import { ErrorState } from '@/components/shared/ErrorState'
import { EmptyState } from '@/components/shared/EmptyState'
import { QuestionsTable } from './components/QuestionsTable'
import { QuestionFormDialog } from './components/QuestionFormDialog'
import { AiQuestionGenerator } from './components/AiQuestionGenerator'
import { SubmitDialog } from '@/pages/exam/components/SubmitDialog'
import type { Question, CreateQuestionRequest, UpdateQuestionRequest } from '@/types/question.types'

/**
 * AdminQuestionsPage - Question bank management page
 * Route: /admin/questions
 */
export function AdminQuestionsPage() {
  const [page, setPage] = useState(1)
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const [typeFilter, setTypeFilter] = useState<'single_select' | 'multi_select' | ''>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deletingQuestionId, setDeletingQuestionId] = useState<string | null>(null)
  const [showAiGenerator, setShowAiGenerator] = useState(false)

  const { data, isLoading, isError, error, refetch } = useQuestions({
    page,
    limit: 10,
    category: categoryFilter || undefined,
    type: typeFilter || undefined,
    search: searchQuery || undefined,
  })

  const createQuestionMutation = useCreateQuestion()
  const updateQuestionMutation = useUpdateQuestion()
  const deleteQuestionMutation = useDeleteQuestion()

  const handleCreate = (data: CreateQuestionRequest | UpdateQuestionRequest) => {
    const createData: CreateQuestionRequest = {
      stem: data.stem!,
      type: data.type!,
      category: data.category!,
      options: data.options!,
    }
    createQuestionMutation.mutate(createData, {
      onSuccess: () => {
        setShowCreateDialog(false)
      },
    })
  }

  const handleUpdate = (id: string, data: UpdateQuestionRequest) => {
    updateQuestionMutation.mutate(
      { id, data },
      {
        onSuccess: () => {
          setEditingQuestion(null)
        },
      },
    )
  }

  const handleDeleteClick = (questionId: string) => {
    setDeletingQuestionId(questionId)
    setShowDeleteDialog(true)
  }

  const handleConfirmDelete = () => {
    if (deletingQuestionId) {
      deleteQuestionMutation.mutate(deletingQuestionId, {
        onSuccess: () => {
          setShowDeleteDialog(false)
          setDeletingQuestionId(null)
        },
      })
    }
  }

  if (isError) {
    return (
      <ErrorState
        message={error instanceof Error ? error.message : 'Failed to load questions'}
        onRetry={() => refetch()}
      />
    )
  }

  const questions = data?.items || []
  const totalPages = data?.limit ? Math.ceil((data.total || 0) / data.limit) : 1

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Question Bank</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage questions for exams
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowAiGenerator(!showAiGenerator)}
          >
            {showAiGenerator ? 'Hide' : 'AI Generator'}
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            Create Question
          </Button>
        </div>
      </div>

      {showAiGenerator && (
        <div>
          <AiQuestionGenerator />
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <Input
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setPage(1)
                }}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value)
                  setPage(1)
                }}
              >
                <option value="">All Categories</option>
                <option value="aptitude">Aptitude</option>
                <option value="technical">Technical</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value as 'single_select' | 'multi_select' | '')
                  setPage(1)
                }}
              >
                <option value="">All Types</option>
                <option value="single_select">Single Select</option>
                <option value="multi_select">Multi Select</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <LoadingState message="Loading questions..." />
      ) : questions.length === 0 ? (
        <EmptyState
          title="No questions found"
          description={
            categoryFilter || typeFilter || searchQuery
              ? 'No questions match your filters. Try adjusting your search criteria.'
              : 'Create your first question to get started.'
          }
        />
      ) : (
        <>
          <Card>
            <CardContent className="p-0">
              <QuestionsTable
                questions={questions}
                onEdit={(question) => setEditingQuestion(question)}
                onDelete={handleDeleteClick}
                isDeleting={deleteQuestionMutation.isPending}
              />
            </CardContent>
          </Card>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {showCreateDialog && (
        <QuestionFormDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onSubmit={handleCreate}
          isLoading={createQuestionMutation.isPending}
        />
      )}

      {editingQuestion && (
        <QuestionFormDialog
          open={!!editingQuestion}
          onOpenChange={(open) => {
            if (!open) setEditingQuestion(null)
          }}
          onSubmit={(data) => handleUpdate(editingQuestion.id, data)}
          isLoading={updateQuestionMutation.isPending}
          question={editingQuestion}
          isEdit
        />
      )}

      {showDeleteDialog && (
        <SubmitDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onConfirm={handleConfirmDelete}
          isSubmitting={deleteQuestionMutation.isPending}
          title="Delete Question"
          description="Are you sure you want to delete this question? This action cannot be undone."
          confirmText="Delete"
          variant="destructive"
        />
      )}
    </div>
  )
}
