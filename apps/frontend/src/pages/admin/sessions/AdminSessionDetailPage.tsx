import { useParams, useNavigate } from 'react-router-dom'
import { useSession } from '@/queries/sessions.queries'
import { useAdminExams } from '@/queries/exams.queries'
import { useSessionCandidates, useBulkAssignCandidatesToSession, useAssignCandidateToSession } from '@/queries/sessionCandidates.queries'
import { useUnassignedCandidates } from '@/queries/sessionCandidates.queries'
import { usePublishExam, useUnpublishExam } from '@/queries/exams.queries'
import type { Exam } from '@/types/exam.types'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { LoadingState } from '@/components/shared/LoadingState'
import { ErrorState } from '@/components/shared/ErrorState'
import { EmptyState } from '@/components/shared/EmptyState'
import { SessionStatusBadge } from './components/SessionStatusBadge'
import { ExamStatusBadge } from '@/pages/admin/exams/components/ExamStatusBadge'
import { ROUTES } from '@/constants'
import { useState, useRef } from 'react'

/**
 * AdminSessionDetailPage - Admin session detail page
 * Route: /admin/sessions/:sessionId
 * Shows session overview, exams, and candidates
 */
export function AdminSessionDetailPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const [publishingExamId, setPublishingExamId] = useState<string | null>(null)
  const [unpublishingExamId, setUnpublishingExamId] = useState<string | null>(null)

  const { data: session, isLoading: sessionLoading, isError: sessionError, error: sessionErr } = useSession(sessionId)

  const { data: examsData, isLoading: examsLoading } = useAdminExams({
    page: 1,
    limit: 100,
    collegeSessionId: sessionId || undefined,
  })

  const { data: candidatesData, isLoading: candidatesLoading } = useSessionCandidates(
    sessionId,
    { page: 1, limit: 100 },
  )

  const { data: unassignedCandidatesData } = useUnassignedCandidates({ page: 1, limit: 100 })
  
  const [showBulkCsvDialog, setShowBulkCsvDialog] = useState(false)
  const [showAddExistingDialog, setShowAddExistingDialog] = useState(false)
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const publishExamMutation = usePublishExam()
  const unpublishExamMutation = useUnpublishExam()
  const bulkCsvMutation = useBulkAssignCandidatesToSession()
  const assignCandidateMutation = useAssignCandidateToSession()

  const handlePublishExam = async (examId: string) => {
    setPublishingExamId(examId)
    try {
      await publishExamMutation.mutateAsync(examId)
      // Query will be invalidated by mutation's onSettled
    } catch (error) {
      // Error handled by mutation
    } finally {
      setPublishingExamId(null)
    }
  }

  const handleUnpublishExam = async (examId: string) => {
    setUnpublishingExamId(examId)
    try {
      await unpublishExamMutation.mutateAsync(examId)
      // Query will be invalidated by mutation's onSettled
    } catch (error) {
      // Error handled by mutation
    } finally {
      setUnpublishingExamId(null)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  if (sessionLoading) {
    return <LoadingState message="Loading session..." />
  }

  if (sessionError || !session) {
    return (
      <ErrorState
        message={sessionErr instanceof Error ? sessionErr.message : 'Failed to load session'}
        onRetry={() => navigate(ROUTES.ADMIN_SESSIONS)}
      />
    )
  }

  const exams = examsData?.data || []
  const candidates = candidatesData?.items || []

  // Count exam attempts per candidate (placeholder - would need submission data)
  const candidateAttemptCounts = new Map<string, number>()
  candidates.forEach((candidate) => {
    candidateAttemptCounts.set(candidate.id, 0)
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(ROUTES.ADMIN_SESSIONS)}
            className="mb-4"
          >
            ← Back to Sessions
          </Button>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            {session.name}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Recruitment Session Details
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate(ROUTES.ADMIN_SESSIONS_EDIT.replace(':id', session.id))}
        >
          Edit Session
        </Button>
      </div>

      {/* A. SESSION OVERVIEW */}
      <Card>
        <CardHeader>
          <CardTitle>Session Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="text-sm text-muted-foreground">Name</div>
              <div className="text-lg font-semibold">{session.name}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Year</div>
              <div className="text-lg font-semibold">{session.year}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Status</div>
              <div className="mt-1">
                <SessionStatusBadge status={session.status} />
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Start Date</div>
              <div className="text-lg font-semibold">{formatDate(session.startDate)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">End Date</div>
              <div className="text-lg font-semibold">{formatDate(session.endDate)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* B. EXAMS IN THIS SESSION */}
      <Card>
        <CardHeader>
          <CardTitle>Exams in This Session</CardTitle>
          <CardDescription>
            {exams.length === 0
              ? 'No exams assigned to this session yet'
              : `${exams.length} exam${exams.length !== 1 ? 's' : ''} found`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {examsLoading ? (
            <LoadingState message="Loading exams..." />
          ) : exams.length === 0 ? (
            <EmptyState
              title="No exams in this session"
              description="Create an exam and assign it to this session to get started."
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Window Start</TableHead>
                    <TableHead>Window End</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exams.map((exam: Exam) => (
                    <TableRow key={exam.id}>
                      <TableCell className="font-medium">{exam.title}</TableCell>
                      <TableCell>{formatDuration(exam.durationSeconds)}</TableCell>
                      <TableCell>{formatDate(exam.windowStartsAt)}</TableCell>
                      <TableCell>{formatDate(exam.windowEndsAt)}</TableCell>
                      <TableCell>
                        <ExamStatusBadge isPublished={exam.isPublished} />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              navigate(ROUTES.ADMIN_EXAMS_EDIT.replace(':id', exam.id))
                            }
                          >
                            View
                          </Button>
                          {exam.isPublished ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUnpublishExam(exam.id)}
                              disabled={unpublishingExamId === exam.id || unpublishExamMutation.isPending}
                            >
                              {unpublishingExamId === exam.id ? 'Unpublishing...' : 'Unpublish'}
                            </Button>
                          ) : (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handlePublishExam(exam.id)}
                              disabled={publishingExamId === exam.id || publishExamMutation.isPending}
                            >
                              {publishingExamId === exam.id ? 'Publishing...' : 'Publish'}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* C. CANDIDATES IN THIS SESSION */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Candidates in This Session</CardTitle>
              <CardDescription>
                {candidates.length === 0
                  ? 'No candidates assigned to this session yet'
                  : `${candidates.length} candidate${candidates.length !== 1 ? 's' : ''} found`}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBulkCsvDialog(true)}
                disabled={session?.status === 'completed'}
              >
                Bulk Add from CSV
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => setShowAddExistingDialog(true)}
                disabled={session?.status === 'completed'}
              >
                Add Existing Candidate
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {candidatesLoading ? (
            <LoadingState message="Loading candidates..." />
          ) : candidates.length === 0 ? (
            <EmptyState
              title="No candidates in this session"
              description="Assign candidates to this session from the Candidates page."
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Exam Attempts</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {candidates.map((candidate) => (
                    <TableRow key={candidate.id}>
                      <TableCell className="font-medium">
                        {candidate.firstName || candidate.lastName
                          ? `${candidate.firstName || ''} ${candidate.lastName || ''}`.trim()
                          : 'N/A'}
                      </TableCell>
                      <TableCell>{candidate.email}</TableCell>
                      <TableCell>
                        {candidateAttemptCounts.get(candidate.id) || 0}
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk CSV Upload Dialog */}
      {showBulkCsvDialog && sessionId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => !bulkCsvMutation.isPending && setShowBulkCsvDialog(false)}
        >
          <Card className="w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">
                Bulk Add Candidates from CSV
              </h2>
              <p className="text-sm text-muted-foreground">
                Upload a CSV file with columns: email, firstName, lastName. Existing candidates will be assigned, new ones will be created.
              </p>
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
                    if (!csvFile) {
                      return
                    }
                    try {
                      await bulkCsvMutation.mutateAsync({
                        sessionId,
                        file: csvFile,
                      })
                      setShowBulkCsvDialog(false)
                      setCsvFile(null)
                      if (fileInputRef.current) {
                        fileInputRef.current.value = ''
                      }
                    } catch (error) {
                      // Error handled by mutation
                    }
                  }}
                  disabled={bulkCsvMutation.isPending || !csvFile}
                >
                  {bulkCsvMutation.isPending ? 'Uploading...' : 'Upload CSV'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Add Existing Candidate Dialog */}
      {showAddExistingDialog && sessionId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => !assignCandidateMutation.isPending && setShowAddExistingDialog(false)}
        >
          <Card className="w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">
                Add Existing Candidate
              </h2>
              <p className="text-sm text-muted-foreground">
                Select an unassigned candidate to add to this session.
              </p>
              <div className="space-y-2">
                <Label htmlFor="candidate-select">Candidate</Label>
                <select
                  id="candidate-select"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={selectedCandidateId}
                  onChange={(e) => setSelectedCandidateId(e.target.value)}
                  disabled={assignCandidateMutation.isPending}
                >
                  <option value="">Select a candidate</option>
                  {unassignedCandidatesData?.items?.map((candidate) => (
                    <option key={candidate.id} value={candidate.id}>
                      {candidate.firstName || candidate.lastName
                        ? `${candidate.firstName || ''} ${candidate.lastName || ''}`.trim()
                        : candidate.email} ({candidate.email})
                    </option>
                  ))}
                </select>
                {unassignedCandidatesData?.items?.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    No unassigned candidates available.
                  </p>
                )}
              </div>
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddExistingDialog(false)
                    setSelectedCandidateId('')
                  }}
                  disabled={assignCandidateMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  onClick={async () => {
                    if (!selectedCandidateId) {
                      return
                    }
                    try {
                      await assignCandidateMutation.mutateAsync({
                        sessionId,
                        candidateId: selectedCandidateId,
                      })
                      setShowAddExistingDialog(false)
                      setSelectedCandidateId('')
                    } catch (error) {
                      // Error handled by mutation
                    }
                  }}
                  disabled={assignCandidateMutation.isPending || !selectedCandidateId}
                >
                  {assignCandidateMutation.isPending ? 'Adding...' : 'Add Candidate'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

