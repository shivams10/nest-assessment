import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { CANDIDATE_STATUS_BADGE_CLASSES, Candidate } from '@/types/candidate.types'
import { RECRUITER_ROUTES } from '@/constants'

// Minimal mock store for candidate details (replace with API integration later)
const MOCK_CANDIDATES: Candidate[] = [
  {
    id: '1',
    name: 'Sarah Jenkins',
    email: 's.jenkins@example.com',
    phone: '+1 (555) 0912',
    role: 'Frontend Engineer',
    status: 'Scheduled',
    resume: 'sarah-jenkins.pdf',
    location: 'Remote',
    experience: '5 years',
    added: '2h ago',
    interviewHistory: [
      { round: 'Phone Screen', date: '2026-06-15', interviewer: 'Alan', outcome: 'Passed' },
    ],
    feedbackHistory: [
      { round: 'Phone Screen', date: '2026-06-15', author: 'Alan', message: 'Strong communication and solid fundamentals.' },
    ],
    comments: [
      { id: 'c1', author: 'Recruiter', date: '2026-06-16', message: 'Follow up on portfolio.' },
    ],
  },
]

export function CandidateDetailsPage() {
  const { candidateId } = useParams()
  const navigate = useNavigate()
  const candidate = useMemo(() => MOCK_CANDIDATES.find((c) => c.id === candidateId) ?? null, [candidateId])
  const [comments, setComments] = useState(candidate?.comments ?? [])
  const [newComment, setNewComment] = useState('')

  if (!candidate) {
    return (
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>Candidate not found</CardTitle>
            <CardDescription>The candidate ID is invalid or the record is unavailable.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate(RECRUITER_ROUTES.RECRUITER)}>Back to dashboard</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleAddComment = () => {
    if (!newComment.trim()) return
    const item = { id: String(Date.now()), author: 'You', date: new Date().toISOString().split('T')[0], message: newComment.trim() }
    setComments((prev) => [item, ...prev])
    setNewComment('')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{candidate.name}</h1>
          <p className="text-sm text-muted-foreground">{candidate.role} — {candidate.location}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate(RECRUITER_ROUTES.SCHEDULE_INTERVIEW.replace(':candidateId', candidate.id))}>Schedule Interview</Button>
          <Button variant="outline" onClick={() => navigate(RECRUITER_ROUTES.RECRUITER)}>Back</Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Basic information and resume</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <Label>Email</Label>
                <div className="text-foreground">{candidate.email}</div>
              </div>
              <div>
                <Label>Phone</Label>
                <div className="text-foreground">{candidate.phone}</div>
              </div>
            </div>
            <div>
              <Label>Experience</Label>
              <div className="text-foreground">{candidate.experience}</div>
            </div>
            <div>
              <Label>Resume</Label>
              <div className="text-foreground">{candidate.resume}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
            <CardDescription>Interview & feedback</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${CANDIDATE_STATUS_BADGE_CLASSES[candidate.status] ?? ''}`}>
              {candidate.status}
            </div>
            <div>
              <h3 className="text-sm font-medium">Reviews</h3>
              <div className="space-y-3 mt-2">
                {candidate.feedbackHistory.map((f, idx) => (
                  <div key={idx} className="rounded-md bg-muted p-3 text-sm">
                    <div className="font-medium">{f.author} — {f.round}</div>
                    <div className="text-sm text-muted-foreground">{f.date}</div>
                    <div className="mt-1 text-foreground">{f.message}</div>
                  </div>
                ))}
                {candidate.feedbackHistory.length === 0 && <div className="text-sm text-muted-foreground">No reviews yet</div>}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Comments</CardTitle>
          <CardDescription>Add notes visible to recruiters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Add comment</Label>
            <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} className="w-full resize-y rounded-md border p-2" rows={3} />
            <div className="flex justify-end">
              <Button onClick={handleAddComment}>Add Comment</Button>
            </div>
          </div>

          <div className="space-y-3">
            {comments.map((c) => (
              <div key={c.id} className="rounded-md border p-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{c.author}</div>
                  <div className="text-sm text-muted-foreground">{c.date}</div>
                </div>
                <div className="mt-2 text-foreground">{c.message}</div>
              </div>
            ))}
            {comments.length === 0 && <div className="text-sm text-muted-foreground">No comments yet</div>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { recruiterCandidates } from '@/pages/recruiter/recruiterCandidateData'
import { RECRUITER_ROUTES } from '@/constants'
import { CANDIDATE_STATUS_BADGE_CLASSES } from '@/types/candidate.types'

export function CandidateDetailsPage() {
  const navigate = useNavigate()
  const params = useParams<{ candidateId: string }>()
  const candidate = useMemo(
    () => recruiterCandidates.find((item) => item.id === params.candidateId),
    [params.candidateId],
  )

  const [comments, setComments] = useState(candidate?.comments ?? [])
  const [newComment, setNewComment] = useState('')

  useEffect(() => {
    setComments(candidate?.comments ?? [])
    setNewComment('')
  }, [candidate])

  if (!candidate) {
    return (
      <div className="min-h-[calc(100vh-4rem)] p-6">
        <Card>
          <CardContent className="text-center">
            <CardTitle>Candidate not found</CardTitle>
            <p className="text-sm text-muted-foreground">Please return to the dashboard and choose a valid profile.</p>
            <div className="mt-4">
              <Button variant="outline" onClick={() => navigate(RECRUITER_ROUTES.RECRUITER)}>
                Back to recruiter dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleAddComment = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!newComment.trim()) return

    setComments((prev) => [
      {
        id: `${Date.now()}`,
        author: 'You',
        date: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        message: newComment.trim(),
      },
      ...prev,
    ])

    setNewComment('')
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Button variant="ghost" onClick={() => navigate(RECRUITER_ROUTES.RECRUITER)}>
            ← Back to recruiter dashboard
          </Button>
          <h1 className="mt-4 text-3xl font-semibold text-foreground">{candidate.name}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{candidate.role}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => navigate(RECRUITER_ROUTES.RECRUITER)}>
            Back to dashboard
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              navigate(
                RECRUITER_ROUTES.SCHEDULE_INTERVIEW.replace(
                  ':candidateId',
                  candidate.id,
                ),
              )
            }
          >
            Schedule Interview
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <Card className="border-border bg-card">
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Profile</CardTitle>
                <CardDescription>Candidate details, status and contact info.</CardDescription>
              </div>
              <Button
                variant="secondary"
                onClick={() =>
                  navigate(
                    RECRUITER_ROUTES.SCHEDULE_INTERVIEW.replace(
                      ':candidateId',
                      candidate.id,
                    ),
                  )
                }
              >
                Schedule Interview
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-3xl bg-primary/10 p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Current Stage</p>
                    <p className="mt-2 text-2xl font-semibold text-foreground">{candidate.status}</p>
                  </div>
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${CANDIDATE_STATUS_BADGE_CLASSES[candidate.status]}`}
                  >
                    {candidate.status}
                  </span>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl bg-muted p-5">
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="mt-2 text-foreground">{candidate.email}</p>
                </div>
                <div className="rounded-3xl bg-muted p-5">
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="mt-2 text-foreground">{candidate.phone}</p>
                </div>
                <div className="rounded-3xl bg-muted p-5">
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="mt-2 text-foreground">{candidate.location}</p>
                </div>
                <div className="rounded-3xl bg-muted p-5">
                  <p className="text-sm text-muted-foreground">Experience</p>
                  <p className="mt-2 text-foreground">{candidate.experience}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Interview history</CardTitle>
              <CardDescription>Previous rounds and outcomes.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {candidate.interviewHistory.map((item) => (
                <div key={item.round} className="rounded-3xl border border-border bg-background p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{item.round}</p>
                      <p className="text-sm text-muted-foreground">{item.interviewer} · {item.date}</p>
                    </div>
                    <span className="text-sm text-muted-foreground">{item.score ?? item.outcome}</span>
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">Outcome: {item.outcome}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Recruiter comments</CardTitle>
              <CardDescription>Central place for collaboration notes and next actions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleAddComment} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="comment">Add new comment</Label>
                  <textarea
                    id="comment"
                    value={newComment}
                    onChange={(event) => setNewComment(event.target.value)}
                    rows={4}
                    className="w-full rounded-3xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="Add your note or next step for this candidate"
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={!newComment.trim()}>
                    Save comment
                  </Button>
                </div>
              </form>

              <div className="space-y-4">
                {comments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No comments yet.</p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="rounded-3xl border border-border bg-background p-4">
                      <div className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
                        <span>{comment.author}</span>
                        <span>{comment.date}</span>
                      </div>
                      <p className="mt-3 text-sm text-foreground">{comment.message}</p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Latest feedback</CardTitle>
              <CardDescription>Insights from the most recent interview rounds.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {candidate.feedbackHistory.map((item) => (
                <div key={item.round} className="rounded-3xl border border-border bg-background p-5">
                  <p className="text-sm font-semibold text-foreground">{item.round}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{item.author} · {item.date}</p>
                  <p className="mt-3 text-sm leading-6 text-foreground">{item.message}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
