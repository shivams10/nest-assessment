import { createBrowserRouter } from 'react-router-dom'

import { AuthCallbackPage }         from '@/pages/auth/AuthCallbackPage'
import { LoginPage }                from '@/pages/auth/LoginPage'
import { NotFoundPage }             from '@/pages/errors/NotFoundPage'
import { RecruiterDashboardPage }   from '@/pages/recruiter/RecruiterDashboardPage'
import { InterviewerDashboardPage } from '@/pages/interviewer/InterviewerDashboardPage'
import { ROUTES }                   from '@/constants/routes'

export const router = createBrowserRouter([
  {
    errorElement: <NotFoundPage />,
    children: [
      { path: ROUTES.LOGIN,                element: <LoginPage /> },
      { path: '/auth/callback',            element: <AuthCallbackPage /> },
      { path: ROUTES.RECRUITER_DASHBOARD,  element: <RecruiterDashboardPage /> },
      { path: ROUTES.INTERVIEWER_DASHBOARD,element: <InterviewerDashboardPage /> },
      { path: '*',                         element: <NotFoundPage /> },
    ],
  },
])
