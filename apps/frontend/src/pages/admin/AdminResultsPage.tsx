import { useState } from 'react'
import { useAdminResults, useToggleNextRound, useRecalculateRanks } from '@/queries/results.queries'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { LoadingState } from '@/components/shared/LoadingState'
import { ErrorState } from '@/components/shared/ErrorState'
import { EmptyState } from '@/components/shared/EmptyState'
import { RankBadge } from '@/pages/results/components/RankBadge'
import { StatusBadge } from '@/pages/results/components/StatusBadge'
import { SubmitDialog } from '@/pages/exam/components/SubmitDialog'
import { Label } from '@/components/ui/label'

/**
 * AdminResultsPage - Admin results management page
 * Features:
 * - Paginated results table
 * - Filters (exam, college session, selection status)
 * - Sorting by rank/total marks
 * - Toggle next round selection
 * - Recalculate ranks
 */
export function AdminResultsPage() {
  const [page, setPage] = useState(1)
  const [examIdFilter, setExamIdFilter] = useState<string>('')
  const [collegeSessionIdFilter, setCollegeSessionIdFilter] = useState<string>('')
  const [selectedForNextRoundFilter, setSelectedForNextRoundFilter] = useState<
    boolean | undefined
  >(undefined)
  const [sortBy, setSortBy] = useState<'rank' | 'totalMarks' | 'submittedAt'>('rank')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [showRecalculateDialog, setShowRecalculateDialog] = useState(false)
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null)

  const { data, isLoading, isError, error } = useAdminResults({
    page,
    limit: 10,
    examId: examIdFilter || undefined,
    collegeSessionId: collegeSessionIdFilter || undefined,
    selectedForNextRound: selectedForNextRoundFilter,
    sortBy,
    sortOrder,
  })

  const toggleNextRoundMutation = useToggleNextRound()
  const recalculateRanksMutation = useRecalculateRanks()

  const handleToggleSelection = async (
    submissionId: string,
    currentValue: boolean,
  ) => {
    try {
      await toggleNextRoundMutation.mutateAsync({
        submissionId,
        selected: !currentValue,
      })
      // Success - mutation will refetch data automatically
    } catch (error) {
      // Error - mutation will handle rollback
      console.error('Failed to toggle selection:', error)
    }
  }

  const handleRecalculateRanks = async () => {
    if (!selectedExamId) return

    try {
      await recalculateRanksMutation.mutateAsync(selectedExamId)
      setShowRecalculateDialog(false)
      setSelectedExamId(null)
      // Success - mutation will refetch data automatically
    } catch (error) {
      // Error handled by mutation
      console.error('Failed to recalculate ranks:', error)
    }
  }

  if (isLoading) {
    return <LoadingState message="Loading results..." />
  }

  if (isError) {
    return (
      <ErrorState
        message={error instanceof Error ? error.message : 'Failed to load results'}
        onRetry={() => window.location.reload()}
      />
    )
  }

  const { items, meta } = data || { items: [], meta: { page: 1, limit: 10, total: 0, totalPages: 1 } }
  const hasData = items && items.length > 0
  const hasFilters = examIdFilter || collegeSessionIdFilter || selectedForNextRoundFilter !== undefined

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Results</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage exam results and rankings
          </p>
        </div>
        {hasData && (
          <Button
            variant="outline"
            onClick={() => {
              // Get unique exam IDs from results
              const examIds = [...new Set(items?.map((r) => r.examId) || [])]
              if (examIds.length > 0) {
                setSelectedExamId(examIds[0])
                setShowRecalculateDialog(true)
              } else {
                // No exams available
                console.warn('No exams available to recalculate ranks')
              }
            }}
            disabled={recalculateRanksMutation.isPending || items.length === 0}
          >
            {recalculateRanksMutation.isPending ? 'Recalculating...' : 'Recalculate Rankings'}
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="exam-id">Exam ID</Label>
              <Input
                id="exam-id"
                placeholder="Filter by Exam ID"
                value={examIdFilter}
                onChange={(e) => {
                  setExamIdFilter(e.target.value)
                  setPage(1)
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="session-id">College Session ID</Label>
              <Input
                id="session-id"
                placeholder="Filter by Session ID"
                value={collegeSessionIdFilter}
                onChange={(e) => {
                  setCollegeSessionIdFilter(e.target.value)
                  setPage(1)
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="selection-status">Selection Status</Label>
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
            <div className="space-y-2">
              <Label htmlFor="sort-by">Sort By</Label>
              <div className="flex gap-2">
                <Button
                  variant={sortBy === 'rank' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy('rank')}
                >
                  Rank
                </Button>
                <Button
                  variant={sortBy === 'totalMarks' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy('totalMarks')}
                >
                  Marks
                </Button>
                <Button
                  variant={sortBy === 'submittedAt' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy('submittedAt')}
                >
                  Date
                </Button>
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setExamIdFilter('')
                setCollegeSessionIdFilter('')
                setSelectedForNextRoundFilter(undefined)
                setPage(1)
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {hasData ? (
        <>
          {/* Results Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Candidate</TableHead>
                      <TableHead>Exam</TableHead>
                      <TableHead>Total Marks</TableHead>
                      <TableHead>Aptitude</TableHead>
                      <TableHead>Technical</TableHead>
                      <TableHead>Rank</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((result) => (
                      <TableRow key={result.submissionId}>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium">
                              {result.candidate?.firstName && result.candidate?.lastName
                                ? `${result.candidate.firstName} ${result.candidate.lastName}`
                                : result.candidate?.email || 'N/A'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {result.candidate?.email || 'N/A'}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{result.examTitle || 'N/A'}</TableCell>
                        <TableCell>{result.totalMarks ?? 'N/A'}</TableCell>
                        <TableCell>{result.aptitudeMarks ?? 'N/A'}</TableCell>
                        <TableCell>{result.technicalMarks ?? 'N/A'}</TableCell>
                        <TableCell>
                          <RankBadge rank={result.rank} />
                        </TableCell>
                        <TableCell>
                          <StatusBadge selected={result.selectedForNextRound} />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleToggleSelection(
                                result.submissionId,
                                result.selectedForNextRound,
                              )
                            }
                            disabled={toggleNextRoundMutation.isPending}
                          >
                            {result.selectedForNextRound ? 'Deselect' : 'Select'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Pagination */}
          {meta.totalPages > 1 && (
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
                Page {meta.page} of {meta.totalPages} ({meta.total} total)
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={page === meta.totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      ) : (
        <EmptyState
          description={
            hasFilters
              ? 'No results found matching your filters. Try adjusting your search criteria.'
              : 'No results found.'
          }
        />
      )}

      {/* Recalculate Ranks Dialog */}
      <SubmitDialog
        open={showRecalculateDialog}
        onOpenChange={setShowRecalculateDialog}
        onConfirm={handleRecalculateRanks}
        isSubmitting={recalculateRanksMutation.isPending}
        title="Recalculate Rankings"
        description="This will recalculate ranks for all candidates in the selected exam. This may take a few moments."
        confirmText="Recalculate"
        variant="default"
      />
    </div>
  )
}

