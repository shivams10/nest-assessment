import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'

export const NotFoundPage = () => {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-base px-8">
      <div className="text-center max-w-sm">
        <p className="text-brand text-sm font-semibold mb-3">404</p>
        <h1 className="text-content-primary text-2xl font-bold mb-2">Page not found</h1>
        <p className="text-content-secondary text-sm mb-8">
          The page you're looking for doesn't exist or you don't have access to it.
        </p>
        <button
          type="button"
          onClick={() => void navigate(ROUTES.LOGIN)}
          className="inline-flex items-center justify-center h-9 px-4 rounded-md bg-brand text-white text-sm font-medium hover:bg-brand-hover transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2"
        >
          Back to login
        </button>
      </div>
    </div>
  )
}
