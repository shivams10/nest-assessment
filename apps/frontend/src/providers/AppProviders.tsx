import type { ReactNode } from 'react'
import { ReduxProvider } from '@/lib/redux-provider'
import { ReactQueryProvider } from '@/lib/react-query'

interface AppProvidersProps {
  children: ReactNode
}

/**
 * AppProviders - Consolidates all application-level providers
 * This component wraps the app with Redux and React Query providers
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ReduxProvider>
      <ReactQueryProvider>{children}</ReactQueryProvider>
    </ReduxProvider>
  )
}

