import { Outlet } from 'react-router-dom'
import { useAppSelector } from '@/store/hooks'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { CandidateLayout } from '@/components/candidate/CandidateLayout'
import { ADMIN_ROLES, ROLES, type UserRole } from '@/constants'

/**
 * Renders the appropriate layout (Admin or Candidate) for the home tree
 * so that the home page has the same sidebar/topbar as the rest of the app.
 */
export function HomeLayoutWrapper() {
  const role = useAppSelector((state) => state.auth.role)

  if (role && ADMIN_ROLES.includes(role as UserRole)) {
    return (
      <AdminLayout>
        <Outlet />
      </AdminLayout>
    )
  }

  if (role === ROLES.CANDIDATE) {
    return (
      <CandidateLayout>
        <Outlet />
      </CandidateLayout>
    )
  }

  return <Outlet />
}
