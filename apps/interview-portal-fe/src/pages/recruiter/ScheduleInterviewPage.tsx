import { useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import { recruiterCandidates } from './recruiterCandidateData'
import { ROUTES } from '@/constants/routes'

const DS = {
  bg:         '#F8FAFC',
  surface:    '#FFFFFF',
  subtle:     '#F1F5F9',
  border:     '#E2E8F0',
  borderStr:  '#CBD5E1',
  textPri:    '#0F172A',
  textSec:    '#475569',
  textMuted:  '#94A3B8',
  primary:    '#4F46E5',
  primaryHov: '#4338CA',
  primaryLt:  '#EEF2FF',
  primaryBdr: '#C7D2FE',
  primaryTxt: '#4338CA',
}

const I = {
  Users:    () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Search:   () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Cal:      () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Clock:    () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Prev:     () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>,
  Next:     () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>,
  Pin:      () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  Doc:      () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  Info:     () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
  Video:    () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>,
  Ext:      () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>,
  Building: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="1"/><path d="M9 22V12h6v10M9 7h1M14 7h1M9 12h1M14 12h1"/></svg>,
  Wifi:     () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>,
}

const INTERVIEWERS = [
  { id: '1', name: 'Alex Rivera',     title: 'Engineering Manager' },
  { id: '2', name: 'Sarah Chen',      title: 'Senior Frontend Lead' },
  { id: '3', name: 'Marcus Wright',   title: 'VP of Product' },
  { id: '4', name: 'Elena Rodriguez', title: 'Technical Recruiter' },
]
const SLOTS  = ['09:00 AM','10:30 AM','01:00 PM','02:30 PM','04:00 PM']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAYS   = ['MO','TU','WE','TH','FR','SA','SU']

const Avatar = ({ name, size = 36 }: { name: string; size?: number }) => {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: DS.primaryLt, color: DS.primaryTxt,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 600, fontSize: size * 0.36, flexShrink: 0,
    }}>{initials}</div>
  )
}

function buildCalendar(year: number, month: number) {
  const first = new Date(year, month, 1).getDay()
  const offset = first === 0 ? 6 : first - 1
  const days = new Date(year, month + 1, 0).getDate()
  return { offset, days }
}

const SectionLabel = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
    <span style={{ color: DS.primary }}>{icon}</span>
    <span style={{ fontWeight: 600, fontSize: 15, color: DS.textPri }}>{text}</span>
  </div>
)

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
  const [medium, setMedium] = useState<'virtual' | 'room' | ''>('')
  const [ivType,  setIvType]  = useState('')
  const [notes,   setNotes]   = useState('')

  const { offset, days } = buildCalendar(viewYear, viewMonth)
  const prevMonth = () => { if (viewMonth === 0) { setViewYear(y => y-1); setViewMonth(11) } else setViewMonth(m => m-1) }
  const nextMonth = () => { if (viewMonth === 11) { setViewYear(y => y+1); setViewMonth(0) } else setViewMonth(m => m+1) }

  const filteredIV = INTERVIEWERS.filter(iv =>
    iv.name.toLowerCase().includes(ivSearch.toLowerCase()) ||
    iv.title.toLowerCase().includes(ivSearch.toLowerCase())
  )

  if (!candidate) return (
    <div style={{ padding: 40, fontFamily: 'Inter,system-ui,sans-serif', color: DS.textSec }}>No candidate selected.</div>
  )

  const inp: React.CSSProperties = {
    width: '100%', height: 36, border: `1px solid ${DS.border}`, borderRadius: 6,
    padding: '0 12px', fontSize: 14, color: DS.textPri, outline: 'none',
    background: DS.surface, boxSizing: 'border-box',
  }
  const card: React.CSSProperties = {
    background: DS.surface, border: `1px solid ${DS.border}`, borderRadius: 8, padding: '20px 24px',
  }

  return (
    <div style={{ minHeight: '100vh', background: DS.bg, fontFamily: 'Inter,system-ui,sans-serif', color: DS.textPri }}>

      {/* ── Top Bar ── */}
      <div style={{
        height: 56, background: DS.surface, borderBottom: `1px solid ${DS.border}`,
        display: 'flex', alignItems: 'center', padding: '0 24px', position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ fontSize: 20, fontWeight: 600, color: DS.textPri }}>Schedule Interview</div>
      </div>

      {/* ── Indigo hero band ── */}
      <div style={{ background: DS.primary, padding: '24px 24px 20px' }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: '#fff', margin: '0 0 6px' }}>Schedule Interview</h2>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>{candidate.name}</span>
          <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,255,255,0.5)', display: 'inline-block' }} />
          <span>{candidate.role}</span>
        </div>
      </div>

      <div style={{ maxWidth: 1024, margin: '0 auto', padding: '24px 24px 120px' }}>

        {/* ── Select Interviewer ── */}
        <div style={{ ...card, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <SectionLabel icon={<I.Users />} text="Select Interviewer" />
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, height: 36,
              border: `1px solid ${DS.border}`, borderRadius: 6, padding: '0 12px', background: DS.subtle,
            }}>
              <I.Search />
              <input placeholder="Search team..." value={ivSearch} onChange={e => setIvSearch(e.target.value)}
                style={{ background: 'none', border: 'none', outline: 'none', fontSize: 13, color: DS.textPri, width: 130 }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {filteredIV.map(iv => (
              <div key={iv.id} onClick={() => setSelectedIV(iv.id)} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 8, cursor: 'pointer',
                background: selectedIV === iv.id ? DS.primaryLt : DS.bg,
                border: selectedIV === iv.id ? `1.5px solid ${DS.primaryBdr}` : `1px solid ${DS.border}`,
                transition: 'all 0.12s',
              }}>
                <Avatar name={iv.name} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: selectedIV === iv.id ? DS.primaryTxt : DS.textPri }}>{iv.name}</div>
                  <div style={{ fontSize: 12, color: DS.textMuted }}>{iv.title}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Calendar + Slots ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

          {/* calendar */}
          <div style={card}>
            <SectionLabel icon={<I.Cal />} text="Select Date" />
            <div style={{
              border: `1px solid ${DS.border}`, borderRadius: 8, padding: 16, background: DS.bg,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <span style={{ fontWeight: 600, fontSize: 14, color: DS.textPri }}>{MONTHS[viewMonth]} {viewYear}</span>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[{ fn: prevMonth, icon: <I.Prev /> }, { fn: nextMonth, icon: <I.Next /> }].map(({ fn, icon }, i) => (
                    <button key={i} onClick={fn} style={{
                      width: 28, height: 28, borderRadius: 6, border: `1px solid ${DS.border}`,
                      background: DS.surface, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', color: DS.textSec,
                    }}>{icon}</button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2, marginBottom: 6 }}>
                {DAYS.map(d => (
                  <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 500, color: DS.textMuted, padding: '3px 0' }}>{d}</div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2 }}>
                {Array.from({ length: offset }).map((_, i) => <div key={'e'+i} />)}
                {Array.from({ length: days }).map((_, i) => {
                  const d = i + 1
                  const isToday = d === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear()
                  const isSel = d === selectedDay
                  return (
                    <button key={d} onClick={() => setSelectedDay(d)} style={{
                      width: '100%', aspectRatio: '1', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13,
                      background: isSel ? DS.primary : isToday ? DS.primaryLt : 'transparent',
                      color: isSel ? '#fff' : isToday ? DS.primaryTxt : DS.textSec,
                      fontWeight: isSel || isToday ? 600 : 400,
                      transition: 'background 0.1s',
                    }}>{d}</button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* available slots */}
          <div style={card}>
            <SectionLabel icon={<I.Clock />} text="Available Slots" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {SLOTS.map(slot => (
                <button key={slot} onClick={() => setSelectedSlot(slot)} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0 16px', height: 44, borderRadius: 8, cursor: 'pointer',
                  border: selectedSlot === slot ? `1.5px solid ${DS.primaryBdr}` : `1px solid ${DS.border}`,
                  background: selectedSlot === slot ? DS.primaryLt : DS.surface,
                  transition: 'all 0.12s',
                }}>
                  <span style={{ fontWeight: 600, fontSize: 14, color: selectedSlot === slot ? DS.primaryTxt : DS.textPri }}>{slot}</span>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 9999,
                    background: selectedSlot === slot ? DS.primaryBdr : DS.subtle,
                    color: selectedSlot === slot ? DS.primaryTxt : DS.textMuted,
                  }}>Available</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Location / Interview Type ── */}
        <div style={{ ...card, marginBottom: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div>
              <SectionLabel icon={<I.Pin />} text="Location / Medium" />
              {/* toggle buttons */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                {([
                  { key: 'virtual', label: 'Virtually',   icon: <I.Wifi /> },
                  { key: 'room',    label: 'Select Room',  icon: <I.Building /> },
                ] as const).map(({ key, label, icon }) => (
                  <button key={key} onClick={() => setMedium(key)} style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    height: 36, borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 500,
                    border: medium === key ? `1.5px solid ${DS.primaryBdr}` : `1px solid ${DS.border}`,
                    background: medium === key ? DS.primaryLt : DS.surface,
                    color: medium === key ? DS.primaryTxt : DS.textSec,
                    transition: 'all 0.12s',
                  }}>{icon}{label}</button>
                ))}
              </div>
              {medium === 'room'    && <input placeholder="Enter room name or number" style={inp} />}
              {medium === 'virtual' && <input defaultValue="Google Meet" style={inp} />}
              {medium === ''        && <input placeholder="Select an option above" style={{ ...inp, color: DS.textMuted }} readOnly />}
            </div>

            <div>
              <SectionLabel icon={<I.Doc />} text="Interview Type" />
              <select value={ivType} onChange={e => setIvType(e.target.value)} style={{ ...inp, appearance: 'none', cursor: 'pointer' }}>
                <option value="">Select type…</option>
                <option value="technical">Technical</option>
                <option value="behavioral">Behavioral</option>
                <option value="system-design">System Design</option>
                <option value="culture-fit">Culture Fit</option>
                <option value="final">Final Round</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── Additional Notes ── */}
        <div style={{ ...card, marginBottom: 16 }}>
          <SectionLabel icon={<I.Info />} text="Additional Notes (Optional)" />
          <textarea rows={4} placeholder="Paste interview guidelines or specific instructions for the candidate here..."
            value={notes} onChange={e => setNotes(e.target.value)}
            style={{
              width: '100%', border: `1px solid ${DS.border}`, borderRadius: 6,
              padding: '10px 12px', fontSize: 13, color: DS.textSec, resize: 'none',
              outline: 'none', background: DS.subtle, boxSizing: 'border-box',
            }} />
          <div style={{ fontSize: 12, color: DS.textMuted, marginTop: 6, fontStyle: 'italic' }}>
            These notes will be included in the email invitation sent to the candidate.
          </div>
        </div>

        {/* ── Google Meet info ── */}
        {medium === 'virtual' && (
          <div style={card}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <span style={{ color: DS.textSec, marginTop: 2 }}><I.Video /></span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontWeight: 600, fontSize: 14, color: DS.textPri }}>Google Meet Integration Active</span>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 9999,
                    border: `1px solid ${DS.border}`, color: DS.textMuted,
                  }}>Auto-Generated</span>
                </div>
                <p style={{ fontSize: 13, color: DS.textSec, margin: '0 0 12px', lineHeight: 1.6 }}>
                  The calendar invitation will automatically include a secure video conferencing link. Both the interviewer and candidate will receive a calendar invite with the link.
                </p>
                <div style={{
                  display: 'flex', alignItems: 'center', background: DS.subtle,
                  border: `1px solid ${DS.border}`, borderRadius: 6, padding: '8px 12px',
                }}>
                  <span style={{ flex: 1, fontSize: 13, color: DS.textSec }}>meet.google.com/xyz-abcd-efg</span>
                  <span style={{ color: DS.textMuted }}><I.Ext /></span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Sticky footer ── */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 200,
        background: DS.surface, borderTop: `1px solid ${DS.border}`,
        padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: DS.textMuted, fontSize: 12, fontWeight: 500, letterSpacing: '0.04em' }}>
          <I.Clock /><span>ESTIMATED DURATION: 60 MINUTES</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => navigate(`/recruit/candidates/${candidate.id}`)} style={{
            height: 36, padding: '0 16px', borderRadius: 6,
            border: `1px solid ${DS.border}`, background: DS.surface,
            color: DS.textPri, fontSize: 14, fontWeight: 500, cursor: 'pointer',
          }}>Cancel</button>
          <button onClick={() => navigate(`/recruit/candidates/${candidate.id}`)} style={{
            height: 36, padding: '0 16px', borderRadius: 6, border: 'none',
            background: DS.primary, color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer',
          }}>Create Calendar Invite</button>
        </div>
      </div>
    </div>
  )
}