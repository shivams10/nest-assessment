import { createBrowserRouter } from 'react-router-dom'
import { publicRoutes } from './public.routes'
import { protectedRoutes } from './protected.routes'
import { ErrorPage } from '@/pages/ErrorPage'

/**
 * Router Configuration
 * 
 * All routes must define errorElement for production UX
 * Route-level errors (loaders, actions) are handled by ErrorPage
 */
export const router = createBrowserRouter([
  {
    errorElement: <ErrorPage />,
    children: [
      ...publicRoutes,
      ...protectedRoutes,
    ],
  },
])

