import { useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import { recruiterCandidates, candidateReviews } from './recruiterCandidateData'
import { ROUTES } from '@/constants/routes'
import './candidate.scss';
import "./shared.scss";

const slugify = (value: string) => value.toLowerCase().trim().replace(/\s+/g, '-')

const I = {
  Back:    () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>,
  Mail:    () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  Phone:   () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.39 2 2 0 0 1 3.59 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.78a16 16 0 0 0 6 6l.86-.86a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16z"/></svg>,
  Grad:    () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 10 12 5 2 10l10 5 10-5z"/><path d="M6 12v5c0 1.5 2.5 3 6 3s6-1.5 6-3v-5"/></svg>,
  Star:    () => <svg width="13" height="13" fill="#F59E0B" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  StarE:   () => <svg width="13" height="13" fill="none" stroke="#E2E8F0" strokeWidth="1.5" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  Cal:     () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  CheckC:  () => <svg width="18" height="18" fill="none" stroke="#047857" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#ECFDF5" stroke="#047857"/><polyline points="9 12 11 14 15 10"/></svg>,
  ClockC:  () => <svg width="18" height="18" fill="none" stroke="#4F46E5" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#EEF2FF" stroke="#4F46E5"/><polyline points="12 6 12 12 16 14"/></svg>,
  Next:    () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 8 16 12 12 16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>,
  Reject:  () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>,
  KeyStar: () => <svg width="15" height="15" fill="none" stroke="#F59E0B" strokeWidth="2" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  MsgI:    () => <svg width="16" height="16" fill="none" stroke="#4F46E5" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
}

const Avatar = ({ name, size = 40 }: { name: string; size?: number }) => {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
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
  const [comment, setComment] = useState('')

  const candidate = useMemo(() => recruiterCandidates.find(c => c.id === candidateId), [candidateId])
  const reviews = candidateId ? (candidateReviews[candidateId] ?? []) : []

  if (!candidate) return <div className="cd-not-found">Candidate not found.</div>

  const skills = ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'GraphQL', 'Node.js', 'AWS', 'Testing Library']
  const progress = 80

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
        <button onClick={() => navigate(ROUTES.RECRUITER_DASHBOARD)} className="cd-back-link">
          <I.Back /> Back to Candidate List
        </button>

        {/* name + meta */}
        <div className="cd-header">
          <h1 className="cd-name">{candidate.name}</h1>
          <div className="cd-subtitle">
            {candidate.role} Application · <span className="cd-subtitle-muted">#CAND-94021</span>
          </div>
        </div>

        {/* main 2-col grid */}
        <div className="cd-grid">

          {/* profile card */}
          <div className="rd-card">
            <div className="cd-profile-header">
              <Avatar name={candidate.name} size={72} />
              <div className="cd-profile-name">{candidate.name}</div>
              <div className="cd-profile-location">{candidate.location ?? 'San Francisco, CA'}</div>
            </div>
            <div className="cd-contact-list">
              <ContactRow icon={<I.Mail />}  label="Email Address" value={candidate.email} />
              <ContactRow icon={<I.Phone />} label="Phone Number"  value="+1 (555) 012-3456" />
              <ContactRow icon={<I.Grad />}  label="Education"     value={candidate.education} />
            </div>
          </div>

          {/* right column */}
          <div className="cd-right-col">

            {/* current status */}
            <div className="rd-card">
              <div className="cd-eyebrow">Current Status</div>
              <div className="cd-status-list">
                <div className="cd-status-row">
                  <I.CheckC />
                  <div>
                    <div className="cd-status-title">Tech Interview Cleared</div>
                    <div className="cd-status-meta">May 12, 2024 · Score: 9.2/10</div>
                  </div>
                </div>
                <div className="cd-status-row">
                  <I.ClockC />
                  <div>
                    <div className="cd-status-title">Final Leadership Round</div>
                    <div className="cd-status-meta cd-status-meta--active">In Progress · May 14, 2024</div>
                  </div>
                </div>
              </div>
              <div>
                <div className="cd-progress-header">
                  <span className="cd-eyebrow">Overall Progress</span>
                  <span className="cd-progress-pct">{progress}%</span>
                </div>
                <div className="cd-progress-track">
                  <div className="cd-progress-fill" style={{ width: `${progress}%` }} />
                </div>
              </div>
            </div>

            {/* quick decisions */}
            <div className="rd-card">
              <div className="cd-card-title">Quick Decisions</div>
              <button className="cd-decision-btn cd-decision-btn--success"><I.Next /> Move to Next Round</button>
              <button className="cd-decision-btn cd-decision-btn--danger"><I.Reject /> Reject Candidate</button>
            </div>
          </div>
        </div>

        {/* key expertise */}
        <div className="rd-card" style={{ marginBottom: 16 }}>
          <div className="cd-section-header-left" style={{ marginBottom: 14 }}>
            <I.KeyStar />
            <span className="cd-section-title">Key Expertise</span>
          </div>
          <div className="cd-tag-list">
            {skills.map(s => <span key={s} className="rd-skill-chip">{s}</span>)}
          </div>
        </div>

        {/* interviewer feedback */}
        {reviews.length > 0 && (
          <div>
            <div className="cd-section-header">
              <div className="cd-section-header-left">
                <I.MsgI />
                <span className="cd-section-title cd-section-title--accent">Interviewer Feedback</span>
              </div>
              <button className="rd-btn-primary">Add Your Feedback</button>
            </div>

            <div className="cd-review-grid">
              {reviews.map(r => {
                const rec = 'Strong Hire'
                return (
                  <div key={r.id} className="cd-review-card">
                    <div className="cd-review-header">
                      <div className="cd-review-author-row">
                        <Avatar name={r.author} size={34} />
                        <div>
                          <div className="cd-review-author">{r.author}</div>
                          <div className="cd-review-meta">{r.role} · {r.date}</div>
                        </div>
                      </div>
                      <span className={`cd-rec-badge cd-rec-badge--${slugify(rec)}`}>{rec}</span>
                    </div>
                    <div className="cd-review-stars">
                      {[1, 2, 3, 4, 5].map(n => n <= 4 ? <I.Star key={n} /> : <I.StarE key={n} />)}
                    </div>
                    <p className="cd-review-quote">&ldquo;{r.message}&rdquo;</p>
                    <div className="cd-review-scores">
                      {['TECH DEPTH', 'CULTURE FIT'].map(label => (
                        <div key={label} className="cd-score">
                          <div className="cd-score-label">{label}</div>
                          <div className="cd-score-track">
                            <div className="cd-score-fill" style={{ width: label === 'TECH DEPTH' ? '85%' : '70%' }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* comments */}
            <div className="rd-card">
              <div className="cd-comments-title">Comments</div>
              <textarea
                rows={4}
                placeholder="Conducted by Marcus Thorne · April 28"
                value={comment}
                onChange={e => setComment(e.target.value)}
                className="rd-form-textarea cd-comment-textarea"
              />
              <div className="cd-comments-actions">
                <button className="rd-btn-primary">Add Comment</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}