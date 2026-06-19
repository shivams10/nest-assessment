import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { RECRUITER_ROUTES } from '@/constants'

interface CandidateRow {
  id: string
  name: string
  email: string
  role: string
  status: string
  added: string
}

const initial: CandidateRow[] = [
  { id: '1', name: 'Sarah Jenkins', email: 's.jenkins@example.com', role: 'Frontend', status: 'Scheduled', added: '2h ago' },
  { id: '2', name: 'Marcus Thorne', email: 'm.thorne@work.co', role: 'Designer', status: 'Awaiting Feedback', added: '5h ago' },
  { id: '3', name: 'Elena Rodriguez', email: 'elena.rod@dev.io', role: 'DevOps', status: 'Interviewed', added: 'Yesterday' },
]

export function RecruiterDashboardPage() {
  const [candidates] = useState<CandidateRow[]>(initial)
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const filtered = useMemo(
    () => candidates.filter((c) => [c.name, c.email, c.role, c.status].join(' ').toLowerCase().includes(query.toLowerCase())),
    [candidates, query],
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Recruiter Dashboard</h1>
          <p className="text-sm text-muted-foreground">Quick access to candidates and scheduling</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate(RECRUITER_ROUTES.RECRUITER)}>Dashboard</Button>
          <Button variant="outline" onClick={() => navigate(RECRUITER_ROUTES.SCHEDULE_INTERVIEW.replace(':candidateId', candidates[0]?.id ?? ''))}>Schedule Interview</Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Candidates</CardTitle>
            <CardDescription>Open candidate profiles or schedule interviews</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Input placeholder="Search candidate..." value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.id} className="hover:cursor-pointer" onClick={() => navigate(RECRUITER_ROUTES.CANDIDATE_DETAILS.replace(':candidateId', c.id))}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{c.name}</span>
                      <span className="text-sm text-muted-foreground">{c.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>{c.role}</TableCell>
                  <TableCell>{c.status}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); navigate(RECRUITER_ROUTES.CANDIDATE_DETAILS.replace(':candidateId', c.id)) }} aria-label="Open candidate">
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">No candidates found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

