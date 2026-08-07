import { Navigate } from 'react-router-dom'

import { CalendarIcon, HelpCircleIcon, HomeIcon } from '@/components/icons'
import { ROUTES } from '@/constants/routes'
import { accessTokenStore, decodeToken } from '@/lib/token'
import { AppLayout } from './AppLayout'

const NAV_ITEMS = [
  { label: 'Dashboard', icon: <HomeIcon size={16} />,       href: ROUTES.INTERVIEWER_DASHBOARD },
  { label: 'Sessions',  icon: <CalendarIcon size={16} />,   href: ROUTES.INTERVIEWER_SESSIONS  },
  { label: 'Questions', icon: <HelpCircleIcon size={16} />, href: ROUTES.INTERVIEWER_QUESTIONS },
]

export const InterviewerLayout = () => {
  const token   = accessTokenStore.get()
  const payload = token ? decodeToken(token) : null

  // Recruiter / admin who manually navigates here → send to their portal
  if (payload?.role && ['recruiter', 'admin'].includes(payload.role)) {
    return <Navigate to={ROUTES.RECRUITER_DASHBOARD} replace />
  }

  return <AppLayout navItems={NAV_ITEMS} portalTitle="Interviewer Portal" />
}
