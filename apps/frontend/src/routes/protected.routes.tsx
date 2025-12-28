import type { RouteObject } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { AdminGuard } from './AdminGuard'
import { AdminLayout } from '@/components/admin/AdminLayout'
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
                path: `${ROUTES.ADMIN}/results`,
                lazy: async () => {
                  const AdminResults = () => <div>Results (Coming Soon)</div>
                  return { Component: AdminResults }
                },
              },
              {
                path: `${ROUTES.ADMIN}/users`,
                lazy: async () => {
                  const AdminUsers = () => <div>Users (Coming Soon)</div>
                  return { Component: AdminUsers }
                },
              },
            ],
          },
        ],
      },
    ],
  },
]

