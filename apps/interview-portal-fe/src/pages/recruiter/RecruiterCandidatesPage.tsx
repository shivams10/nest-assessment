import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { UsersIcon } from '@/components/icons'
import { EmptyState, LoadingSpinner, PageHeader } from '@/components/ui'
import { useCandidates, type CandidateStatus } from '@/hooks/useCandidates'
import { AddCandidateModal } from './components/AddCandidateModal'

const STATUS_LABEL: Record<CandidateStatus, string> = {
  added:                'Added',
  interview_scheduled:  'Interview Scheduled',
  interview_done:       'Interview Done',
  next_round:           'Next Round',
  on_hold:              'On Hold',
  rejected:             'Rejected',
  hired:                'Hired',
}

const STATUS_OPTIONS = Object.keys(STATUS_LABEL) as CandidateStatus[]

const formatDate = (value: string) => new Date(value).toLocaleDateString()

export const RecruiterCandidatesPage = () => {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<CandidateStatus | ''>('')
  const [page, setPage] = useState(1)
  const [showAddModal, setShowAddModal] = useState(false)

  const { data, isLoading } = useCandidates({
    page,
    search: search || undefined,
    status: status || undefined,
  })

  const candidates = data?.items ?? []
  const meta = data?.meta

  return (
    <>
      <PageHeader
        title="Candidates"
        description="Manage your candidate pipeline"
        action={
          <button
            onClick={() => setShowAddModal(true)}
            className="h-9 rounded-md bg-brand px-4 text-sm font-medium text-white hover:bg-brand-hover"
          >
            Add Candidate
          </button>
        }
      />

      <div className="mb-4 flex gap-3">
        <input
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="h-9 flex-1 rounded-md border border-border px-3 text-sm text-content-primary focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-border"
        />
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value as CandidateStatus | ''); setPage(1) }}
          className="h-9 rounded-md border border-border px-3 text-sm text-content-primary"
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{STATUS_LABEL[s]}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : candidates.length === 0 ? (
        <EmptyState
          icon={<UsersIcon size={24} />}
          title="No candidates yet"
          description="Add your first candidate to get started."
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <div className="grid grid-cols-4 border-b border-border bg-surface-subtle px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-content-muted">
            <div>Name</div>
            <div>Role</div>
            <div>Status</div>
            <div>Added</div>
          </div>
          {candidates.map((candidate) => (
            <div
              key={candidate.id}
              onClick={() => navigate(`/recruit/candidates/${candidate.id}`)}
              className="grid cursor-pointer grid-cols-4 items-center border-b border-surface-subtle px-4 py-3 text-sm last:border-b-0 hover:bg-surface-subtle"
            >
              <div>
                <div className="font-medium text-content-primary">{candidate.name}</div>
                <div className="text-content-secondary">{candidate.email}</div>
              </div>
              <div className="text-content-secondary">{candidate.roleApplyingFor}</div>
              <div>
                <span className="rounded-full bg-surface-subtle px-2.5 py-0.5 text-xs font-medium text-content-secondary">
                  {STATUS_LABEL[candidate.status]}
                </span>
              </div>
              <div className="text-content-secondary">{formatDate(candidate.createdAt)}</div>
            </div>
          ))}

          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm text-content-secondary">
              <span>Page {meta.page} of {meta.totalPages}</span>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-md border border-border px-3 py-1 disabled:opacity-40"
                >
                  Prev
                </button>
                <button
                  disabled={page >= meta.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-md border border-border px-3 py-1 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {showAddModal && <AddCandidateModal onClose={() => setShowAddModal(false)} />}
    </>
  )
}
