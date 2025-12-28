import type { RouteObject } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { AdminGuard } from './AdminGuard'
import { CandidateGuard } from './CandidateGuard'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { CandidateLayout } from '@/components/candidate/CandidateLayout'
import { ROUTES, TEXT } from '@/constants'

/**
 * Protected routes - require authentication
 * 
 * To add role-based protection, use the allowedRoles prop:
 * 
 * @example
 * {
 *   element: <ProtectedRoute allowedRoles={['admin']} />,
 *   children: [...]
 * }
 */
export const protectedRoutes: RouteObject[] = [
  {
    // Base protected route - requires authentication only
    element: <ProtectedRoute />,
    children: [
      {
        path: ROUTES.HOME,
        lazy: async () => {
          // Placeholder for home page
          const HomePage = () => <div>{TEXT.PLACEHOLDERS.HOME_PAGE}</div>
          return { Component: HomePage }
        },
      },
      {
        // Admin routes - require admin/moderator role
        element: <AdminGuard />,
        children: [
          {
            element: <AdminLayout />,
            children: [
              {
                path: ROUTES.ADMIN,
                lazy: async () => {
                  const AdminDashboard = () => (
                    <div>{TEXT.PLACEHOLDERS.HOME_PAGE}</div>
                  )
                  return { Component: AdminDashboard }
                },
              },
              {
                path: `${ROUTES.ADMIN}/exams`,
                lazy: async () => {
                  const AdminExams = () => <div>Exams (Coming Soon)</div>
                  return { Component: AdminExams }
                },
              },
              {
                path: `${ROUTES.ADMIN}/candidates`,
                lazy: async () => {
                  const AdminCandidates = () => (
                    <div>Candidates (Coming Soon)</div>
                  )
                  return { Component: AdminCandidates }
                },
              },
              {
                path: ROUTES.ADMIN_RESULTS,
                lazy: async () => {
                  const { ResultsListPage } = await import('@/pages/admin/ResultsListPage')
                  return { Component: ResultsListPage }
                },
              },
              {
                path: ROUTES.ADMIN_USERS,
                lazy: async () => {
                  const { UsersListPage } = await import('@/pages/admin/UsersListPage')
                  return { Component: UsersListPage }
                },
              },
            ],
          },
        ],
      },
      {
        // Candidate routes - require candidate role
        element: <CandidateGuard />,
        children: [
          {
            element: <CandidateLayout />,
            children: [
              {
                path: ROUTES.CANDIDATE_EXAMS,
                lazy: async () => {
                  const { ExamListPage } = await import('@/pages/candidate/ExamListPage')
                  return { Component: ExamListPage }
                },
              },
              {
                path: ROUTES.CANDIDATE_EXAM_START,
                lazy: async () => {
                  const { ExamStartPage } = await import('@/pages/candidate/ExamStartPage')
                  return { Component: ExamStartPage }
                },
              },
              {
                path: ROUTES.CANDIDATE_EXAM_RUNTIME,
                lazy: async () => {
                  const { ExamRuntimePage } = await import('@/pages/candidate/ExamRuntimePage')
                  return { Component: ExamRuntimePage }
                },
              },
              {
                path: ROUTES.CANDIDATE_EXAM_SUCCESS,
                lazy: async () => {
                  const { ExamSuccessPage } = await import('@/pages/candidate/ExamSuccessPage')
                  return { Component: ExamSuccessPage }
                },
              },
              {
                path: ROUTES.CANDIDATE_EXAM_RESULT,
                lazy: async () => {
                  const { ExamResultPage } = await import('@/pages/candidate/ExamResultPage')
                  return { Component: ExamResultPage }
                },
              },
            ],
          },
        ],
      },
    ],
  },
]

