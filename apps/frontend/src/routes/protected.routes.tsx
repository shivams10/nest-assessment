import type { RouteObject } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { AdminGuard } from './AdminGuard'
import { CandidateGuard } from './CandidateGuard'
import { RecruiterGuard } from './RecruiterGuard'
import { HomeLayoutWrapper } from '@/components/HomeLayoutWrapper'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { CandidateLayout } from '@/components/candidate/CandidateLayout'
import { ErrorPage } from '@/pages/ErrorPage'
import { ROUTES, RECRUITER_ROUTES } from '@/constants'

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
        element: <HomeLayoutWrapper />,
        errorElement: <ErrorPage />,
        children: [
          {
            index: true,
            lazy: async () => {
              const { HomePage } = await import('@/pages/HomePage')
              return { Component: HomePage }
            },
          },
        ],
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
                errorElement: <ErrorPage />,
                lazy: async () => {
                  const { AdminDashboardPage } = await import('@/pages/admin/AdminDashboardPage')
                  return { Component: AdminDashboardPage }
                },
              },
              {
                path: ROUTES.ADMIN_EXAMS,
                errorElement: <ErrorPage />,
                lazy: async () => {
                  const { AdminExamsPage } = await import('@/pages/admin/exams/AdminExamsPage')
                  return { Component: AdminExamsPage }
                },
              },
              {
                path: ROUTES.ADMIN_EXAMS_NEW,
                errorElement: <ErrorPage />,
                lazy: async () => {
                  const { CreateExamPage } = await import('@/pages/admin/exams/CreateExamPage')
                  return { Component: CreateExamPage }
                },
              },
              {
                path: ROUTES.ADMIN_EXAMS_EDIT,
                errorElement: <ErrorPage />,
                lazy: async () => {
                  const { EditExamPage } = await import('@/pages/admin/exams/EditExamPage')
                  return { Component: EditExamPage }
                },
              },
              {
                path: ROUTES.ADMIN_EXAM_SETS,
                errorElement: <ErrorPage />,
                lazy: async () => {
                  const { AdminExamSetsPage } = await import('@/pages/admin/exam-sets/AdminExamSetsPage')
                  return { Component: AdminExamSetsPage }
                },
              },
              {
                path: ROUTES.ADMIN_EXAM_SET_QUESTIONS,
                errorElement: <ErrorPage />,
                lazy: async () => {
                  const { ExamSetQuestionsPage } = await import('@/pages/admin/exam-sets/ExamSetQuestionsPage')
                  return { Component: ExamSetQuestionsPage }
                },
              },
              {
                path: ROUTES.ADMIN_QUESTIONS,
                errorElement: <ErrorPage />,
                lazy: async () => {
                  const { AdminQuestionsPage } = await import('@/pages/admin/questions/AdminQuestionsPage')
                  return { Component: AdminQuestionsPage }
                },
              },
              {
                path: ROUTES.ADMIN_BULK_UPLOAD,
                errorElement: <ErrorPage />,
                lazy: async () => {
                  const { BulkUploadPage } = await import('@/pages/admin/bulk-upload/BulkUploadPage')
                  return { Component: BulkUploadPage }
                },
              },
              {
                path: ROUTES.ADMIN_SESSIONS,
                errorElement: <ErrorPage />,
                lazy: async () => {
                  const { AdminSessionsPage } = await import('@/pages/admin/sessions/AdminSessionsPage')
                  return { Component: AdminSessionsPage }
                },
              },
              {
                path: ROUTES.ADMIN_SESSIONS_NEW,
                errorElement: <ErrorPage />,
                lazy: async () => {
                  const { CreateSessionPage } = await import('@/pages/admin/sessions/CreateSessionPage')
                  return { Component: CreateSessionPage }
                },
              },
              {
                path: ROUTES.ADMIN_SESSIONS_EDIT,
                errorElement: <ErrorPage />,
                lazy: async () => {
                  const { EditSessionPage } = await import('@/pages/admin/sessions/EditSessionPage')
                  return { Component: EditSessionPage }
                },
              },
              {
                path: ROUTES.ADMIN_SESSIONS_DETAIL,
                errorElement: <ErrorPage />,
                lazy: async () => {
                  const { AdminSessionDetailPage } = await import('@/pages/admin/sessions/AdminSessionDetailPage')
                  return { Component: AdminSessionDetailPage }
                },
              },
              {
                path: ROUTES.ADMIN_CANDIDATES,
                errorElement: <ErrorPage />,
                lazy: async () => {
                  const { AdminCandidatesPage } = await import('@/pages/admin/AdminCandidatesPage')
                  return { Component: AdminCandidatesPage }
                },
              },
              {
                path: ROUTES.ADMIN_SUBMISSION_RESULT,
                errorElement: <ErrorPage />,
                lazy: async () => {
                  const { AdminSubmissionResultPage } = await import('@/pages/admin/AdminSubmissionResultPage')
                  return { Component: AdminSubmissionResultPage }
                },
              },
              {
                path: ROUTES.ADMIN_RESULTS,
                errorElement: <ErrorPage />,
                lazy: async () => {
                  const { AdminResultsPage } = await import('@/pages/admin/AdminResultsPage')
                  return { Component: AdminResultsPage }
                },
              },
              {
                path: ROUTES.ADMIN_ANALYTICS,
                errorElement: <ErrorPage />,
                lazy: async () => {
                  const { AdminAnalyticsPage } = await import('@/pages/admin/AdminAnalyticsPage')
                  return { Component: AdminAnalyticsPage }
                },
              },
              {
                path: ROUTES.ADMIN_USERS,
                errorElement: <ErrorPage />,
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
        // Recruiter routes - require recruiter role
        element: <RecruiterGuard />,
        children: [
          {
            path: RECRUITER_ROUTES.RECRUITER,
            errorElement: <ErrorPage />,
            lazy: async () => {
              const { RecruiterDashboardPage } = await import('@/pages/recruiter/RecruiterDashboardPage')
              return { Component: RecruiterDashboardPage }
            },
          },
          {
            path: RECRUITER_ROUTES.CANDIDATE_DETAILS,
            errorElement: <ErrorPage />,
            lazy: async () => {
              const { CandidateDetailsPage } = await import('@/pages/recruiter/CandidateDetailsPage')
              return { Component: CandidateDetailsPage }
            },
          },
          {
            path: RECRUITER_ROUTES.SCHEDULE_INTERVIEW,
            errorElement: <ErrorPage />,
            lazy: async () => {
              const { ScheduleInterviewPage } = await import('@/pages/recruiter/ScheduleInterviewPage')
              return { Component: ScheduleInterviewPage }
            },
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
                errorElement: <ErrorPage />,
                lazy: async () => {
                  const { ExamListPage } = await import('@/pages/candidate/ExamListPage')
                  return { Component: ExamListPage }
                },
              },
              {
                path: ROUTES.CANDIDATE_EXAM_START,
                errorElement: <ErrorPage />,
                lazy: async () => {
                  const { ExamStartPage } = await import('@/pages/candidate/ExamStartPage')
                  return { Component: ExamStartPage }
                },
              },
              {
                path: ROUTES.CANDIDATE_EXAM_RUNTIME,
                errorElement: <ErrorPage />,
                lazy: async () => {
                  const { ExamRuntimePage } = await import('@/pages/candidate/ExamRuntimePage')
                  return { Component: ExamRuntimePage }
                },
              },
              {
                path: ROUTES.CANDIDATE_EXAM_SUCCESS,
                errorElement: <ErrorPage />,
                lazy: async () => {
                  const { ExamSuccessPage } = await import('@/pages/candidate/ExamSuccessPage')
                  return { Component: ExamSuccessPage }
                },
              },
              {
                path: ROUTES.CANDIDATE_EXAM_RESULT,
                errorElement: <ErrorPage />,
                lazy: async () => {
                  const { ExamResultPage } = await import('@/pages/candidate/ExamResultPage')
                  return { Component: ExamResultPage }
                },
              },
              {
                path: ROUTES.CANDIDATE_RESULT,
                errorElement: <ErrorPage />,
                lazy: async () => {
                  const { CandidateResultPage } = await import('@/pages/results/CandidateResultPage')
                  return { Component: CandidateResultPage }
                },
              },
            ],
          },
        ],
      },
      {
        // Exam routes - standalone (not under candidate layout)
        // These routes require candidate role but use their own layout
        element: <CandidateGuard />,
        children: [
          {
            path: ROUTES.EXAM_START,
            errorElement: <ErrorPage />,
            lazy: async () => {
              const { ExamStartPage } = await import('@/pages/exam/ExamStartPage')
              return { Component: ExamStartPage }
            },
          },
          {
            path: ROUTES.EXAM_RUNTIME,
            errorElement: <ErrorPage />,
            lazy: async () => {
              const { ExamRuntimePage } = await import('@/pages/exam/ExamRuntimePage')
              return { Component: ExamRuntimePage }
            },
          },
        ],
      },
    ],
  },
]

