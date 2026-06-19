import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { recruiterCandidates, type CandidateStatus } from './recruiterCandidateData'
import { ROUTES } from '@/constants/routes'
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
const IconMsg = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
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
const IconUpload = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
  </svg>
)
const IconX = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

// ── Helpers ──────────────────────────────────────────────────────────────────
const slugify = (value: string) => value.toLowerCase().trim().replace(/\s+/g, '-')

const STATUS_OPTIONS: CandidateStatus[] = [
  'Pending', 'Scheduled', 'Interviewed', 'Awaiting Feedback', 'Hired', 'Rejected',
]

const PAGE_SIZE = 8

type Filters = { name: string; email: string; status: string; role: string }
const EMPTY_FILTERS: Filters = { name: '', email: '', status: '', role: '' }

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
const StatusBadge = ({ status }: { status?: string }) => (
  <span className={`rd-badge rd-badge--${slugify(status ?? 'pending')}`}>{status ?? 'Pending'}</span>
)

// ── Add Candidate Modal ───────────────────────────────────────────────────────
const AddCandidateModal = ({ onClose }: { onClose: () => void }) => {
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [file, setFile] = useState<File | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }))

  return (
    <div className="rd-modal-overlay" onClick={onClose}>
      <div className="rd-modal" onClick={e => e.stopPropagation()}>
        <div className="rd-modal-header">
          <div>
            <div className="rd-modal-title">Add Candidate</div>
            <div className="rd-modal-subtitle">Fill in the candidate details below</div>
          </div>
          <button onClick={onClose} className="rd-modal-close"><IconX /></button>
        </div>

        {([
          { label: 'Full Name', key: 'name', type: 'text', placeholder: 'e.g. Sarah Jenkins' },
          { label: 'Email Address', key: 'email', type: 'email', placeholder: 'sarah@example.com' },
          { label: 'Phone Number', key: 'phone', type: 'tel', placeholder: '+1 (555) 000-0000' },
        ] as const).map(({ label, key, type, placeholder }) => (
          <div key={key} className="rd-form-group">
            <label className="rd-form-label">{label}</label>
            <input
              type={type}
              placeholder={placeholder}
              value={form[key]}
              onChange={set(key)}
              className="rd-form-input"
            />
          </div>
        ))}

        <div className="rd-form-group">
          <label className="rd-form-label">Resume</label>
          <div onClick={() => fileRef.current?.click()} className="rd-upload-box">
            <div className="rd-upload-icon"><IconUpload /></div>
            <div className="rd-upload-text">
              {file
                ? <span className="rd-upload-filename">{file.name}</span>
                : <><strong>Click to upload</strong> or drag & drop</>}
            </div>
            <div className="rd-upload-hint">PDF, DOC, DOCX up to 10MB</div>
          </div>
          <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }}
            onChange={e => setFile(e.target.files?.[0] ?? null)} />
        </div>

        <div className="rd-modal-actions">
          <button onClick={onClose} className="rd-btn-secondary">Cancel</button>
          <button className="rd-btn-primary">Add Candidate</button>
        </div>
      </div>
    </div>
  )
}

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

  const update = (key: keyof Filters) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setDraft(p => ({ ...p, [key]: e.target.value }))

  return (
    <div className="rd-drawer-overlay" onClick={onClose}>
      <div className="rd-drawer" onClick={e => e.stopPropagation()}>
        <div className="rd-drawer-header">
          <div className="rd-drawer-title">Filter Candidates</div>
          <button onClick={onClose} className="rd-modal-close"><IconX /></button>
        </div>

        <div className="rd-drawer-body">
          <div className="rd-form-group">
            <label className="rd-form-label">Name</label>
            <input
              type="text"
              placeholder="e.g. Amina Patel"
              value={draft.name}
              onChange={update('name')}
              className="rd-form-input"
            />
          </div>

          <div className="rd-form-group">
            <label className="rd-form-label">Email</label>
            <input
              type="text"
              placeholder="e.g. amina@interop.com"
              value={draft.email}
              onChange={update('email')}
              className="rd-form-input"
            />
          </div>

          <div className="rd-form-group">
            <label className="rd-form-label">Status</label>
            <select value={draft.status} onChange={update('status')} className="rd-form-select">
              <option value="">All statuses</option>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="rd-form-group">
            <label className="rd-form-label">Applied Role</label>
            <input
              type="text"
              placeholder="e.g. Frontend Engineer"
              value={draft.role}
              onChange={update('role')}
              className="rd-form-input"
            />
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
const DetailPanel = ({ candidate, onNavigate }: { candidate: (typeof recruiterCandidates)[0]; onNavigate: () => void }) => {
  const [skillsOpen, setSkillsOpen] = useState(true)
  const skills = ['React', 'TypeScript', 'Node.js', 'System Design', 'Cloud Ops']
  const initials = candidate.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="rd-detail-panel">
      {/* indigo header strip — now carries the candidate identity */}
      <div className="rd-detail-header">
        <div className="rd-detail-header-top">
          <div className="rd-detail-header-info">
            <div className="rd-detail-avatar">{initials}</div>
            <div>
              <div className="rd-detail-name">{candidate.name}</div>
              <div className="rd-detail-role">{candidate.role}</div>
            </div>
          </div>
          <button onClick={onNavigate} className="rd-detail-nav-btn"><IconArrow /></button>
        </div>
      </div>

      <div className="rd-detail-body">
        <div className="rd-detail-contact">
          <div className="rd-detail-contact-row"><IconMail />{candidate.email}</div>
          <div className="rd-detail-contact-row"><IconPhone />+1 (555) 0912</div>
        </div>

        <div className="rd-detail-skills">
          <button onClick={() => setSkillsOpen(o => !o)} className="rd-skills-toggle">
            Key Skills <IconChevron open={skillsOpen} />
          </button>
          {skillsOpen && (
            <div className="rd-skills-list">
              {skills.map(s => <span key={s} className="rd-skill-chip">{s}</span>)}
            </div>
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
  const [selected, setSelected] = useState(recruiterCandidates[0] ?? null)

  const activeFilterCount = Object.values(filters).filter(Boolean).length

  const filtered = useMemo(
    () => recruiterCandidates.filter(c => {
      const matchesQuery = [c.name, c.email, c.role].join(' ').toLowerCase().includes(query.toLowerCase())
      const matchesName = filters.name ? c.name.toLowerCase().includes(filters.name.toLowerCase()) : true
      const matchesEmail = filters.email ? c.email.toLowerCase().includes(filters.email.toLowerCase()) : true
      const matchesStatus = filters.status ? (c.status ?? 'Pending') === filters.status : true
      const matchesRole = filters.role ? c.role.toLowerCase().includes(filters.role.toLowerCase()) : true
      return matchesQuery && matchesName && matchesEmail && matchesStatus && matchesRole
    }),
    [query, filters],
  )

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page],
  )

  // keep page in range whenever the filtered set changes size
  useEffect(() => {
    setPage(p => Math.min(p, totalPages))
  }, [totalPages])

  const stats = [
    { icon: <IconUsers />, label: 'Total Candidates', value: 1248 },
    { icon: <IconCal />,   label: 'Interviews This Week', value: 42 },
    { icon: <IconCheck />, label: 'Pending Decisions', value: 12 },
    { icon: <IconMsg />,   label: 'Feedbacks Received', value: 89 },
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
                <div className="rd-table-toolbar-meta">Managing {filtered.length} profiles in current view</div>
              </div>
              <div className="rd-table-toolbar-actions">
                <div className="rd-search-box">
                  <IconSearch />
                  <input placeholder="Search..." value={query} onChange={e => setQuery(e.target.value)} />
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

            {paginated.length === 0 ? (
              <div className="rd-table-empty">No candidates match your search or filters.</div>
            ) : (
              paginated.map(c => (
                <div
                  key={c.id}
                  onClick={() => setSelected(c)}
                  className={`rd-table-row${selected?.id === c.id ? ' rd-table-row--selected' : ''}`}
                >
                  <div className="rd-candidate-cell">
                    <Avatar name={c.name} />
                    <div>
                      <div className="rd-candidate-name">{c.name}</div>
                      <div className="rd-candidate-email">{c.email}</div>
                    </div>
                  </div>
                  <div>
                    <div className="rd-role-text">{c.role}</div>
                    <div className="rd-dept-text">{c.department ?? 'Engineering'}</div>
                  </div>
                  <div>
                    <StatusBadge status={c.status} />
                  </div>
                </div>
              ))
            )}

            {filtered.length > PAGE_SIZE && (
              <div className="rd-pagination">
                <div className="rd-pagination-info">
                  Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
                </div>
                <div className="rd-pagination-controls">
                  <button
                    className="rd-pagination-btn"
                    disabled={page === 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                  >Prev</button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                    <button
                      key={n}
                      onClick={() => setPage(n)}
                      className={`rd-pagination-btn${n === page ? ' rd-pagination-btn--active' : ''}`}
                    >{n}</button>
                  ))}
                  <button
                    className="rd-pagination-btn"
                    disabled={page === totalPages}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  >Next</button>
                </div>
              </div>
            )}
          </div>

          {/* detail panel */}
          {selected && (
            <DetailPanel candidate={selected} onNavigate={() => navigate(`/recruit/candidates/${selected.id}`)} />
          )}
        </div>
      </div>

      {showModal && <AddCandidateModal onClose={() => setShowModal(false)} />}
      {showFilterDrawer && (
        <FilterDrawer
          filters={filters}
          onApply={(next) => { setFilters(next); setShowFilterDrawer(false) }}
          onClose={() => setShowFilterDrawer(false)}
        />
      )}
    </div>
  )
}