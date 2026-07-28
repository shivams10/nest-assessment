import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

import { useCandidate } from '@/hooks/useCandidate'
import { useTeamMembers } from '@/hooks/useTeamMembers'
import { useRooms } from '@/hooks/useRooms'
import { useCheckAvailability } from '@/hooks/useCheckAvailability'
import { useCreateSession } from '@/hooks/useCreateSession'
import { LoadingSpinner } from '@/components/ui'

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
  errorBg:    '#FEF2F2',
  errorBdr:   '#FECACA',
  errorTxt:   '#B91C1C',
}

const I = {
  Users:    () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Search:   () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Cal:      () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Pin:      () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  Video:    () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>,
  Building: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="1"/><path d="M9 22V12h6v10M9 7h1M14 7h1M9 12h1M14 12h1"/></svg>,
  Wifi:     () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>,
}

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

const SectionLabel = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
    <span style={{ color: DS.primary }}>{icon}</span>
    <span style={{ fontWeight: 600, fontSize: 15, color: DS.textPri }}>{text}</span>
  </div>
)

const formatMemberName = (m: { firstName: string | null; lastName: string | null; email: string }) =>
  [m.firstName, m.lastName].filter(Boolean).join(' ') || m.email

export const ScheduleInterviewPage = () => {
  const { candidateId } = useParams()
  const navigate = useNavigate()

  const { data: candidate, isLoading: candidateLoading } = useCandidate(candidateId)
  const { data: team } = useTeamMembers()
  const { data: rooms } = useRooms()
  const checkAvailability = useCheckAvailability()
  const createSession = useCreateSession()

  const interviewers = useMemo(
    () => (team?.items ?? []).filter((m) => m.role === 'interviewer' && m.isActive),
    [team],
  )

  const [ivSearch, setIvSearch] = useState('')
  const [selectedIV, setSelectedIV] = useState<string>('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [medium, setMedium] = useState<'virtual' | 'room' | ''>('')
  const [selectedRoomId, setSelectedRoomId] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  const filteredIV = interviewers.filter((iv) =>
    formatMemberName(iv).toLowerCase().includes(ivSearch.toLowerCase()),
  )

  // Live availability preview — keyed by the exact inputs it was computed
  // for, so a stale result never renders after the user changes a field
  // (rather than clearing state synchronously inside the effect, which
  // would trigger cascading renders).
  const canCheckAvailability = Boolean(selectedIV && date && time && (medium !== 'room' || selectedRoomId))
  const availabilityKey = canCheckAvailability
    ? `${selectedIV}|${date}|${time}|${medium}|${selectedRoomId}`
    : ''
  const [liveResult, setLiveResult] = useState<{ key: string; available: boolean; reason?: string } | null>(null)

  useEffect(() => {
    if (!availabilityKey) return undefined

    const roomId = medium === 'room' ? selectedRoomId : undefined
    const scheduledAt = new Date(`${date}T${time}`).toISOString()

    const timeoutId = setTimeout(() => {
      checkAvailability.mutate(
        { interviewerId: selectedIV, roomId, scheduledAt },
        { onSuccess: (result) => setLiveResult({ key: availabilityKey, ...result }) },
      )
    }, 500)

    return () => clearTimeout(timeoutId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availabilityKey])

  const showLiveResult = liveResult?.key === availabilityKey
  const isCheckingLive = canCheckAvailability && checkAvailability.isPending && !showLiveResult
  const hasConflict = showLiveResult && liveResult ? !liveResult.available : false
  const dateTimeSelected = Boolean(date && time)
  const locationDisabled = !dateTimeSelected || hasConflict

  if (candidateLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 64 }}>
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!candidate) return (
    <div style={{ padding: 40, fontFamily: 'Inter,system-ui,sans-serif', color: DS.textSec }}>Candidate not found.</div>
  )

  const inp: React.CSSProperties = {
    width: '100%', height: 36, border: `1px solid ${DS.border}`, borderRadius: 6,
    padding: '0 12px', fontSize: 14, color: DS.textPri, outline: 'none',
    background: DS.surface, boxSizing: 'border-box',
  }
  const card: React.CSSProperties = {
    background: DS.surface, border: `1px solid ${DS.border}`, borderRadius: 8, padding: '20px 24px',
  }

  const handleSubmit = async () => {
    setError(null)

    if (!selectedIV) return setError('Please select an interviewer.')
    if (!date || !time) return setError('Please select a date and time.')
    if (medium === 'room' && !selectedRoomId) return setError('Please select a room.')

    const scheduledAt = new Date(`${date}T${time}`).toISOString()
    const roomId = medium === 'room' ? selectedRoomId : undefined

    try {
      const availability = await checkAvailability.mutateAsync({
        interviewerId: selectedIV,
        roomId,
        scheduledAt,
      })

      if (!availability.available) {
        setError(availability.reason ?? 'That time slot is unavailable.')
        return
      }

      await createSession.mutateAsync({
        candidateId: candidate.id,
        interviewerId: selectedIV,
        roomId,
        scheduledAt,
      })

      navigate(`/recruit/candidates/${candidate.id}`)
    } catch (err) {
      const message =
        axios.isAxiosError(err) && typeof err.response?.data?.message === 'string'
          ? err.response.data.message
          : 'Something went wrong. Please try again.'
      setError(message)
    }
  }

  const isSubmitting = checkAvailability.isPending || createSession.isPending
  const submitDisabled = isSubmitting || hasConflict

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
          <span>{candidate.roleApplyingFor}</span>
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

          {filteredIV.length === 0 ? (
            <p style={{ fontSize: 13, color: DS.textMuted }}>
              No interviewers on your team yet — invite one from the Team page first.
            </p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {filteredIV.map(iv => (
                <div key={iv.id} onClick={() => setSelectedIV(iv.id)} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 8, cursor: 'pointer',
                  background: selectedIV === iv.id ? DS.primaryLt : DS.bg,
                  border: selectedIV === iv.id ? `1.5px solid ${DS.primaryBdr}` : `1px solid ${DS.border}`,
                  transition: 'all 0.12s',
                }}>
                  <Avatar name={formatMemberName(iv)} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: selectedIV === iv.id ? DS.primaryTxt : DS.textPri }}>{formatMemberName(iv)}</div>
                    <div style={{ fontSize: 12, color: DS.textMuted }}>{iv.email}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {!selectedIV ? (
          <div style={{ ...card, textAlign: 'center', color: DS.textMuted, fontSize: 13 }}>
            Select an interviewer above to continue.
          </div>
        ) : (
          <>
            {/* ── Date & Time ── */}
            <div style={{ ...card, marginBottom: 16 }}>
              <SectionLabel icon={<I.Cal />} text="Date & Time" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: DS.textSec, marginBottom: 6 }}>Date</label>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inp} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: DS.textSec, marginBottom: 6 }}>Time</label>
                  <input type="time" value={time} onChange={e => setTime(e.target.value)} style={inp} />
                </div>
              </div>

              {date && time && (
                <div style={{ marginTop: 14, fontSize: 13, fontWeight: 500 }}>
                  {isCheckingLive && <span style={{ color: DS.textMuted }}>Checking availability…</span>}
                  {!isCheckingLive && showLiveResult && liveResult?.available && (
                    <span style={{ color: '#047857' }}>✓ Interviewer is available at this time</span>
                  )}
                  {!isCheckingLive && showLiveResult && liveResult && !liveResult.available && (
                    <span style={{ color: DS.errorTxt }}>✗ {liveResult.reason ?? 'That time slot is unavailable.'}</span>
                  )}
                </div>
              )}
            </div>

            {/* ── Location / Medium ── */}
            <div style={{ ...card, marginBottom: 16, opacity: locationDisabled ? 0.5 : 1 }}>
              <SectionLabel icon={<I.Pin />} text="Location / Medium" />

              {locationDisabled && (
                <p style={{ fontSize: 13, color: DS.textMuted, marginTop: -6, marginBottom: 14 }}>
                  {hasConflict
                    ? 'Pick a different date/time to resolve the conflict above before choosing a location.'
                    : 'Select a date and time first.'}
                </p>
              )}

              <div style={{ display: 'flex', gap: 8, marginBottom: 12, pointerEvents: locationDisabled ? 'none' : 'auto' }}>
                {([
                  { key: 'virtual', label: 'Virtually',   icon: <I.Wifi /> },
                  { key: 'room',    label: 'Select Room',  icon: <I.Building /> },
                ] as const).map(({ key, label, icon }) => (
                  <button key={key} onClick={() => setMedium(key)} disabled={locationDisabled} style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    height: 36, borderRadius: 6, cursor: locationDisabled ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 500,
                    border: medium === key ? `1.5px solid ${DS.primaryBdr}` : `1px solid ${DS.border}`,
                    background: medium === key ? DS.primaryLt : DS.surface,
                    color: medium === key ? DS.primaryTxt : DS.textSec,
                    transition: 'all 0.12s',
                  }}>{icon}{label}</button>
                ))}
              </div>
              <div style={{ pointerEvents: locationDisabled ? 'none' : 'auto' }}>
                {medium === 'room' && (
                  (rooms ?? []).length === 0 ? (
                    <p style={{ fontSize: 13, color: DS.textMuted }}>No rooms available — add one from the Rooms page first.</p>
                  ) : (
                    <select value={selectedRoomId} onChange={e => setSelectedRoomId(e.target.value)} disabled={locationDisabled} style={{ ...inp, appearance: 'none', cursor: locationDisabled ? 'not-allowed' : 'pointer' }}>
                      <option value="">Select a room…</option>
                      {(rooms ?? []).map(room => (
                        <option key={room.id} value={room.id}>{room.name}{room.location ? ` — ${room.location}` : ''}</option>
                      ))}
                    </select>
                  )
                )}
                {medium === '' && <input placeholder="Select an option above" style={{ ...inp, color: DS.textMuted }} readOnly />}
              </div>
            </div>

            {/* ── Google Meet info ── */}
            <div style={card}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <span style={{ color: DS.textSec, marginTop: 2 }}><I.Video /></span>
                <div style={{ flex: 1 }}>
                  <span style={{ fontWeight: 600, fontSize: 14, color: DS.textPri }}>Google Meet link included automatically</span>
                  <p style={{ fontSize: 13, color: DS.textSec, margin: '8px 0 0', lineHeight: 1.6 }}>
                    A calendar invite with a Meet link will be sent to the candidate, interviewer{medium === 'room' ? ', and room' : ''} once you submit.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Sticky footer ── */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 200,
        background: DS.surface, borderTop: `1px solid ${DS.border}`,
        padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ fontSize: 12, color: error ? DS.errorTxt : DS.textMuted, fontWeight: 500 }}>
          {error ?? 'Duration: 60 minutes'}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => navigate(`/recruit/candidates/${candidate.id}`)} style={{
            height: 36, padding: '0 16px', borderRadius: 6,
            border: `1px solid ${DS.border}`, background: DS.surface,
            color: DS.textPri, fontSize: 14, fontWeight: 500, cursor: 'pointer',
          }}>Cancel</button>
          <button onClick={handleSubmit} disabled={submitDisabled} style={{
            height: 36, padding: '0 16px', borderRadius: 6, border: 'none',
            background: DS.primary, color: '#fff', fontSize: 14, fontWeight: 500,
            cursor: submitDisabled ? 'not-allowed' : 'pointer', opacity: submitDisabled ? 0.6 : 1,
          }}>{isSubmitting ? 'Scheduling…' : 'Create Calendar Invite'}</button>
        </div>
      </div>
    </div>
  )
}
