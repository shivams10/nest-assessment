export const ROUTES = {
  LOGIN:                 '/',
  RECRUITER_DASHBOARD:   '/recruit/dashboard',
  RECRUITER_CANDIDATES:  '/recruit/candidates',
  RECRUITER_SCHEDULE:    '/recruit/schedule',
  RECRUITER_TEAM:        '/recruit/team',
  RECRUITER_ROOMS:       '/recruit/rooms',
  INTERVIEWER_DASHBOARD: '/interview/dashboard',
  INTERVIEWER_SESSIONS:  '/interview/sessions',
  INTERVIEWER_QUESTIONS: '/interview/questions',
} as const

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES]

export const ROLE_REDIRECT: Record<string, string> = {
  recruiter:   ROUTES.RECRUITER_DASHBOARD,
  interviewer: ROUTES.INTERVIEWER_DASHBOARD,
  admin:       ROUTES.RECRUITER_DASHBOARD,
}
