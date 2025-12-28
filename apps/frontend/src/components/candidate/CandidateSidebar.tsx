import { useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { ROUTES, TEXT } from '@/constants'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface CandidateSidebarProps {
  isOpen: boolean
  onClose: () => void
}

/**
 * CandidateSidebar - Navigation sidebar for candidate layout
 * - Highlights active route
 * - Responsive: hidden on mobile, visible on desktop
 * - Mobile overlay with close functionality
 */
export function CandidateSidebar({ isOpen, onClose }: CandidateSidebarProps) {
  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    if (isOpen) {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as HTMLElement
        if (!target.closest('aside') && !target.closest('button[aria-label*="menu"]')) {
          onClose()
        }
      }
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card transition-transform duration-300 ease-in-out lg:static lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <div className="flex min-h-16 items-center justify-between border-b border-border px-4 sm:px-6">
          <h1 className="text-lg font-semibold text-foreground">
            {TEXT.APP_NAME}
          </h1>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onClose}
            aria-label="Close menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </Button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          <NavLink
            to={ROUTES.CANDIDATE_EXAMS}
            onClick={() => {
              if (window.innerWidth < 1024) {
                onClose()
              }
            }}
            className={({ isActive }) =>
              cn(
                'flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )
            }
          >
            Exams
          </NavLink>
        </nav>
      </aside>
    </>
  )
}

