import { useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Candidate {
  id: string
  name: string
  email: string
  phone: string
  role: string
  status: 'Scheduled' | 'Awaiting Feedback' | 'Interviewed'
  added: string
  resume: string
}

const initialCandidates: Candidate[] = [
  {
    id: '1',
    name: 'Sarah Jenkins',
    email: 's.jenkins@example.com',
    phone: '+1 (555) 0912',
    role: 'Senior Frontend Engineer',
    status: 'Scheduled',
    added: '2h ago',
    resume: 'sarah-jenkins.pdf',
  },
  {
    id: '2',
    name: 'Marcus Thorne',
    email: 'm.thorne@work.co',
    phone: '+1 (555) 3244',
    role: 'Product Designer',
    status: 'Awaiting Feedback',
    added: '5h ago',
    resume: 'marcus-thorne.pdf',
  },
  {
    id: '3',
    name: 'Elena Rodriguez',
    email: 'elena.rod@dev.io',
    phone: '+1 (555) 7832',
    role: 'DevOps Architect',
    status: 'Interviewed',
    added: 'Yesterday',
    resume: 'elena-rodriguez.pdf',
  },
]

export function AdminDashboardPage() {
  const [candidates, setCandidates] = useState<Candidate[]>(initialCandidates)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>(initialCandidates[0].id)
  const [showAddCandidateDialog, setShowAddCandidateDialog] = useState(false)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [formError, setFormError] = useState('')
  const inputFileRef = useRef<HTMLInputElement>(null)

  const filteredCandidates = useMemo(
    () =>
      candidates.filter((candidate) =>
        [candidate.name, candidate.email, candidate.role, candidate.status]
          .join(' ')
          .toLowerCase()
          .includes(searchQuery.toLowerCase()),
      ),
    [candidates, searchQuery],
  )

  const selectedCandidate = candidates.find((candidate) => candidate.id === selectedCandidateId) || candidates[0]

  const summary = useMemo(
    () => ({
      totalCandidates: candidates.length,
      interviewsThisWeek: 42,
      pendingDecisions: 12,
      feedbacksReceived: 89,
    }),
    [candidates.length],
  )

  const handleAddCandidate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!fullName.trim() || !email.trim() || !phone.trim() || !resumeFile) {
      setFormError('All fields are required, including resume upload.')
      return
    }

    const nextCandidate: Candidate = {
      id: `${Date.now()}`,
      name: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      role: 'Full Stack Developer',
      status: 'Scheduled',
      added: 'Just now',
      resume: resumeFile.name,
    }

    setCandidates((prev) => [nextCandidate, ...prev])
    setFullName('')
    setEmail('')
    setPhone('')
    setResumeFile(null)
    setFormError('')
    setShowAddCandidateDialog(false)
    setSelectedCandidateId(nextCandidate.id)
  }

  const triggerFileUpload = () => {
    inputFileRef.current?.click()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            Recruitment Overview
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Track candidate flow, interviews, and pending feedback from one place.
          </p>
        </div>
        <Button onClick={() => setShowAddCandidateDialog(true)}>
          Add Candidate
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base">Total Candidates</CardTitle>
            <CardDescription className="text-3xl font-semibold text-foreground">
              {summary.totalCandidates}
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base">Interviews This Week</CardTitle>
            <CardDescription className="text-3xl font-semibold text-foreground">
              {summary.interviewsThisWeek}
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base">Pending Decisions</CardTitle>
            <CardDescription className="text-3xl font-semibold text-foreground">
              {summary.pendingDecisions}
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base">Feedbacks Received</CardTitle>
            <CardDescription className="text-3xl font-semibold text-foreground">
              {summary.feedbacksReceived}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg">Active Candidates</CardTitle>
              <CardDescription>Managing profiles in current view</CardDescription>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Input
                type="search"
                placeholder="Search candidate..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="max-w-sm"
              />
              <Button variant="outline" onClick={() => setShowAddCandidateDialog(true)}>
                Add Candidate
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Added</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCandidates.map((candidate) => (
                  <TableRow
                    key={candidate.id}
                    className={
                      candidate.id === selectedCandidateId
                        ? 'bg-primary/10 hover:bg-primary/20'
                        : ''
                    }
                    onClick={() => setSelectedCandidateId(candidate.id)}
                  >
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-foreground">{candidate.name}</span>
                        <span className="text-sm text-muted-foreground">{candidate.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>{candidate.role}</TableCell>
                    <TableCell>
                      <span
                        className={
                          `inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                            candidate.status === 'Scheduled'
                              ? 'bg-blue-500/10 text-blue-600'
                              : candidate.status === 'Awaiting Feedback'
                              ? 'bg-amber-500/10 text-amber-600'
                              : 'bg-emerald-500/10 text-emerald-600'
                          }`
                        }
                      >
                        {candidate.status}
                      </span>
                    </TableCell>
                    <TableCell>{candidate.added}</TableCell>
                  </TableRow>
                ))}
                {filteredCandidates.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                      No candidates match your search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Candidate Details</CardTitle>
            <CardDescription>Selected profile information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {selectedCandidate ? (
              <div className="space-y-4">
                <div className="rounded-3xl bg-primary/10 p-6">
                  <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Current Candidate</p>
                  <h2 className="mt-3 text-xl font-semibold text-foreground">{selectedCandidate.name}</h2>
                  <p className="text-sm text-muted-foreground">{selectedCandidate.role}</p>
                </div>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Email</span>
                    <span className="text-foreground">{selectedCandidate.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Phone</span>
                    <span className="text-foreground">{selectedCandidate.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Interview status</span>
                    <span className="text-foreground">{selectedCandidate.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Resume</span>
                    <span className="text-foreground">{selectedCandidate.resume}</span>
                  </div>
                </div>
                <div className="grid gap-2">
                  <span className="text-sm font-medium text-foreground">Key skills</span>
                  <div className="flex flex-wrap gap-2">
                    {['React', 'TypeScript', 'Node.js', 'System Design', 'Cloud Ops'].map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-foreground"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Select a candidate to view details.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {showAddCandidateDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setShowAddCandidateDialog(false)}
        >
          <Card
            className="w-full max-w-2xl p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Add Candidate</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Enter candidate details and upload a resume to start the recruitment flow.
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowAddCandidateDialog(false)}
                aria-label="Close dialog"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>

            <form className="mt-6 space-y-5" onSubmit={handleAddCandidate}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="candidate-name">Full Name</Label>
                  <Input
                    id="candidate-name"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="candidate-email">Email</Label>
                  <Input
                    id="candidate-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="john.doe@example.com"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="candidate-phone">Contact Number</Label>
                  <Input
                    id="candidate-phone"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="+1 (555) 1234"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Resume Upload</Label>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Button type="button" variant="outline" onClick={triggerFileUpload}>
                    Upload Resume
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {resumeFile ? resumeFile.name : 'PDF or DOCX file required'}
                  </span>
                </div>
                <input
                  ref={inputFileRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0]
                    if (file) {
                      setResumeFile(file)
                    }
                  }}
                />
              </div>

              {formError && (
                <p className="text-sm text-destructive">{formError}</p>
              )}

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowAddCandidateDialog(false)}
                  type="button"
                >
                  Cancel
                </Button>
                <Button type="submit">Save Candidate</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}

