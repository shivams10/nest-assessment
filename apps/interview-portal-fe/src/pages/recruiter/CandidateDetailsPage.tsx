import { useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import { recruiterCandidates, candidateReviews } from './recruiterCandidateData'
import { ROUTES } from '@/constants/routes'
import { Avatar } from './components/Avatar'

// ── tiny inline icons ────────────────────────────────────────────────────────
const I = {
  Back: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>,
  Mail: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  Phone: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.39 2 2 0 0 1 3.59 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.78a16 16 0 0 0 6 6l.86-.86a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16z"/></svg>,
  Globe: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  Linkedin: () => <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>,
  Star: () => <svg width="14" height="14" fill="#6366f1" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  Cal: () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Msg: () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  Check: () => <svg width="18" height="18" fill="none" stroke="#22c55e" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#22c55e" fill="rgba(34,197,94,0.15)"/><polyline points="9 12 11 14 15 10"/></svg>,
  Clock: () => <svg width="18" height="18" fill="none" stroke="#6366f1" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#6366f1" fill="rgba(99,102,241,0.15)"/><polyline points="12 6 12 12 16 14"/></svg>,
  Next: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 8 16 12 12 16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>,
  Reject: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>,
  KeyStar: () => <svg width="16" height="16" fill="none" stroke="#f59e0b" strokeWidth="2" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  Msg2: () => <svg width="16" height="16" fill="none" stroke="#6366f1" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
}

// shared Avatar component used above

const ContactRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
    <div style={{
      width: 36, height: 36, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', flexShrink: 0,
    }}>{icon}</div>
    <div>
      <div style={{ fontSize: 11, color: '#64748b', marginBottom: 1 }}>{label}</div>
      <div style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 500 }}>{value}</div>
    </div>
  </div>
)

export const CandidateDetailsPage = () => {
  const { candidateId } = useParams()
  const navigate = useNavigate()
  const [comment, setComment] = useState('')

  const candidate = useMemo(() => recruiterCandidates.find((c) => c.id === candidateId), [candidateId])
  const reviews = candidateId ? (candidateReviews[candidateId] ?? []) : []

  if (!candidate) {
    return (
      <div style={{ padding: 40, color: '#f1f5f9', fontFamily: 'Inter,system-ui,sans-serif' }}>
        Candidate not found.
      </div>
    )
  }

  const skills = ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'GraphQL', 'Node.js', 'AWS', 'Testing Library']
  const progress = 80

  return (
    <div style={{ minHeight: '100vh', background: '#0f1017', fontFamily: 'Inter,system-ui,sans-serif', color: '#f1f5f9' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 24px' }}>

        {/* back + actions row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <button onClick={() => navigate(ROUTES.RECRUITER_CANDIDATES ?? ROUTES.RECRUITER_DASHBOARD)} style={{
            display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none',
            color: '#94a3b8', fontSize: 13, cursor: 'pointer', padding: 0,
          }}><I.Back /> Back to Candidate List</button>

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => navigate(`/recruit/candidates/${candidate.id}/schedule`)} style={{
              display: 'flex', alignItems: 'center', gap: 7, padding: '8px 18px', borderRadius: 10,
              background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: '#f1f5f9',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}><I.Cal /> Reschedule</button>
            <button style={{
              display: 'flex', alignItems: 'center', gap: 7, padding: '8px 18px', borderRadius: 10,
              background: '#6366f1', border: 'none', color: '#fff',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}><I.Msg /> Send Message</button>
          </div>
        </div>

        {/* name + badge */}
        <div style={{ marginBottom: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
            <h1 style={{ fontSize: 32, fontWeight: 800, color: '#6366f1', margin: 0 }}>{candidate.name}</h1>
            <span style={{
              fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 20,
              border: '1px solid #6366f1', color: '#818cf8', background: 'rgba(99,102,241,0.1)',
            }}>Active: Final Interview</span>
          </div>
          <div style={{ fontSize: 14, color: '#94a3b8' }}>
            {candidate.role} Application • <span style={{ color: '#64748b' }}>#CAND-{Math.floor(90000 + Math.random() * 9999)}</span>
          </div>
        </div>

        {/* main grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 28 }}>

          {/* ── left: profile card ── */}
          <div style={{
            background: 'rgba(255,255,255,0.03)', borderRadius: 16,
            border: '1px solid rgba(255,255,255,0.07)', padding: 28,
          }}>
            {/* avatar + name */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.07)', marginBottom: 24 }}>
              <Avatar name={candidate.name} size={90} />
              <div style={{ marginTop: 14, fontWeight: 700, fontSize: 18 }}>{candidate.name}</div>
              <div style={{ fontSize: 13, color: '#64748b', marginTop: 3 }}>{candidate.location ?? 'San Francisco, CA'}</div>
            </div>

            {/* contact rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <ContactRow icon={<I.Mail />} label="Email Address" value={candidate.email} />
              <ContactRow icon={<I.Phone />} label="Phone Number" value="+1 (555) 012-3456" />
              <ContactRow icon={<I.Globe />} label="Portfolio" value="arivera.dev" />
              <ContactRow icon={<I.Linkedin />} label="LinkedIn" value={`linkedin.com/in/${candidate.name.split(' ')[0].toLowerCase()}`} />
            </div>
          </div>

          {/* ── right column ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* current status card */}
            <div style={{
              background: 'rgba(255,255,255,0.03)', borderRadius: 16,
              border: '1px solid rgba(255,255,255,0.07)', padding: 24,
            }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', marginBottom: 18, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Current Status</div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 22 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <I.Check />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>Tech Interview Cleared</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>May 12, 2024 • Score: 9.2/10</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <I.Clock />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>Final Leadership Round</div>
                    <div style={{ fontSize: 12, color: '#6366f1' }}>In Progress • May 14, 2024</div>
                  </div>
                </div>
              </div>

              {/* progress bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', color: '#94a3b8' }}>OVERALL PROGRESS</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8' }}>{progress}%</span>
                </div>
                <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg,#6366f1,#8b5cf6)', borderRadius: 3 }} />
                </div>
              </div>
            </div>

            {/* quick decisions */}
            <div style={{
              background: 'rgba(255,255,255,0.03)', borderRadius: 16,
              border: '1px solid rgba(255,255,255,0.07)', padding: 24,
            }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Quick Decisions</div>
              <button style={{
                width: '100%', padding: '13px 0', borderRadius: 10, border: 'none',
                background: '#16a34a', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10,
              }}><I.Next /> Move to Next Round</button>
              <button style={{
                width: '100%', padding: '13px 0', borderRadius: 10, border: 'none',
                background: '#dc2626', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}><I.Reject /> Reject Candidate</button>
            </div>
          </div>
        </div>

        {/* key expertise */}
        <div style={{
          background: 'rgba(255,255,255,0.03)', borderRadius: 16,
          border: '1px solid rgba(255,255,255,0.07)', padding: 24, marginTop: 20,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <I.KeyStar />
            <span style={{ fontWeight: 700, fontSize: 15 }}>Key Expertise</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {skills.map((s) => (
              <span key={s} style={{
                fontSize: 13, fontWeight: 500, padding: '5px 14px', borderRadius: 20,
                background: '#6366f1', color: '#fff',
              }}>{s}</span>
            ))}
          </div>
        </div>

        {/* interviewer feedback */}
        {reviews.length > 0 && (
          <div style={{ marginTop: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <I.Msg2 />
                <span style={{ fontWeight: 700, fontSize: 16, color: '#6366f1' }}>Interviewer Feedback</span>
              </div>
              <button style={{
                padding: '8px 18px', borderRadius: 10, background: '#6366f1', border: 'none',
                color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}>Add Your Feedback</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
              {reviews.map((r) => (
                <div key={r.id} style={{
                  background: 'rgba(255,255,255,0.03)', borderRadius: 14,
                  border: '1px solid rgba(255,255,255,0.07)', padding: 20,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar name={r.author} size={36} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{r.author}</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>{r.role} • {r.date}</div>
                      </div>
                    </div>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                      background: '#6366f1', color: '#fff',
                    }}>Strong Hire</span>
                  </div>
                  <div style={{ display: 'flex', gap: 2, marginBottom: 10 }}>
                    {[1,2,3,4,5].map((n) => <I.Star key={n} />)}
                  </div>
                  <p style={{ fontSize: 13, color: '#94a3b8', fontStyle: 'italic', margin: '0 0 14px' }}>"{r.message}"</p>
                  <div style={{ display: 'flex', gap: 16 }}>
                    {['TECH DEPTH','CULTURE FIT'].map((label) => (
                      <div key={label} style={{ flex: 1 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b', marginBottom: 4, letterSpacing: '0.05em' }}>{label}</div>
                        <div style={{ height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: label === 'TECH DEPTH' ? '85%' : '70%', background: '#6366f1', borderRadius: 2 }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* comments */}
            <div style={{ marginTop: 24 }}>
              <div style={{ fontSize: 14, color: '#64748b', marginBottom: 12 }}>Comments</div>
              <textarea
                rows={3}
                placeholder="Conducted by Marcus Thorne • April 28"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                style={{
                  width: '100%', background: '#fff', borderRadius: 12, border: 'none',
                  padding: '14px 16px', fontSize: 13, color: '#374151', resize: 'none',
                  outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}