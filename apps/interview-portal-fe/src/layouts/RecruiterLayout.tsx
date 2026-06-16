import { Navigate } from 'react-router-dom'

import { CalendarIcon, ClipboardListIcon, HomeIcon, UsersIcon } from '@/components/icons'
import { ROUTES } from '@/constants/routes'
import { accessTokenStore, decodeToken } from '@/lib/token'
import { AppLayout } from './AppLayout'

const NAV_ITEMS = [
  { label: 'Dashboard',  icon: <HomeIcon size={16} />,          href: ROUTES.RECRUITER_DASHBOARD  },
  { label: 'Candidates', icon: <UsersIcon size={16} />,         href: ROUTES.RECRUITER_CANDIDATES },
  { label: 'Schedule',   icon: <CalendarIcon size={16} />,      href: ROUTES.RECRUITER_SCHEDULE   },
  { label: 'Team',       icon: <ClipboardListIcon size={16} />, href: ROUTES.RECRUITER_TEAM       },
]

export const RecruiterLayout = () => {
  const token   = accessTokenStore.get()
  const payload = token ? decodeToken(token) : null

  // Interviewer who manually navigates here → send to their portal
  if (payload?.role === 'interviewer') {
    return <Navigate to={ROUTES.INTERVIEWER_DASHBOARD} replace />
  }

  return <AppLayout navItems={NAV_ITEMS} portalTitle="Recruitment" />
}
