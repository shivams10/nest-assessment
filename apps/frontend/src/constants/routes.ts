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
} as const

/**
 * Type for route paths
 */
export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES]

