import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useCandidates, type CandidateStatus } from '@/hooks/useCandidates'
import { useCandidate } from '@/hooks/useCandidate'
import { useSessions } from '@/hooks/useSessions'
import { useTeamMembers } from '@/hooks/useTeamMembers'
import { ROUTES } from '@/constants/routes'
import { AddCandidateModal } from './components/AddCandidateModal'
import './recruiter.scss'
import './shared.scss'

// ── Icons ────────────────────────────────────────────────────────────────────
const IconUsers = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)
const IconCal = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)
const IconCheck = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/>
  </svg>
)
const IconTeam = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)
const IconSearch = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)
const IconFilter = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
  </svg>
)
const IconPlus = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)
const IconArrow = () => (
  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/>
  </svg>
)
const IconMail = () => (
  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
)
const IconPhone = () => (
  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.39 2 2 0 0 1 3.59 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.78a16 16 0 0 0 6 6l.86-.86a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16z"/>
  </svg>
)
const IconChevron = ({ open }: { open: boolean }) => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
    className={`rd-chevron${open ? ' rd-chevron--open' : ''}`}>
    <polyline points="6 9 12 15 18 9"/>
  </svg>
)
const IconX = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

// ── Helpers ──────────────────────────────────────────────────────────────────
// Maps the real CandidateStatus enum to a display label and to one of the
// badge color slugs already defined in recruiter.scss ($stage-colors) —
// reusing the closest existing color rather than inventing new CSS.
const STATUS_META: Record<CandidateStatus, { label: string; slug: string }> = {
  added:               { label: 'Added',               slug: 'pending' },
  interview_scheduled: { label: 'Interview Scheduled',  slug: 'scheduled' },
  interview_done:      { label: 'Interview Done',       slug: 'interviewed' },
  next_round:          { label: 'Next Round',           slug: 'awaiting-feedback' },
  on_hold:             { label: 'On Hold',              slug: 'on-hold' },
  rejected:            { label: 'Rejected',             slug: 'rejected' },
  hired:               { label: 'Hired',                slug: 'hired' },
}

const STATUS_OPTIONS = Object.keys(STATUS_META) as CandidateStatus[]

const isThisWeek = (isoDate: string): boolean => {
  const date = new Date(isoDate)
  const now = new Date()
  const day = now.getDay()
  const mondayOffset = day === 0 ? 6 : day - 1
  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - mondayOffset)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 7)
  return date >= weekStart && date < weekEnd
}

type Filters = { status: CandidateStatus | '' }
const EMPTY_FILTERS: Filters = { status: '' }

// ── Avatar ───────────────────────────────────────────────────────────────────
const Avatar = ({ name, size = 36 }: { name: string; size?: number }) => {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div className="rd-avatar" style={{ width: size, height: size, fontSize: size * 0.38 }}>
      {initials}
    </div>
  )
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) => (
  <div className="rd-stat-card">
    <div className="rd-stat-icon">{icon}</div>
    <div>
      <div className="rd-stat-label">{label}</div>
      <div className="rd-stat-value">{value.toLocaleString()}</div>
    </div>
  </div>
)

// ── Status badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }: { status: CandidateStatus }) => (
  <span className={`rd-badge rd-badge--${STATUS_META[status].slug}`}>{STATUS_META[status].label}</span>
)

// ── Filter Drawer ──────────────────────────────────────────────────────────────
const FilterDrawer = ({
  filters,
  onApply,
  onClose,
}: {
  filters: Filters
  onApply: (next: Filters) => void
  onClose: () => void
}) => {
  const [draft, setDraft] = useState<Filters>(filters)

  return (
    <div className="rd-drawer-overlay" onClick={onClose}>
      <div className="rd-drawer" onClick={e => e.stopPropagation()}>
        <div className="rd-drawer-header">
          <div className="rd-drawer-title">Filter Candidates</div>
          <button onClick={onClose} className="rd-modal-close"><IconX /></button>
        </div>

        <div className="rd-drawer-body">
          <div className="rd-form-group">
            <label className="rd-form-label">Status</label>
            <select
              value={draft.status}
              onChange={e => setDraft({ status: e.target.value as CandidateStatus | '' })}
              className="rd-form-select"
            >
              <option value="">All statuses</option>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
            </select>
          </div>
        </div>

        <div className="rd-drawer-footer">
          <button onClick={() => { setDraft(EMPTY_FILTERS); onApply(EMPTY_FILTERS) }} className="rd-btn-secondary">
            Clear all
          </button>
          <button onClick={() => onApply(draft)} className="rd-btn-primary">Apply filters</button>
        </div>
      </div>
    </div>
  )
}

// ── Candidate Detail Side Panel ───────────────────────────────────────────────
const DetailPanel = ({ candidateId, onNavigate }: { candidateId: string; onNavigate: () => void }) => {
  const [skillsOpen, setSkillsOpen] = useState(true)
  const { data: candidate } = useCandidate(candidateId)

  if (!candidate) return null

  const initials = candidate.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="rd-detail-panel">
      <div className="rd-detail-header">
        <div className="rd-detail-header-top">
          <div className="rd-detail-header-info">
            <div className="rd-detail-avatar">{initials}</div>
            <div>
              <div className="rd-detail-name">{candidate.name}</div>
              <div className="rd-detail-role">{candidate.roleApplyingFor}</div>
            </div>
          </div>
          <button onClick={onNavigate} className="rd-detail-nav-btn"><IconArrow /></button>
        </div>
      </div>

      <div className="rd-detail-body">
        <div className="rd-detail-contact">
          <div className="rd-detail-contact-row"><IconMail />{candidate.email}</div>
          <div className="rd-detail-contact-row"><IconPhone />{candidate.phone ?? 'Not provided'}</div>
        </div>

        <div className="rd-detail-skills">
          <button onClick={() => setSkillsOpen(o => !o)} className="rd-skills-toggle">
            Key Skills <IconChevron open={skillsOpen} />
          </button>
          {skillsOpen && (
            candidate.skills.length === 0 ? (
              <p className="rd-dept-text">No skills parsed from resume yet.</p>
            ) : (
              <div className="rd-skills-list">
                {candidate.skills.map(s => <span key={s} className="rd-skill-chip">{s}</span>)}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export const RecruiterDashboardPage = () => {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showFilterDrawer, setShowFilterDrawer] = useState(false)
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const activeFilterCount = filters.status ? 1 : 0

  const { data: candidatesPage } = useCandidates({
    page,
    search: query || undefined,
    status: filters.status || undefined,
  })
  const items = candidatesPage?.items ?? []
  const meta = candidatesPage?.meta
  const effectiveSelectedId = selectedId ?? items[0]?.id ?? null

  const { data: totalCandidates } = useCandidates({ limit: 1 })
  const { data: pendingDecisions } = useCandidates({ status: 'interview_done', limit: 1 })
  const { data: sessions } = useSessions()
  const { data: team } = useTeamMembers()

  const interviewsThisWeek = (sessions ?? []).filter(s => isThisWeek(s.scheduledAt)).length

  const stats = [
    { icon: <IconUsers />, label: 'Total Candidates',    value: totalCandidates?.meta.total ?? 0 },
    { icon: <IconCal />,   label: 'Interviews This Week', value: interviewsThisWeek },
    { icon: <IconCheck />, label: 'Pending Decisions',    value: pendingDecisions?.meta.total ?? 0 },
    { icon: <IconTeam />,  label: 'Team Size',            value: team?.meta.total ?? 0 },
  ]

  return (
    <div className="rd-page">

      {/* ── Top Bar ── */}
      <div className="rd-topbar">
        <div className="rd-topbar-left">
          <div className="rd-brand">
            <div className="rd-brand-mark">R</div>
            <span className="rd-brand-name">Recruitment Dashboard</span>
          </div>

          <div className="rd-topbar-search">
            <IconSearch />
            <input placeholder="Search candidate" />
          </div>

          <nav className="rd-nav">
            {[
              { label: 'Overview', route: ROUTES.RECRUITER_DASHBOARD, active: true },
              { label: 'Candidates', route: ROUTES.RECRUITER_CANDIDATES },
              { label: 'Schedule', route: ROUTES.RECRUITER_SCHEDULE },
              { label: 'Rooms', route: ROUTES.RECRUITER_ROOMS },
              { label: 'Team', route: ROUTES.RECRUITER_TEAM },
            ].map(({ label, route, active }) => (
              <button
                key={label}
                onClick={() => navigate(route ?? ROUTES.RECRUITER_DASHBOARD)}
                className={`rd-nav-link${active ? ' rd-nav-link--active' : ''}`}
              >{label}</button>
            ))}
          </nav>
        </div>

        <button onClick={() => setShowModal(true)} className="rd-btn-primary">
          <IconPlus /> Add Candidate
        </button>
      </div>

      {/* ── Page Body ── */}
      <div className="rd-body">
        <div>
          <div className="rd-breadcrumb">Home › Overview</div>
          <h1 className="rd-title">Recruitment Overview</h1>
        </div>

        <div className="rd-stats">
          {stats.map(s => <StatCard key={s.label} {...s} />)}
        </div>

        <div className="rd-content">

          {/* candidates table */}
          <div className="rd-table-card">
            <div className="rd-table-toolbar">
              <div>
                <div className="rd-table-toolbar-title">Active Candidates</div>
                <div className="rd-table-toolbar-meta">Managing {meta?.total ?? 0} profiles in current view</div>
              </div>
              <div className="rd-table-toolbar-actions">
                <div className="rd-search-box">
                  <IconSearch />
                  <input
                    placeholder="Search..."
                    value={query}
                    onChange={e => { setQuery(e.target.value); setPage(1) }}
                  />
                </div>
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setShowFilterDrawer(true)}
                    className={`rd-icon-btn${activeFilterCount > 0 ? ' rd-icon-btn--active' : ''}`}
                  >
                    <IconFilter />
                  </button>
                  {activeFilterCount > 0 && <span className="rd-filter-count">{activeFilterCount}</span>}
                </div>
              </div>
            </div>

            <div className="rd-table-header-row">
              {['Candidate', 'Applied Role', 'Status'].map(h => (
                <div key={h} className="rd-table-header-cell">{h}</div>
              ))}
            </div>

            {items.length === 0 ? (
              <div className="rd-table-empty">No candidates match your search or filters.</div>
            ) : (
              items.map(c => (
                <div
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  className={`rd-table-row${effectiveSelectedId === c.id ? ' rd-table-row--selected' : ''}`}
                >
                  <div className="rd-candidate-cell">
                    <Avatar name={c.name} />
                    <div>
                      <div className="rd-candidate-name">{c.name}</div>
                      <div className="rd-candidate-email">{c.email}</div>
                    </div>
                  </div>
                  <div>
                    <div className="rd-role-text">{c.roleApplyingFor}</div>
                  </div>
                  <div>
                    <StatusBadge status={c.status} />
                  </div>
                </div>
              ))
            )}

            {meta && meta.totalPages > 1 && (
              <div className="rd-pagination">
                <div className="rd-pagination-info">
                  Showing {(meta.page - 1) * meta.limit + 1}–{Math.min(meta.page * meta.limit, meta.total)} of {meta.total}
                </div>
                <div className="rd-pagination-controls">
                  <button
                    className="rd-pagination-btn"
                    disabled={meta.page === 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                  >Prev</button>
                  {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map(n => (
                    <button
                      key={n}
                      onClick={() => setPage(n)}
                      className={`rd-pagination-btn${n === meta.page ? ' rd-pagination-btn--active' : ''}`}
                    >{n}</button>
                  ))}
                  <button
                    className="rd-pagination-btn"
                    disabled={meta.page === meta.totalPages}
                    onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                  >Next</button>
                </div>
              </div>
            )}
          </div>

          {/* detail panel */}
          {effectiveSelectedId && (
            <DetailPanel
              candidateId={effectiveSelectedId}
              onNavigate={() => navigate(`/recruit/candidates/${effectiveSelectedId}`)}
            />
          )}
        </div>
      </div>

      {showModal && <AddCandidateModal onClose={() => setShowModal(false)} />}
      {showFilterDrawer && (
        <FilterDrawer
          filters={filters}
          onApply={(next) => { setFilters(next); setPage(1); setShowFilterDrawer(false) }}
          onClose={() => setShowFilterDrawer(false)}
        />
      )}
    </div>
  )
}
