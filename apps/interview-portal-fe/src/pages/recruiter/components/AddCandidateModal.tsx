import { useRef, useState } from 'react'
import axios from 'axios'

import { useCreateCandidate } from '@/hooks/useCreateCandidate'
import '../recruiter.scss'
import '../shared.scss'

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

type FormState = { name: string; email: string; phone: string; roleApplyingFor: string }
const EMPTY_FORM: FormState = { name: '', email: '', phone: '', roleApplyingFor: '' }

export const AddCandidateModal = ({ onClose }: { onClose: () => void }) => {
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const createCandidate = useCreateCandidate()

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }))

  const handleSubmit = () => {
    setError(null)

    if (!form.name || !form.email || !form.roleApplyingFor) {
      setError('Name, email, and role are required.')
      return
    }
    if (!file) {
      setError('Please attach a resume.')
      return
    }

    createCandidate.mutate(
      {
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        roleApplyingFor: form.roleApplyingFor,
        resume: file,
      },
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
    <div className="rd-modal-overlay" onClick={onClose}>
      <div className="rd-modal" onClick={(e) => e.stopPropagation()}>
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
          { label: 'Role Applying For', key: 'roleApplyingFor', type: 'text', placeholder: 'e.g. Backend Engineer' },
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
            onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </div>

        {error && (
          <p className="rd-form-error">{error}</p>
        )}

        <div className="rd-modal-actions">
          <button onClick={onClose} className="rd-btn-secondary" disabled={createCandidate.isPending}>Cancel</button>
          <button onClick={handleSubmit} className="rd-btn-primary" disabled={createCandidate.isPending}>
            {createCandidate.isPending ? 'Adding & parsing resume…' : 'Add Candidate'}
          </button>
        </div>
      </div>
    </div>
  )
}
