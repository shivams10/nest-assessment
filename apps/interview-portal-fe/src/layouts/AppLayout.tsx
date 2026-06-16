import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'

import { LogOutIcon, MenuIcon, PortalLogoIcon, XIcon } from '@/components/icons'
import { Avatar } from '@/components/ui'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useLogout } from '@/hooks/useLogout'
import { cn } from '@/lib/utils'

export type NavItem = {
  label: string
  icon:  React.ReactNode
  href:  string
}

type AppLayoutProps = {
  navItems:    NavItem[]
  portalTitle: string
}

export const AppLayout = ({ navItems, portalTitle }: AppLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { data: user }                = useCurrentUser()
  const logout                        = useLogout()

  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.email || ''

  const closeSidebar = () => { setSidebarOpen(false) }

  const sidebarContent = (
    <div className="flex flex-col h-full">

      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center flex-shrink-0">
            <PortalLogoIcon size={16} className="text-white" />
          </div>
          <span className="text-white font-semibold text-sm leading-tight">{portalTitle}</span>
        </div>
        {/* Close button — mobile only */}
        <button
          onClick={closeSidebar}
          className="lg:hidden text-slate-400 hover:text-white p-1 -mr-1"
          aria-label="Close menu"
        >
          <XIcon size={18} />
        </button>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            onClick={closeSidebar}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-100',
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/5',
              )
            }
          >
            <span className="flex-shrink-0">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User + logout */}
      <div className="px-3 py-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-3 mb-2">
          <Avatar name={displayName} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{displayName}</p>
            <p className="text-slate-500 text-xs truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-slate-400 hover:text-white hover:bg-white/5 text-sm transition-colors duration-100"
        >
          <LogOutIcon size={16} />
          Sign out
        </button>
      </div>

    </div>
  )

  return (
    <div className="flex min-h-screen bg-surface-base">

      {/* Desktop sidebar — always visible */}
      <aside className="hidden lg:flex w-64 flex-col bg-sidebar-bg border-r border-sidebar-border flex-shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar — drawer */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            aria-hidden="true"
            onClick={closeSidebar}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-sidebar-bg border-r border-sidebar-border lg:hidden">
            {sidebarContent}
          </aside>
        </>
      )}

      {/* Page area */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Mobile top bar */}
        <header className="flex items-center gap-3 px-4 h-14 bg-surface-DEFAULT border-b border-border lg:hidden flex-shrink-0">
          <button
            onClick={() => { setSidebarOpen(true) }}
            className="text-content-secondary hover:text-content-primary p-1 -ml-1"
            aria-label="Open menu"
          >
            <MenuIcon size={20} />
          </button>
          <span className="font-semibold text-content-primary text-sm">{portalTitle}</span>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>

      </div>
    </div>
  )
}
