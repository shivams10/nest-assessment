import { useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import { recruiterCandidates } from './recruiterCandidateData'
import { ROUTES } from '@/constants/routes'
import { Avatar } from './components/Avatar'

// ── icons ────────────────────────────────────────────────────────────────────
const I = {
  Users: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Search: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Cal: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Clock: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Prev: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>,
  Next: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>,
  Pin: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  Doc: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  Info: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
  Video: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>,
  Ext: () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>,
  Building: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="1"/><path d="M9 22V12h6v10M9 7h1M14 7h1M9 12h1M14 12h1"/></svg>,
  Wifi: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>,
}

const INTERVIEWERS = [
  { id: '1', name: 'Alex Rivera',    title: 'Engineering Manager' },
  { id: '2', name: 'Sarah Chen',     title: 'Senior Frontend Lead' },
  { id: '3', name: 'Marcus Wright',  title: 'VP of Product' },
  { id: '4', name: 'Elena Rodriguez',title: 'Technical Recruiter' },
]

const SLOTS = ['09:00 AM','10:30 AM','01:00 PM','02:30 PM','04:00 PM']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAYS   = ['MO','TU','WE','TH','FR','SA','SU']

// shared Avatar component imported above

function buildCalendar(year: number, month: number) {
  const first = new Date(year, month, 1).getDay() // 0=Sun
  const offset = first === 0 ? 6 : first - 1      // shift to Mon-start
  const days = new Date(year, month + 1, 0).getDate()
  return { offset, days }
}

export const ScheduleInterviewPage = () => {
  const { candidateId } = useParams()
  const navigate = useNavigate()

  const candidate = useMemo(() => recruiterCandidates.find(c => c.id === candidateId), [candidateId])

  const today = new Date()
  const [viewYear,  setViewYear]  = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [selectedDay,  setSelectedDay]  = useState<number | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<string | null>('10:30 AM')
  const [selectedIV,   setSelectedIV]   = useState<string>('2')
  const [ivSearch,     setIvSearch]     = useState('')
  const [medium, setMedium]   = useState<'virtual' | 'room' | ''>('')
  const [ivType,  setIvType]  = useState('')
  const [notes,   setNotes]   = useState('')

  const { offset, days } = buildCalendar(viewYear, viewMonth)

  const prevMonth = () => { if (viewMonth === 0) { setViewYear(y => y-1); setViewMonth(11) } else setViewMonth(m => m-1) }
  const nextMonth = () => { if (viewMonth === 11) { setViewYear(y => y+1); setViewMonth(0) } else setViewMonth(m => m+1) }

  const filteredIV = INTERVIEWERS.filter(iv =>
    iv.name.toLowerCase().includes(ivSearch.toLowerCase()) ||
    iv.title.toLowerCase().includes(ivSearch.toLowerCase())
  )

  const handleSchedule = () => navigate(`/recruit/candidates/${candidate?.id}`)

  if (!candidate) return (
    <div style={{ padding: 40, color: '#f1f5f9', fontFamily: 'Inter,system-ui,sans-serif' }}>No candidate selected.</div>
  )

  const s: React.CSSProperties = {}
  const inp = {
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10, padding: '12px 16px', color: '#f1f5f9', fontSize: 14,
    outline: 'none', width: '100%', boxSizing: 'border-box' as const,
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f1017', fontFamily: 'Inter,system-ui,sans-serif', color: '#f1f5f9' }}>

      {/* purple hero header */}
      <div style={{ background: 'linear-gradient(135deg,#4f52d3,#6366f1)', padding: '32px 32px 28px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 8px' }}>Schedule Interview</h1>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>{candidate.name}</span>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(255,255,255,0.5)', display: 'inline-block' }} />
          <span>{candidate.role}</span>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px 120px' }}>

        {/* ── select interviewer ── */}
        <section style={{ marginBottom: 36 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ color: '#6366f1' }}><I.Users /></span>
              <span style={{ fontWeight: 700, fontSize: 16 }}>Select Interviewer</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '8px 14px' }}>
              <I.Search />
              <input placeholder="Search team..." value={ivSearch} onChange={e => setIvSearch(e.target.value)}
                style={{ background: 'none', border: 'none', outline: 'none', color: '#94a3b8', fontSize: 13, width: 140 }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {filteredIV.map(iv => (
              <div key={iv.id} onClick={() => setSelectedIV(iv.id)} style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 12, cursor: 'pointer',
                background: selectedIV === iv.id ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.03)',
                border: selectedIV === iv.id ? '1.5px solid #6366f1' : '1px solid rgba(255,255,255,0.07)',
                transition: 'all 0.15s',
              }}>
                <Avatar name={iv.name} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: selectedIV === iv.id ? '#818cf8' : '#f1f5f9' }}>{iv.name}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{iv.title}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginBottom: 36 }} />

        {/* ── calendar + slots ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginBottom: 36 }}>

          {/* calendar */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <span style={{ color: '#6366f1' }}><I.Cal /></span>
              <span style={{ fontWeight: 700, fontSize: 16 }}>Select Date</span>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                <span style={{ fontWeight: 700, fontSize: 15 }}>{MONTHS[viewMonth]} {viewYear}</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[{ fn: prevMonth, icon: <I.Prev /> }, { fn: nextMonth, icon: <I.Next /> }].map(({ fn, icon }, i) => (
                    <button key={i} onClick={fn} style={{
                      background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 7,
                      width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', color: '#94a3b8',
                    }}>{icon}</button>
                  ))}
                </div>
              </div>

              {/* day headers */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2, marginBottom: 8 }}>
                {DAYS.map(d => <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#64748b', padding: '4px 0' }}>{d}</div>)}
              </div>

              {/* day cells */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2 }}>
                {Array.from({ length: offset }).map((_, i) => <div key={'e'+i} />)}
                {Array.from({ length: days }).map((_, i) => {
                  const d = i + 1
                  const isToday = d === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear()
                  const isSel = d === selectedDay
                  return (
                    <button key={d} onClick={() => setSelectedDay(d)} style={{
                      width: '100%', aspectRatio: '1', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13,
                      background: isSel ? '#6366f1' : isToday ? 'rgba(99,102,241,0.2)' : 'transparent',
                      color: isSel ? '#fff' : isToday ? '#818cf8' : '#e2e8f0',
                      fontWeight: isSel || isToday ? 700 : 400,
                    }}>{d}</button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* slots */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <span style={{ color: '#6366f1' }}><I.Clock /></span>
              <span style={{ fontWeight: 700, fontSize: 16 }}>Available Slots</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {SLOTS.map(slot => (
                <button key={slot} onClick={() => setSelectedSlot(slot)} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 18px', borderRadius: 12, border: 'none', cursor: 'pointer',
                  background: selectedSlot === slot ? '#6366f1' : 'rgba(255,255,255,0.04)',
                  color: '#f1f5f9', transition: 'background 0.15s',
                }}>
                  <span style={{ fontWeight: 600, fontSize: 15 }}>{slot}</span>
                  <span style={{
                    fontSize: 12, fontWeight: 500, padding: '3px 10px', borderRadius: 20,
                    background: selectedSlot === slot ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)',
                  }}>Available</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginBottom: 36 }} />

        {/* ── location / medium ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 28 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <span style={{ color: '#6366f1' }}><I.Pin /></span>
              <span style={{ fontWeight: 700, fontSize: 15 }}>Location / Medium</span>
            </div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
              {([
                { key: 'virtual', label: 'Virtually',    icon: <I.Wifi /> },
                { key: 'room',    label: 'Select Room',  icon: <I.Building /> },
              ] as const).map(({ key, label, icon }) => (
                <button key={key} onClick={() => setMedium(key)} style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '11px 0', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600,
                  border: medium === key ? '1.5px solid #6366f1' : '1px solid rgba(255,255,255,0.1)',
                  background: medium === key ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.04)',
                  color: medium === key ? '#818cf8' : '#94a3b8', transition: 'all 0.15s',
                }}>{icon}{label}</button>
              ))}
            </div>
            {medium === 'room' && (
              <input placeholder="Enter room name or number" style={inp} />
            )}
            {medium === 'virtual' && (
              <input defaultValue="Google Meet" style={inp} />
            )}
            {medium === '' && (
              <input placeholder="Select an option above" style={{ ...inp, color: '#475569' }} readOnly />
            )}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <span style={{ color: '#6366f1' }}><I.Doc /></span>
              <span style={{ fontWeight: 700, fontSize: 15 }}>Interview Type</span>
            </div>
            <select value={ivType} onChange={e => setIvType(e.target.value)} style={{
              ...inp, appearance: 'none' as const, cursor: 'pointer',
            }}>
              <option value="">Select type…</option>
              <option value="technical">Technical</option>
              <option value="behavioral">Behavioral</option>
              <option value="system-design">System Design</option>
              <option value="culture-fit">Culture Fit</option>
              <option value="final">Final Round</option>
            </select>
          </div>
        </div>

        {/* ── additional notes ── */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ color: '#6366f1' }}><I.Info /></span>
            <span style={{ fontWeight: 700, fontSize: 15 }}>Additional Notes (Optional)</span>
          </div>
          <textarea rows={4} placeholder="Paste interview guidelines or specific instructions for the candidate here..."
            value={notes} onChange={e => setNotes(e.target.value)}
            style={{ ...inp, resize: 'none' }} />
          <div style={{ fontSize: 12, color: '#475569', marginTop: 6, fontStyle: 'italic' }}>
            These notes will be included in the email invitation sent to the candidate.
          </div>
        </div>

        {/* google meet info box */}
        {(medium === 'virtual' || medium === '') && (
          <div style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 12, padding: '18px 20px',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <span style={{ color: '#94a3b8', marginTop: 2 }}><I.Video /></span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>Google Meet Integration Active</span>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
                    border: '1px solid rgba(255,255,255,0.15)', color: '#94a3b8',
                  }}>Auto-Generated</span>
                </div>
                <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 12px', lineHeight: 1.6 }}>
                  The calendar invitation will automatically include a secure video conferencing link. Both the interviewer and candidate will receive a calendar invite with the link.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: '10px 14px' }}>
                  <span style={{ flex: 1, fontSize: 13, color: '#94a3b8' }}>meet.google.com/xyz-abcd-efg</span>
                  <I.Ext />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── sticky footer ── */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: '#181923', borderTop: '1px solid rgba(255,255,255,0.07)',
        padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 200,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#64748b', fontSize: 12, fontWeight: 700, letterSpacing: '0.06em' }}>
          <I.Clock /><span>ESTIMATED DURATION: 60 MINUTES</span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => navigate(`/recruit/candidates/${candidate.id}`)} style={{
            padding: '10px 24px', borderRadius: 10, background: 'transparent',
            border: 'none', color: '#f1f5f9', fontSize: 14, fontWeight: 600, cursor: 'pointer',
          }}>Cancel</button>
          <button onClick={handleSchedule} style={{
            padding: '10px 28px', borderRadius: 10, background: '#6366f1',
            border: 'none', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer',
          }}>Create Calendar Invite</button>
        </div>
      </div>
    </div>
  )
}