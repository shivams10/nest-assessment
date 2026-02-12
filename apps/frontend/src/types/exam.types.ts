/**
 * Exam Types
 * Types for exam management
 */

export interface Exam {
  id: string
  title: string
  description: string | null
  windowStartsAt: string | null
  windowEndsAt: string | null
  durationSeconds: number
  isPublished: boolean
  collegeSessionId: string
  createdAt: string
  updatedAt: string
  submissionId?: string | null
  submittedAt?: string | null
  /** Master password plain (admin/moderator only); only present in admin API responses */
  masterPasswordPlain?: string | null
}

export interface CreateExamRequest {
  collegeSessionId?: string
  title: string
  description?: string
  windowStartsAt: string
  windowEndsAt: string
  durationSeconds: number
  masterPassword: string
}

export interface UpdateExamRequest {
  title?: string
  description?: string
  windowStartsAt?: string
  windowEndsAt?: string
  durationSeconds?: number
  collegeSessionId?: string
  masterPassword?: string
}

export interface ListExamsParams {
  page?: number
  limit?: number
  collegeSessionId?: string
  status?: 'draft' | 'published'
}

export interface ListExamsResponse {
  data: Exam[]
  total: number
  page: number
  limit: number
}
