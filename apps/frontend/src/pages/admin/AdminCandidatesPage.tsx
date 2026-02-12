import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  useAdminCandidates,
  useToggleCandidateActive,
  useExportCandidates,
  useAssignCandidateSession,
  useBulkAssignCandidates,
} from '@/queries/candidates.queries'
import { useAdminExams } from '@/queries/exams.queries'
import { useSessions } from '@/queries/sessions.queries'
import { useBulkAssignCandidatesToSession } from '@/queries/sessionCandidates.queries'
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
import { Label } from '@/components/ui/label'
import { LoadingState } from '@/components/shared/LoadingState'
import { ErrorState } from '@/components/shared/ErrorState'
import { EmptyState } from '@/components/shared/EmptyState'
import { SubmitDialog } from '@/pages/exam/components/SubmitDialog'
import { ROUTES } from '@/constants'

/**
 * AdminCandidatesPage - Admin candidates management page
 * Route: /admin/candidates
 */
export function AdminCandidatesPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [examIdFilter, setExamIdFilter] = useState<string>('')
  const [collegeSessionIdFilter, setCollegeSessionIdFilter] = useState<string>('')
  const [selectedForNextRoundFilter, setSelectedForNextRoundFilter] = useState<
    boolean | undefined
  >(undefined)
  const [showActivateDialog, setShowActivateDialog] = useState(false)
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false)
  const [showBulkAssignDialog, setShowBulkAssignDialog] = useState(false)
  const [actionCandidateId, setActionCandidateId] = useState<string | null>(null)
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<Set<string>>(new Set())
  const [bulkAssignSessionId, setBulkAssignSessionId] = useState<string>('')
  const [showBulkCsvDialog, setShowBulkCsvDialog] = useState(false)
  const [csvSessionId, setCsvSessionId] = useState<string>('')
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data, isLoading, isError, error, refetch } = useAdminCandidates({
    page,
    limit: 10,
    examId: examIdFilter || undefined,
    collegeSessionId: collegeSessionIdFilter || undefined,
    selectedForNextRound: selectedForNextRoundFilter,
  })

  // Fetch exams and sessions for dropdowns
  const { data: examsData } = useAdminExams({ page: 1, limit: 100 })
  const { data: sessionsData } = useSessions({ page: 1, limit: 100 })

  const toggleCandidateActiveMutation = useToggleCandidateActive()
  const exportCandidatesMutation = useExportCandidates()
  const assignSessionMutation = useAssignCandidateSession()
  const bulkAssignMutation = useBulkAssignCandidates()
  const bulkCsvMutation = useBulkAssignCandidatesToSession()

  const handleViewResult = (submissionId: string) => {
    navigate(ROUTES.ADMIN_SUBMISSION_RESULT.replace(':submissionId', submissionId))
  }

  const handleActivateClick = (candidateId: string) => {
    setActionCandidateId(candidateId)
    setShowActivateDialog(true)
  }

  const handleDeactivateClick = (candidateId: string) => {
    setActionCandidateId(candidateId)
    setShowDeactivateDialog(true)
  }

  const handleConfirmActivate = async () => {
    if (!actionCandidateId) return

    try {
      await toggleCandidateActiveMutation.mutateAsync({
        candidateId: actionCandidateId,
        isActive: true,
      })
      setShowActivateDialog(false)
      setActionCandidateId(null)
    } catch (error) {
      console.error(error)
      // Error handled by mutation
    }
  }

  const handleConfirmDeactivate = async () => {
    if (!actionCandidateId) return

    try {
      await toggleCandidateActiveMutation.mutateAsync({
        candidateId: actionCandidateId,
        isActive: false,
      })
      setShowDeactivateDialog(false)
      setActionCandidateId(null)
    } catch (error) {
      console.error(error)
      // Error handled by mutation
    }
  }

  const handleExport = async () => {
    try {
      const blob = await exportCandidatesMutation.mutateAsync({
        examId: examIdFilter || undefined,
        collegeSessionId: collegeSessionIdFilter || undefined,
        selectedForNextRound: selectedForNextRoundFilter,
      })

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `candidates-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error(error)
      // Error handled by mutation
    }
  }

  const handleSessionChange = async (
    candidateId: string,
    sessionId: string,
  ) => {
    try {
      await assignSessionMutation.mutateAsync({
        candidateId,
        data: {
          collegeSessionId: sessionId || null,
        },
      })
    } catch (error) {
      console.error(error)
      // Error handled by mutation
    }
  }

  const handleSelectCandidate = (candidateId: string, checked: boolean) => {
    setSelectedCandidateIds((prev) => {
      const next = new Set(prev)
      if (checked) {
        next.add(candidateId)
      } else {
        next.delete(candidateId)
      }
      return next
    })
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCandidateIds(new Set(items.map((c) => c.id)))
    } else {
      setSelectedCandidateIds(new Set())
    }
  }

  const handleBulkAssign = async () => {
    if (selectedCandidateIds.size === 0) return

    try {
      await bulkAssignMutation.mutateAsync({
        userIds: Array.from(selectedCandidateIds),
        collegeSessionId: bulkAssignSessionId || null,
      })
      setSelectedCandidateIds(new Set())
      setBulkAssignSessionId('')
      setShowBulkAssignDialog(false)
    } catch (error) {
      console.error(error)
      // Error handled by mutation
    }
  }


  if (isLoading) {
    return <LoadingState message="Loading candidates..." />
  }

  if (isError) {
    return (
      <ErrorState
        message={error instanceof Error ? error.message : 'Failed to load candidates'}
        onRetry={() => refetch()}
      />
    )
  }

  const { items, meta } = data || {
    items: [],
    meta: { page: 1, limit: 10, total: 0, totalPages: 1 },
  }
  const hasData = items && items.length > 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            Candidate Management
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage candidates and their exam registrations. Candidates will receive exams via their assigned recruitment session.
          </p>
        </div>
        <div className="flex gap-2">
          {selectedCandidateIds.size > 0 && (
            <Button
              variant="default"
              onClick={() => setShowBulkAssignDialog(true)}
            >
              Assign to Session ({selectedCandidateIds.size})
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => setShowBulkCsvDialog(true)}
          >
            Bulk Assign from CSV
          </Button>
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={exportCandidatesMutation.isPending || !hasData}
          >
            {exportCandidatesMutation.isPending ? 'Exporting...' : 'Export Candidates'}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="exam-filter">Exam</Label>
              <select
                id="exam-filter"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={examIdFilter}
                onChange={(e) => {
                  setExamIdFilter(e.target.value)
                  setPage(1)
                }}
              >
                <option value="">All Exams</option>
                {examsData?.data?.map((exam) => (
                  <option key={exam.id} value={exam.id}>
                    {exam.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="session-filter">Session</Label>
              <select
                id="session-filter"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={collegeSessionIdFilter}
                onChange={(e) => {
                  setCollegeSessionIdFilter(e.target.value)
                  setPage(1)
                }}
              >
                <option value="">All Sessions</option>
                {sessionsData?.data?.map((session) => (
                  <option key={session.id} value={session.id}>
                    {session.name} ({session.year})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="selection-status">Selected for Next Round</Label>
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
                  Yes
                </Button>
                <Button
                  variant={selectedForNextRoundFilter === false ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setSelectedForNextRoundFilter(false)
                    setPage(1)
                  }}
                >
                  No
                </Button>
              </div>
            </div>
            <div className="flex items-end">
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
          </div>
        </CardContent>
      </Card>

      {hasData ? (
        <>
          {/* Candidates Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <input
                          type="checkbox"
                          checked={
                            items.length > 0 &&
                            selectedCandidateIds.size === items.length
                          }
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300"
                          aria-label="Select all candidates"
                        />
                      </TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Recruitment Session</TableHead>
                      <TableHead>Exam</TableHead>
                      <TableHead>Submission Status</TableHead>
                      <TableHead>Marks</TableHead>
                      <TableHead>Rank</TableHead>
                      <TableHead>Selected</TableHead>
                      <TableHead>Active</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((candidate) => (
                      <TableRow key={candidate.id}>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedCandidateIds.has(candidate.id)}
                            onChange={(e) =>
                              handleSelectCandidate(candidate.id, e.target.checked)
                            }
                            className="h-4 w-4 rounded border-gray-300"
                            aria-label={`Select ${candidate.email}`}
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {candidate.firstName || candidate.lastName
                            ? `${candidate.firstName || ''} ${candidate.lastName || ''}`.trim()
                            : 'N/A'}
                        </TableCell>
                        <TableCell>{candidate.email}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <select
                              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              value={candidate.collegeSessionId || ''}
                              onChange={(e) =>
                                handleSessionChange(candidate.id, e.target.value)
                              }
                              disabled={assignSessionMutation.isPending}
                              aria-label={`Assign session for ${candidate.email}`}
                            >
                              <option value="">Unassigned</option>
                              {sessionsData?.data?.map((session) => (
                                <option key={session.id} value={session.id}>
                                  {session.name} ({session.year})
                                </option>
                              ))}
                            </select>
                            {candidate.collegeSessionId && (
                              <p className="text-xs text-muted-foreground">
                                Will receive exams via this session
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {candidate.submission?.exam.title || 'Not submitted'}
                        </TableCell>
                        <TableCell>
                          {candidate.submission?.submittedAt ? (
                            <span className="inline-flex items-center rounded-md bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-600 dark:text-green-400">
                              Submitted
                            </span>
                          ) : candidate.submission ? (
                            <span className="inline-flex items-center rounded-md bg-yellow-500/10 px-2.5 py-0.5 text-xs font-medium text-yellow-600 dark:text-yellow-400">
                              In Progress
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-md bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                              Not Started
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {candidate.finalResult?.totalMarks?.toFixed(2) || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {candidate.finalResult?.rank?.toString() || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {candidate.finalResult?.selectedForNextRound ? (
                            <span className="inline-flex items-center rounded-md bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-600 dark:text-green-400">
                              Yes
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-md bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                              No
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {candidate.isActive ? (
                            <span className="inline-flex items-center rounded-md bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-600 dark:text-green-400">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-md bg-red-500/10 px-2.5 py-0.5 text-xs font-medium text-red-600 dark:text-red-400">
                              Inactive
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {candidate.submission && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewResult(candidate.submission!.id)}
                              >
                                View Result
                              </Button>
                            )}
                            {candidate.isActive ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeactivateClick(candidate.id)}
                                disabled={
                                  toggleCandidateActiveMutation.isPending &&
                                  actionCandidateId === candidate.id
                                }
                              >
                                {toggleCandidateActiveMutation.isPending &&
                                actionCandidateId === candidate.id
                                  ? 'Deactivating...'
                                  : 'Deactivate'}
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleActivateClick(candidate.id)}
                                disabled={
                                  toggleCandidateActiveMutation.isPending &&
                                  actionCandidateId === candidate.id
                                }
                              >
                                {toggleCandidateActiveMutation.isPending &&
                                actionCandidateId === candidate.id
                                  ? 'Activating...'
                                  : 'Activate'}
                              </Button>
                            )}
                          </div>
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
                  Page {meta.page} of {meta.totalPages}
                  {'total' in meta ? ` (${meta.total} total)` : ''}
                </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={page >= meta.totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      ) : (
        <EmptyState
          title="No candidates found"
          description="There are no candidates matching your criteria."
        />
      )}

      {/* Activate Dialog */}
      {showActivateDialog && (
        <SubmitDialog
          open={showActivateDialog}
          onOpenChange={setShowActivateDialog}
          onConfirm={handleConfirmActivate}
          isSubmitting={toggleCandidateActiveMutation.isPending}
          title="Activate Candidate"
          description="Are you sure you want to activate this candidate? They will be able to access the system."
          confirmText="Activate"
        />
      )}

      {/* Deactivate Dialog */}
      {showDeactivateDialog && (
        <SubmitDialog
          open={showDeactivateDialog}
          onOpenChange={setShowDeactivateDialog}
          onConfirm={handleConfirmDeactivate}
          isSubmitting={toggleCandidateActiveMutation.isPending}
          title="Deactivate Candidate"
          description="Are you sure you want to deactivate this candidate? They will no longer be able to access the system."
          confirmText="Deactivate"
          variant="destructive"
        />
      )}

      {/* Bulk CSV Upload Dialog */}
      {showBulkCsvDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => !bulkCsvMutation.isPending && setShowBulkCsvDialog(false)}
        >
          <Card className="w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">
                Bulk Assign Candidates from CSV
              </h2>
              <p className="text-sm text-muted-foreground">
                Upload a CSV file with columns: email, firstName, lastName. Existing candidates will be assigned, new ones will be created.
              </p>
              <div className="space-y-2">
                <Label htmlFor="csv-session-select">Recruitment Session</Label>
                <select
                  id="csv-session-select"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={csvSessionId}
                  onChange={(e) => setCsvSessionId(e.target.value)}
                  disabled={bulkCsvMutation.isPending}
                >
                  <option value="">Select a session</option>
                  {sessionsData?.data?.filter((s) => s.status !== 'completed').map((session) => (
                    <option key={session.id} value={session.id}>
                      {session.name} ({session.year}) - {session.status}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="csv-file-input">CSV File</Label>
                <input
                  ref={fileInputRef}
                  id="csv-file-input"
                  type="file"
                  accept=".csv"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setCsvFile(file)
                    }
                  }}
                  disabled={bulkCsvMutation.isPending}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
                {csvFile && (
                  <p className="text-xs text-muted-foreground">Selected: {csvFile.name}</p>
                )}
              </div>
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowBulkCsvDialog(false)
                    setCsvSessionId('')
                    setCsvFile(null)
                    if (fileInputRef.current) {
                      fileInputRef.current.value = ''
                    }
                  }}
                  disabled={bulkCsvMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  onClick={async () => {
                    if (!csvSessionId || !csvFile) {
                      return
                    }
                    try {
                      await bulkCsvMutation.mutateAsync({
                        sessionId: csvSessionId,
                        file: csvFile,
                      })
                      setShowBulkCsvDialog(false)
                      setCsvSessionId('')
                      setCsvFile(null)
                      if (fileInputRef.current) {
                        fileInputRef.current.value = ''
                      }
                      // Auto-filter list to the session you just uploaded to, so you see the new candidates
                      setCollegeSessionIdFilter(csvSessionId)
                      setPage(1)
                    } catch (error) {
                      console.error(error)
                      // Error handled by mutation
                    }
                  }}
                  disabled={bulkCsvMutation.isPending || !csvSessionId || !csvFile}
                >
                  {bulkCsvMutation.isPending ? 'Uploading...' : 'Upload CSV'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Bulk Assign Dialog */}
      {showBulkAssignDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => !bulkAssignMutation.isPending && setShowBulkAssignDialog(false)}
        >
          <Card className="w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">
                Assign {selectedCandidateIds.size} Candidate
                {selectedCandidateIds.size !== 1 ? 's' : ''} to Session
              </h2>
              <div className="space-y-2">
                <Label htmlFor="bulk-session-select">Recruitment Session</Label>
                <select
                  id="bulk-session-select"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={bulkAssignSessionId}
                  onChange={(e) => setBulkAssignSessionId(e.target.value)}
                  disabled={bulkAssignMutation.isPending}
                >
                  <option value="">Unassigned</option>
                  {sessionsData?.data?.map((session) => (
                    <option key={session.id} value={session.id}>
                      {session.name} ({session.year})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowBulkAssignDialog(false)
                    setBulkAssignSessionId('')
                  }}
                  disabled={bulkAssignMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleBulkAssign}
                  disabled={bulkAssignMutation.isPending}
                >
                  {bulkAssignMutation.isPending
                    ? 'Assigning...'
                    : 'Assign Candidates'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
