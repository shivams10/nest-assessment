import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { SessionStatusBadge } from './SessionStatusBadge'
import { SubmitDialog } from '@/pages/exam/components/SubmitDialog'
import { ROUTES } from '@/constants'
import type { RecruitmentSession } from '@/types/session.types'

interface SessionsTableProps {
  sessions: RecruitmentSession[]
  isLoading?: boolean
  onDelete?: (sessionId: string) => void
  isDeleting?: boolean
}

/**
 * SessionsTable - Table component for displaying recruitment sessions
 */
export function SessionsTable({
  sessions,
  isLoading,
  onDelete,
  isDeleting = false,
}: SessionsTableProps) {
  const navigate = useNavigate()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)
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
    <>
      <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Year</TableHead>
          <TableHead>Start Date</TableHead>
          <TableHead>End Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Actions</TableHead>
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
            <TableCell>
              <div className="flex gap-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() =>
                    navigate(ROUTES.ADMIN_SESSIONS_DETAIL.replace(':sessionId', session.id))
                  }
                >
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    navigate(ROUTES.ADMIN_SESSIONS_EDIT.replace(':id', session.id))
                  }
                >
                  Edit
                </Button>
                {onDelete && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setSelectedSessionId(session.id)
                      setShowDeleteDialog(true)
                    }}
                    disabled={isDeleting}
                  >
                    Delete
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>

    {showDeleteDialog && (
      <SubmitDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={() => {
          if (selectedSessionId && onDelete) {
            onDelete(selectedSessionId)
            setShowDeleteDialog(false)
            setSelectedSessionId(null)
          }
        }}
        isSubmitting={isDeleting}
        title="Delete Session"
        description="Are you sure you want to delete this recruitment session? This action cannot be undone."
        confirmText="Delete"
        variant="destructive"
      />
    )}
  </>
  )
}
