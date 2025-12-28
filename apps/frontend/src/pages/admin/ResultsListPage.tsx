import { useState } from 'react'
import { useResults } from '@/hooks/queries/useAdmin'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { LoadingState } from '@/components/shared/LoadingState'
import { ErrorState } from '@/components/shared/ErrorState'
import { EmptyState } from '@/components/shared/EmptyState'

export function ResultsListPage() {
  const [page, setPage] = useState(1)
  const [examIdFilter, setExamIdFilter] = useState('')
  const [selectedForNextRoundFilter, setSelectedForNextRoundFilter] = useState<
    boolean | undefined
  >(undefined)

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useResults({
    page,
    limit: 10,
    examId: examIdFilter || undefined,
    selectedForNextRound:
      selectedForNextRoundFilter !== undefined
        ? selectedForNextRoundFilter
        : undefined,
  })

  if (isLoading) {
    return <LoadingState message="Loading results..." />
  }

  if (isError) {
    return (
      <ErrorState
        message={error instanceof Error ? error.message : 'Failed to load results'}
        onRetry={() => refetch()}
      />
    )
  }

  if (!data || data.data.length === 0) {
    return (
      <EmptyState
        title="No results found"
        description="There are no results matching your criteria."
      />
    )
  }

  const totalPages = Math.ceil(data.total / data.limit)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Exam Results</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          View and filter exam results
        </p>
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          <Input
            placeholder="Filter by Exam ID"
            value={examIdFilter}
            onChange={(e) => {
              setExamIdFilter(e.target.value)
              setPage(1)
            }}
            className="flex-1"
          />
          <div className="flex gap-2">
            <Button
              variant={selectedForNextRoundFilter === undefined ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setSelectedForNextRoundFilter(undefined)
                setPage(1)
              }}
            >
              All
            </Button>
            <Button
              variant={selectedForNextRoundFilter === true ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setSelectedForNextRoundFilter(true)
                setPage(1)
              }}
            >
              Selected
            </Button>
            <Button
              variant={selectedForNextRoundFilter === false ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setSelectedForNextRoundFilter(false)
                setPage(1)
              }}
            >
              Not Selected
            </Button>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        {data.data.map((result) => (
          <Card key={result.id} className="p-4">
            <div className="space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">
                      {result.candidateName || result.candidateEmail}
                    </span>
                    {result.rank !== null && (
                      <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                        Rank: {result.rank}
                      </span>
                    )}
                    <span
                      className={`rounded-md px-2 py-1 text-xs font-medium ${
                        result.selectedForNextRound
                          ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {result.selectedForNextRound ? 'Selected' : 'Not Selected'}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {result.examTitle} • {result.candidateEmail}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs text-muted-foreground">Total Marks</p>
                  <p className="text-lg font-semibold text-foreground">
                    {result.totalMarks}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Aptitude</p>
                  <p className="text-lg font-semibold text-foreground">
                    {result.aptitudeMarks}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Technical</p>
                  <p className="text-lg font-semibold text-foreground">
                    {result.technicalMarks}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
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
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}

