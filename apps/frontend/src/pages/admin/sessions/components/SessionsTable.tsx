import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { SessionStatusBadge } from './SessionStatusBadge'
import type { RecruitmentSession } from '@/types/session.types'

interface SessionsTableProps {
  sessions: RecruitmentSession[]
  isLoading?: boolean
}

/**
 * SessionsTable - Table component for displaying recruitment sessions
 */
export function SessionsTable({ sessions, isLoading }: SessionsTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded-md bg-muted" />
        ))}
      </div>
    )
  }

  if (sessions.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        No sessions found
      </div>
    )
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Year</TableHead>
          <TableHead>Start Date</TableHead>
          <TableHead>End Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sessions.map((session) => (
          <TableRow key={session.id}>
            <TableCell className="font-medium">{session.name}</TableCell>
            <TableCell>{session.year}</TableCell>
            <TableCell>{formatDate(session.startDate)}</TableCell>
            <TableCell>{formatDate(session.endDate)}</TableCell>
            <TableCell>
              <SessionStatusBadge status={session.status} />
            </TableCell>
            <TableCell className="text-muted-foreground">
              {new Date(session.createdAt).toLocaleDateString()}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
