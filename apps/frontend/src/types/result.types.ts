/**
 * Result Types
 * Shared types for candidate and admin result views
 */

export interface CandidateResult {
  totalMarks: number
  aptitudeMarks: number
  technicalMarks: number
  rank: number | null
  selectedForNextRound: boolean
}

export interface AdminResult {
  submissionId: string
  examId: string
  examTitle: string
  candidate: {
    email: string | null
    firstName: string | null
    lastName: string | null
  }
  totalMarks: number
  aptitudeMarks: number
  technicalMarks: number
  rank: number | null
  selectedForNextRound: boolean
  submittedAt: string | null
  createdAt: string
}

export interface ListResultsParams {
  page?: number
  limit?: number
  examId?: string
  collegeSessionId?: string
  selectedForNextRound?: boolean
  sortBy?: 'rank' | 'totalMarks' | 'submittedAt'
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResultsResponse {
  items: AdminResult[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

