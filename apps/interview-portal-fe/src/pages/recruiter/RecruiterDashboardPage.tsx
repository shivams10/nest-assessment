import { useMemo, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

import { recruiterCandidates } from './recruiterCandidateData'
import { ROUTES } from '@/constants/routes'
import { Avatar } from './components/Avatar'
import { StatCard } from './components/StatCard'

// ── icons (inline SVGs to avoid extra deps) ─────────────────────────────────
const IconUsers = () => (
  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)
const IconCalendar = () => (
  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
)
const IconCheck = () => (
  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" /><polyline points="9 12 11 14 15 10" />
  </svg>
)
const IconMsg = () => (
  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
)
const IconSearch = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)
const IconFilter = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
)
const IconPlus = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)
const IconBell = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
)
const IconArrow = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 17 7 17 17" />
  </svg>
)
const IconMail = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
)
const IconPhone = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.39 2 2 0 0 1 3.59 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.78a16 16 0 0 0 6 6l.86-.86a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16z" />
  </svg>
)
const IconChevron = ({ open }: { open: boolean }) => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
    style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
)
const IconUpload = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" />
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
  </svg>
)
const IconX = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

// ── status badge colours ─────────────────────────────────────────────────────
const statusStyle: Record<string, { border: string; color: string }> = {
  scheduled:   { border: '1px solid #6366f1', color: '#818cf8' },
  feedback:    { border: '1px solid #f59e0b', color: '#fbbf24' },
  interviewed: { border: '1px solid #f97316', color: '#fb923c' },
  pending:     { border: '1px solid #6b7280', color: '#9ca3af' },
  hired:       { border: '1px solid #22c55e', color: '#4ade80' },
}

// shared Avatar + StatCard imported from components

// ── add candidate modal ──────────────────────────────────────────────────────
const AddCandidateModal = ({ onClose }: { onClose: () => void }) => {
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [file, setFile] = useState<File | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }))

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }} onClick={onClose}>
      <div style={{
        background: '#1e1f2e', borderRadius: 16, padding: 32, width: '100%', maxWidth: 480,
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)', position: 'relative',
      }} onClick={(e) => e.stopPropagation()}>
        {/* header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9' }}>Add Candidate</div>
            <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>Fill in the details below</div>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: 8,
            width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#94a3b8',
          }}><IconX /></button>
        </div>

        {/* fields */}
        {([
          { label: 'Full Name', key: 'name', type: 'text', placeholder: 'e.g. Sarah Jenkins' },
          { label: 'Email', key: 'email', type: 'email', placeholder: 'sarah@example.com' },
          { label: 'Phone Number', key: 'phone', type: 'tel', placeholder: '+1 (555) 000-0000' },
        ] as const).map(({ label, key, type, placeholder }) => (
          <div key={key} style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#94a3b8', marginBottom: 6 }}>{label}</label>
            <input
              type={type}
              placeholder={placeholder}
              value={form[key]}
              onChange={set(key)}
              style={{
                width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10, padding: '10px 14px', color: '#f1f5f9', fontSize: 14,
                outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>
        ))}

        {/* resume upload */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#94a3b8', marginBottom: 6 }}>Resume</label>
          <div
            onClick={() => fileRef.current?.click()}
            style={{
              border: '1.5px dashed rgba(99,102,241,0.5)', borderRadius: 10, padding: '20px 16px',
              textAlign: 'center', cursor: 'pointer', background: 'rgba(99,102,241,0.05)',
              transition: 'border-color 0.15s',
            }}
          >
            <div style={{ color: '#6366f1', marginBottom: 6, display: 'flex', justifyContent: 'center' }}><IconUpload /></div>
            <div style={{ fontSize: 13, color: '#94a3b8' }}>
              {file ? <span style={{ color: '#818cf8' }}>{file.name}</span> : <><span style={{ color: '#818cf8', fontWeight: 600 }}>Click to upload</span> or drag & drop</>}
            </div>
            <div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>PDF, DOC, DOCX up to 10MB</div>
          </div>
          <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }}
            onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </div>

        {/* actions */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: '11px 0', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)',
            background: 'transparent', color: '#94a3b8', fontSize: 14, fontWeight: 600, cursor: 'pointer',
          }}>Cancel</button>
          <button style={{
            flex: 1, padding: '11px 0', borderRadius: 10, border: 'none',
            background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff',
            fontSize: 14, fontWeight: 700, cursor: 'pointer',
          }}>Add Candidate</button>
        </div>
      </div>
    </div>
  )
}

// ── candidate detail panel ───────────────────────────────────────────────────
const DetailPanel = ({ candidate, onNavigate }: { candidate: (typeof recruiterCandidates)[0]; onNavigate: () => void }) => {
  const [skillsOpen, setSkillsOpen] = useState(true)
  const skills = ['React', 'TypeScript', 'Node.js', 'System Design', 'Cloud Ops']

  return (
    <div style={{
      width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 0,
    }}>
      {/* blue card with arrow */}
      <div style={{
        background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', borderRadius: 16, height: 90,
        display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', padding: 12, marginBottom: 0,
      }}>
        <button onClick={onNavigate} style={{
          width: 34, height: 34, borderRadius: 8, background: 'rgba(255,255,255,0.25)',
          border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: '#fff',
        }}><IconArrow /></button>
      </div>

      {/* info card */}
      <div style={{
        background: '#fff', borderRadius: '0 0 16px 16px', padding: '20px 20px 16px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
      }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: '#111827' }}>{candidate.name}</div>
        <div style={{ fontSize: 13, color: '#6366f1', fontWeight: 500, marginBottom: 14 }}>{candidate.role}</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#6b7280', fontSize: 13 }}>
            <IconMail />{candidate.email}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#6b7280', fontSize: 13 }}>
            <IconPhone />+1 (555) 0912
          </div>
        </div>

        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 14 }}>
          <button onClick={() => setSkillsOpen((o) => !o)} style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            fontSize: 14, fontWeight: 600, color: '#374151',
          }}>
            Key Skills <IconChevron open={skillsOpen} />
          </button>
          {skillsOpen && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
              {skills.map((s) => (
                <span key={s} style={{
                  fontSize: 12, fontWeight: 500, color: '#6366f1',
                  background: '#eef2ff', borderRadius: 6, padding: '3px 9px',
                }}>{s}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── main page ────────────────────────────────────────────────────────────────
export const RecruiterDashboardPage = () => {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selected, setSelected] = useState(recruiterCandidates[0] ?? null)

  const filtered = useMemo(
    () => recruiterCandidates.filter((c) =>
      [c.name, c.email, c.role].join(' ').toLowerCase().includes(query.toLowerCase()),
    ),
    [query],
  )

  const stats = [
    { icon: <IconUsers />, label: 'Total Candidates', value: 1248 },
    { icon: <IconCalendar />, label: 'Interviews This Week', value: 42 },
    { icon: <IconCheck />, label: 'Pending Decisions', value: 12 },
    { icon: <IconMsg />, label: 'Feedbacks Received', value: 89 },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#0f1017', fontFamily: 'Inter,system-ui,sans-serif' }}>

      {/* ── top nav ─────────────────────────────────────────────────────── */}
      <nav style={{
        background: '#1a1b2e', borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', padding: '0 24px', height: 60, gap: 16, position: 'sticky', top: 0, zIndex: 100,
      }}>
        {/* logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginRight: 12 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9, background: '#6366f1',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 16,
          }}>R</div>
          <span style={{ fontWeight: 700, fontSize: 15, color: '#f1f5f9' }}>Recruitment Dashboard</span>
        </div>

        {/* search */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '7px 14px', flex: '0 0 200px',
        }}>
          <IconSearch />
          <input placeholder="Search candidate" style={{
            background: 'none', border: 'none', outline: 'none', fontSize: 13, color: '#94a3b8', width: '100%',
          }} />
        </div>

        {/* nav links */}
        <div style={{ display: 'flex', gap: 2, flex: 1 }}>
          {[
            { label: 'Overview', route: ROUTES.RECRUITER_DASHBOARD },
            { label: 'Candidates', route: ROUTES.RECRUITER_CANDIDATES },
            { label: 'Schedule', route: ROUTES.RECRUITER_SCHEDULE },
          ].map(({ label, route }) => (
            <button key={label} onClick={() => navigate(route)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '6px 14px', borderRadius: 8, fontSize: 14, fontWeight: 500,
              color: label === 'Overview' ? '#fff' : '#94a3b8',
              background: label === 'Overview' ? 'rgba(255,255,255,0.08)' : 'transparent',
            }}>{label}</button>
          ))}
        </div>

        {/* right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => setShowModal(true)} style={{
            display: 'flex', alignItems: 'center', gap: 7, padding: '8px 18px', borderRadius: 10,
            background: '#111827', border: '1px solid rgba(255,255,255,0.15)', color: '#f1f5f9',
            fontSize: 14, fontWeight: 600, cursor: 'pointer',
          }}><IconPlus /> Add Candidate</button>
          <button style={{
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 8, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#94a3b8', position: 'relative',
          }}>
            <IconBell />
            <span style={{
              position: 'absolute', top: 6, right: 6, width: 7, height: 7,
              background: '#6366f1', borderRadius: '50%', border: '1.5px solid #1a1b2e',
            }} />
          </button>
          <Avatar name="Admin User" size={34} />
        </div>
      </nav>

      {/* ── body ─────────────────────────────────────────────────────────── */}
      <div style={{ padding: '28px 28px 40px' }}>

        {/* breadcrumb + title */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, color: '#64748b', marginBottom: 6 }}>Home › Overview</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#f1f5f9', margin: 0 }}>Recruitment Overview</h1>
        </div>

        {/* stat cards */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
          {stats.map((s) => <StatCard key={s.label} {...s} />)}
        </div>

        {/* lower: table + detail panel */}
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>

          {/* active candidates table */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, color: '#f1f5f9' }}>Active Candidates</div>
                <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>Managing {filtered.length} profiles in current view</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '7px 14px',
                }}>
                  <IconSearch />
                  <input
                    placeholder="Search..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    style={{ background: 'none', border: 'none', outline: 'none', fontSize: 13, color: '#94a3b8', width: 140 }}
                  />
                </div>
                <button style={{
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 10, width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: '#94a3b8',
                }}><IconFilter /></button>
              </div>
            </div>

            {/* table */}
            <div style={{
              background: 'rgba(255,255,255,0.03)', borderRadius: 14,
              border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden',
            }}>
              {/* header */}
              <div style={{
                display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 80px',
                padding: '10px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}>
                {['Candidate','Applied Role','Status','Added'].map((h) => (
                  <div key={h} style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</div>
                ))}
              </div>

              {/* rows */}
              {filtered.map((c, i) => (
                <div
                  key={c.id}
                  onClick={() => setSelected(c)}
                  style={{
                    display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 80px',
                    padding: '14px 20px', alignItems: 'center',
                    borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                    cursor: 'pointer',
                    background: selected?.id === c.id ? 'rgba(99,102,241,0.07)' : 'transparent',
                    transition: 'background 0.15s',
                  }}
                >
                  {/* candidate */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Avatar name={c.name} size={36} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: '#f1f5f9' }}>{c.name}</div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>{c.email}</div>
                    </div>
                  </div>

                  {/* role */}
                  <div>
                    <div style={{ fontSize: 13, color: '#e2e8f0' }}>{c.role}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>{c.department ?? 'Engineering'}</div>
                  </div>

                  {/* status */}
                  <div>
                    <span style={{
                      fontSize: 12, fontWeight: 500, padding: '4px 10px', borderRadius: 20,
                      ...(statusStyle[c.status?.toLowerCase() ?? ''] ?? statusStyle.pending),
                    }}>{c.status ?? 'pending'}</span>
                  </div>

                  {/* added */}
                  <div style={{ fontSize: 13, color: '#64748b' }}>{c.lastActivity}</div>
                </div>
              ))}
            </div>
          </div>

          {/* detail panel */}
          {selected && (
            <DetailPanel
              candidate={selected}
              onNavigate={() => navigate(`/recruit/candidates/${selected.id}`)}
            />
          )}
        </div>
      </div>

      {/* modal */}
      {showModal && <AddCandidateModal onClose={() => setShowModal(false)} />}
    </div>
  )
}