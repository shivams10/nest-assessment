export const ROUTES = {
  LOGIN:                '/',
  RECRUITER_DASHBOARD:  '/recruit/dashboard',
  RECRUITER_CANDIDATES: '/recruit/candidates',
  RECRUITER_SCHEDULE:   '/recruit/schedule',
  RECRUITER_TEAM:       '/recruit/team',
  INTERVIEWER_DASHBOARD:'/interview/dashboard',
  INTERVIEWER_SESSIONS: '/interview/sessions',
} as const

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES]
