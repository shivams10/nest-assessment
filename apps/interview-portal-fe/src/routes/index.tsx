import { createBrowserRouter } from 'react-router-dom'

import { ProtectedRoute }             from '@/components/auth/ProtectedRoute'
import { PublicRoute }                from '@/components/auth/PublicRoute'
import { ROUTES }                     from '@/constants/routes'
import { RecruiterLayout }            from '@/layouts/RecruiterLayout'
import { InterviewerLayout }          from '@/layouts/InterviewerLayout'
import { AuthCallbackPage }           from '@/pages/auth/AuthCallbackPage'
import { LoginPage }                  from '@/pages/auth/LoginPage'
import { NotFoundPage }               from '@/pages/errors/NotFoundPage'
import { InterviewerDashboardPage }   from '@/pages/interviewer/InterviewerDashboardPage'
import { InterviewerSessionsPage }    from '@/pages/interviewer/InterviewerSessionsPage'
import { RecruiterCandidatesPage }    from '@/pages/recruiter/RecruiterCandidatesPage'
import { RecruiterDashboardPage }     from '@/pages/recruiter/RecruiterDashboardPage'
import { RecruiterSchedulePage }      from '@/pages/recruiter/RecruiterSchedulePage'
import { RecruiterTeamPage }          from '@/pages/recruiter/RecruiterTeamPage'
import { CandidateDetailsPage }       from '@/pages/recruiter/CandidateDetailsPage'
import { ScheduleInterviewPage }     from '@/pages/recruiter/ScheduleInterviewPage'

export const router = createBrowserRouter([
  {
    errorElement: <NotFoundPage />,
    children: [

      // Public-only: redirect to dashboard if already logged in
      {
        element: <PublicRoute />,
        children: [
          { path: ROUTES.LOGIN, element: <LoginPage /> },
        ],
      },

      // Auth callback — neither guarded nor public-only
      { path: '/auth/callback', element: <AuthCallbackPage /> },

      // Protected routes — unauthenticated → login
      {
        element: <ProtectedRoute />,
        children: [

          // Recruiter portal (recruiter + admin)
          {
            element: <RecruiterLayout />,
            children: [
              { path: ROUTES.RECRUITER_DASHBOARD,  element: <RecruiterDashboardPage /> },
              { path: ROUTES.RECRUITER_CANDIDATES, element: <RecruiterCandidatesPage /> },
              { path: ROUTES.RECRUITER_SCHEDULE,   element: <RecruiterSchedulePage /> },
              { path: ROUTES.RECRUITER_TEAM,       element: <RecruiterTeamPage /> },
              // Candidate details + scheduling routes
              { path: '/recruit/candidates/:candidateId', element: <CandidateDetailsPage /> },
              { path: '/recruit/candidates/:candidateId/schedule', element: <ScheduleInterviewPage /> },
            ],
          },

          // Interviewer portal
          {
            element: <InterviewerLayout />,
            children: [
              { path: ROUTES.INTERVIEWER_DASHBOARD, element: <InterviewerDashboardPage /> },
              { path: ROUTES.INTERVIEWER_SESSIONS,  element: <InterviewerSessionsPage /> },
            ],
          },

        ],
      },

      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
