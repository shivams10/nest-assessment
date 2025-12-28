import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { CandidateSidebar } from './CandidateSidebar'
import { CandidateTopbar } from './CandidateTopbar'

/**
 * CandidateLayout - Layout wrapper for candidate pages
 * - Responsive layout with mobile-first approach
 * - Sidebar (left, hidden on mobile), Topbar (top), Content (main)
 * - Uses min-height instead of fixed heights
 * - Clean, production-ready structure
 */
export function CandidateLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen w-full overflow-x-hidden">
      <CandidateSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col min-w-0">
        <CandidateTopbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto bg-background p-4 sm:p-6">
          <div className="container mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

