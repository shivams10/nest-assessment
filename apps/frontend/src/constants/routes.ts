/**
 * Route Constants
 * All application routes should be defined here
 * Use these constants instead of hardcoding route paths
 */

export const ROUTES = {
  // Public routes
  LOGIN: '/login',
  UNAUTHORIZED: '/unauthorized',
  
  // Protected routes
  HOME: '/',
  ADMIN: '/admin',
  CANDIDATE: '/candidate',
  
  // Candidate routes
  CANDIDATE_EXAMS: '/candidate/exams',
  CANDIDATE_EXAM_START: '/candidate/exams/:examId/start',
  CANDIDATE_EXAM_RUNTIME: '/candidate/exams/:submissionId/runtime',
  CANDIDATE_EXAM_SUCCESS: '/candidate/exams/:submissionId/success',
  CANDIDATE_EXAM_RESULT: '/candidate/exams/:submissionId/result',
  
  // Admin routes
  ADMIN_USERS: '/admin/users',
  ADMIN_RESULTS: '/admin/results',
  ADMIN_ANALYTICS: '/admin/analytics',
  ADMIN_SESSIONS: '/admin/sessions',
  ADMIN_SESSIONS_NEW: '/admin/sessions/new',
  ADMIN_EXAMS: '/admin/exams',
  ADMIN_EXAMS_NEW: '/admin/exams/new',
  
  // Exam routes (standalone, not under candidate layout)
  EXAM_START: '/exam/:submissionId/start',
  EXAM_RUNTIME: '/exam/:submissionId',
  
  // Result routes
  CANDIDATE_RESULT: '/submissions/:submissionId/result',
} as const

/**
 * Type for route paths
 */
export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES]

