import { useState, type FormEvent } from 'react'
import axios from 'axios'

import { UsersIcon } from '@/components/icons'
import { EmptyState, LoadingSpinner, PageHeader } from '@/components/ui'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useTeamMembers, type TeamMember } from '@/hooks/useTeamMembers'
import { useInviteTeamMember } from '@/hooks/useInviteTeamMember'
import { useUpdateTeamMemberStatus } from '@/hooks/useUpdateTeamMemberStatus'

const COPY = {
  admin: {
    pageTitle:    'Recruitment Team',
    pageDesc:     'Manage recruiters on the platform',
    emptyTitle:   'No recruiters yet',
    emptyDesc:    'Invite recruiters to start managing candidates and interviews.',
    inviteAction: 'Invite Recruiter',
    modalTitle:   'Invite Recruiter',
  },
  recruiter: {
    pageTitle:    'Interviewers',
    pageDesc:     'Manage interviewers on your team',
    emptyTitle:   'No interviewers yet',
    emptyDesc:    'Invite interviewers to your team to start scheduling sessions.',
    inviteAction: 'Invite Interviewer',
    modalTitle:   'Invite Interviewer',
  },
} as const

const formatName = (member: TeamMember) =>
  [member.firstName, member.lastName].filter(Boolean).join(' ') || member.email

const formatDate = (value: string) => new Date(value).toLocaleDateString()

const InviteModal = ({ title, onClose }: { title: string; onClose: () => void }) => {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const inviteTeamMember = useInviteTeamMember()

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    inviteTeamMember.mutate(
      { firstName, lastName, email },
      {
        onSuccess: () => onClose(),
        onError: (err) => {
          const message =
            axios.isAxiosError(err) && typeof err.response?.data?.message === 'string'
              ? err.response.data.message
              : 'Something went wrong. Please try again.'
          setError(message)
        },
      },
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-xl bg-surface p-6 shadow-lg"
      >
        <h2 className="text-base font-semibold text-content-primary">{title}</h2>

        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-content-secondary">First Name</label>
            <input
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="h-9 w-full rounded-md border border-border px-3 text-sm text-content-primary focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-border"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-content-secondary">Last Name</label>
            <input
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="h-9 w-full rounded-md border border-border px-3 text-sm text-content-primary focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-border"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-content-secondary">Email</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-9 w-full rounded-md border border-border px-3 text-sm text-content-primary focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-border"
            />
          </div>
        </div>

        {error && (
          <p className="mt-3 rounded-md border border-status-error-border bg-status-error-bg px-3 py-2 text-xs text-status-error-text">
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-md border border-border px-4 text-sm font-medium text-content-primary hover:bg-surface-subtle"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={inviteTeamMember.isPending}
            className="h-9 rounded-md bg-brand px-4 text-sm font-medium text-white hover:bg-brand-hover disabled:opacity-50"
          >
            {inviteTeamMember.isPending ? 'Sending invite…' : 'Send Invite'}
          </button>
        </div>
      </form>
    </div>
  )
}

export const RecruiterTeamPage = () => {
  const { data: currentUser } = useCurrentUser()
  const { data: team, isLoading } = useTeamMembers()
  const updateStatus = useUpdateTeamMemberStatus()
  const [showInviteModal, setShowInviteModal] = useState(false)

  const copy = currentUser?.role === 'admin' ? COPY.admin : COPY.recruiter
  const members = team?.items ?? []

  return (
    <>
      <PageHeader
        title={copy.pageTitle}
        description={copy.pageDesc}
        action={
          <button
            onClick={() => setShowInviteModal(true)}
            className="h-9 rounded-md bg-brand px-4 text-sm font-medium text-white hover:bg-brand-hover"
          >
            {copy.inviteAction}
          </button>
        }
      />

      {isLoading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : members.length === 0 ? (
        <EmptyState icon={<UsersIcon size={24} />} title={copy.emptyTitle} description={copy.emptyDesc} />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <div className="grid grid-cols-4 border-b border-border bg-surface-subtle px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-content-muted">
            <div>Name</div>
            <div>Email</div>
            <div>Joined</div>
            <div className="text-right">Status</div>
          </div>
          {members.map((member) => (
            <div
              key={member.id}
              className="grid grid-cols-4 items-center border-b border-surface-subtle px-4 py-3 text-sm last:border-b-0"
            >
              <div className="font-medium text-content-primary">{formatName(member)}</div>
              <div className="text-content-secondary">{member.email}</div>
              <div className="text-content-secondary">{formatDate(member.createdAt)}</div>
              <div className="flex justify-end">
                <button
                  onClick={() => updateStatus.mutate({ id: member.id, isActive: !member.isActive })}
                  disabled={updateStatus.isPending}
                  className={
                    member.isActive
                      ? 'rounded-full bg-status-success-bg px-2.5 py-0.5 text-xs font-medium text-status-success-text'
                      : 'rounded-full bg-status-error-bg px-2.5 py-0.5 text-xs font-medium text-status-error-text'
                  }
                >
                  {member.isActive ? 'Active' : 'Deactivated'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showInviteModal && (
        <InviteModal title={copy.modalTitle} onClose={() => setShowInviteModal(false)} />
      )}
    </>
  )
}
