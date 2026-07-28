import { useParams, useNavigate } from 'react-router-dom'

import { useCandidate } from '@/hooks/useCandidate'
import type { CandidateStatus } from '@/hooks/useCandidates'
import { LoadingSpinner } from '@/components/ui'
import { api } from '@/lib/api'
import { ROUTES } from '@/constants/routes'
import './candidate.scss'
import './shared.scss'

const STATUS_LABEL: Record<CandidateStatus, string> = {
  added:                'Added',
  interview_scheduled:  'Interview Scheduled',
  interview_done:       'Interview Done',
  next_round:           'Next Round',
  on_hold:              'On Hold',
  rejected:             'Rejected',
  hired:                'Hired',
}

const I = {
  Back:  () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>,
  Mail:  () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  Phone: () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.39 2 2 0 0 1 3.59 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.78a16 16 0 0 0 6 6l.86-.86a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16z"/></svg>,
  Briefcase: () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
  Grad:  () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 10 12 5 2 10l10 5 10-5z"/><path d="M6 12v5c0 1.5 2.5 3 6 3s6-1.5 6-3v-5"/></svg>,
  Cal:   () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Download: () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
}

const Avatar = ({ name, size = 40 }: { name: string; size?: number }) => {
  const initials = name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div className="rd-avatar" style={{ width: size, height: size, fontSize: size * 0.36 }}>
      {initials}
    </div>
  )
}

const ContactRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="cd-contact-row">
    <div className="cd-contact-icon">{icon}</div>
    <div>
      <div className="cd-contact-label">{label}</div>
      <div className="cd-contact-value">{value}</div>
    </div>
  </div>
)

export const CandidateDetailsPage = () => {
  const { candidateId } = useParams()
  const navigate = useNavigate()
  const { data: candidate, isLoading, isError } = useCandidate(candidateId)

  const handleDownloadResume = async () => {
    if (!candidate) return
    const response = await api.get(`/candidates/${candidate.id}/resume`, { responseType: 'blob' })
    const url = URL.createObjectURL(response.data as Blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${candidate.name}-resume`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <div className="rd-page">
        <div className="cd-container" style={{ display: 'flex', justifyContent: 'center', paddingTop: 64 }}>
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  if (isError || !candidate) {
    return <div className="cd-not-found">Candidate not found.</div>
  }

  return (
    <div className="rd-page">

      {/* ── Top Bar ── */}
      <div className="rd-topbar">
        <div className="cd-topbar-title">Candidate Profile</div>
        <div className="cd-topbar-actions">
          <button onClick={() => navigate(`/recruit/candidates/${candidate.id}/schedule`)} className="rd-btn-secondary">
            <I.Cal /> Schedule
          </button>
        </div>
      </div>

      <div className="cd-container">

        {/* back link */}
        <button onClick={() => navigate(ROUTES.RECRUITER_CANDIDATES)} className="cd-back-link">
          <I.Back /> Back to Candidate List
        </button>

        {/* name + meta */}
        <div className="cd-header">
          <h1 className="cd-name">{candidate.name}</h1>
          <div className="cd-subtitle">
            {candidate.roleApplyingFor} Application ·{' '}
            <span className="cd-subtitle-muted">{STATUS_LABEL[candidate.status]}</span>
          </div>
        </div>

        {/* main 2-col grid */}
        <div className="cd-grid">

          {/* profile card */}
          <div className="rd-card">
            <div className="cd-profile-header">
              <Avatar name={candidate.name} size={72} />
              <div className="cd-profile-name">{candidate.name}</div>
              <div className="cd-profile-location">{candidate.roleApplyingFor}</div>
            </div>
            <div className="cd-contact-list">
              <ContactRow icon={<I.Mail />} label="Email Address" value={candidate.email} />
              <ContactRow icon={<I.Phone />} label="Phone Number" value={candidate.phone ?? 'Not provided'} />
              <ContactRow
                icon={<I.Briefcase />}
                label="Experience"
                value={
                  candidate.yearsOfExperience !== null
                    ? `${candidate.yearsOfExperience} years`
                    : 'Not parsed yet'
                }
              />
              {candidate.referredBy && (
                <ContactRow icon={<I.Grad />} label="Referred By" value={candidate.referredBy} />
              )}
            </div>
          </div>

          {/* right column */}
          <div className="cd-right-col">

            {/* resume */}
            <div className="rd-card">
              <div className="cd-eyebrow">Resume</div>
              {candidate.resumeUrl ? (
                <button onClick={handleDownloadResume} className="rd-btn-secondary" style={{ marginTop: 10 }}>
                  <I.Download /> Download Resume
                </button>
              ) : (
                <p className="cd-status-meta" style={{ marginTop: 10 }}>No resume uploaded.</p>
              )}
            </div>

            {/* education */}
            <div className="rd-card">
              <div className="cd-eyebrow">Education</div>
              {candidate.education.length === 0 ? (
                <p className="cd-status-meta" style={{ marginTop: 10 }}>No education details parsed yet.</p>
              ) : (
                <div className="cd-status-list">
                  {candidate.education.map((edu, i) => (
                    <div key={i} className="cd-status-row">
                      <I.Grad />
                      <div>
                        <div className="cd-status-title">{edu.degree || 'Degree'}</div>
                        <div className="cd-status-meta">
                          {edu.institution}{edu.year ? ` · ${edu.year}` : ''}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* skills */}
        <div className="rd-card">
          <div className="cd-section-header-left" style={{ marginBottom: 14 }}>
            <span className="cd-section-title">Skills</span>
          </div>
          {candidate.skills.length === 0 ? (
            <p className="cd-status-meta">No skills parsed from resume yet.</p>
          ) : (
            <div className="cd-tag-list">
              {candidate.skills.map((skill) => (
                <span key={skill} className="rd-skill-chip">{skill}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
