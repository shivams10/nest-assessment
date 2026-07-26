import { useSearchParams } from 'react-router-dom'

import {
  AlertCircleIcon,
  CalendarIcon,
  ClipboardListIcon,
  GoogleIcon,
  PortalLogoIcon,
  SparkleIcon,
} from '@/components/icons'
import { AUTH_ERRORS } from '@/constants/errors'
import { BACKEND_URL } from '@/constants/env'

type Feature = {
  icon: React.ReactNode
  text: string
}

const FEATURES: Feature[] = [
  { icon: <SparkleIcon />,       text: 'AI-powered resume parsing' },
  { icon: <CalendarIcon />,      text: 'Smart scheduling with Google Calendar' },
  { icon: <ClipboardListIcon />, text: 'Structured feedback & hiring decisions' },
]

const PortalLogo = () => (
  <div className="flex items-center gap-2.5">
    <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
      <PortalLogoIcon size={16} className="text-white" />
    </div>
    <span className="font-semibold text-base tracking-tight">
      Interview Portal
    </span>
  </div>
)

const LeftPanel = () => (
  <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-sidebar-bg p-12 relative overflow-hidden">

    {/* Decorative blobs */}
    <div className="absolute inset-0 opacity-5 pointer-events-none" aria-hidden="true">
      <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500 rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-400 rounded-full translate-x-1/3 translate-y-1/3" />
    </div>

    <div className="relative z-10 text-white">
      <PortalLogo />
    </div>

    <div className="relative z-10 flex-1 flex flex-col justify-center max-w-sm">
      <h1 className="text-white text-3xl font-bold leading-tight mb-3">
        Hire the right people,{' '}
        <span className="text-indigo-400">faster.</span>
      </h1>
      <p className="text-slate-400 text-sm leading-relaxed mb-10">
        A complete platform for managing technical interviews — from candidate intake to final decision.
      </p>

      <ul className="space-y-4">
        {FEATURES.map((feature) => (
          <li key={feature.text} className="flex items-center gap-3 text-slate-300 text-sm">
            <span className="text-indigo-400 flex-shrink-0">{feature.icon}</span>
            {feature.text}
          </li>
        ))}
      </ul>
    </div>

    <div className="relative z-10">
      <p className="text-slate-600 text-xs">
        © {new Date().getFullYear()} Your Company. All rights reserved.
      </p>
    </div>
  </div>
)

type RightPanelProps = {
  errorMessage: string | null
  onGoogleSignIn: () => void
}

const RightPanel = ({ errorMessage, onGoogleSignIn }: RightPanelProps) => (
  <div className="flex-1 flex flex-col items-center justify-center bg-surface-DEFAULT px-8 py-12">
    <div className="w-full max-w-sm">

      {/* Mobile-only logo */}
      <div className="flex items-center gap-2.5 mb-8 lg:hidden text-content-primary">
        <PortalLogo />
      </div>

      <div className="mb-8">
        <h2 className="text-content-primary text-2xl font-bold mb-1.5">
          Welcome back!
        </h2>
        <p className="text-content-secondary text-sm">
          Sign in with your company Google account to continue.
        </p>
      </div>

      {errorMessage !== null && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-lg border border-status-error-border bg-status-error-bg px-4 py-3 mb-6"
        >
          <AlertCircleIcon className="text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-status-error-text text-sm leading-relaxed">
            {errorMessage}
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={onGoogleSignIn}
        className="w-full flex items-center justify-center gap-3 h-11 px-4 rounded-lg border border-border bg-surface-DEFAULT text-content-secondary text-sm font-medium hover:bg-surface-subtle hover:border-border-strong transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2"
      >
        <GoogleIcon />
        Continue with Google
      </button>

      <div className="mt-8 pt-6 border-t border-slate-100">
        <p className="text-center text-xs text-content-muted leading-relaxed">
          Access is restricted to authorised personnel only.
          <br />
          Contact your admin if you need access.
        </p>
      </div>

    </div>
  </div>
)

export const LoginPage = () => {
  const [searchParams] = useSearchParams()
  const errorKey = searchParams.get('error')
  const errorMessage = errorKey !== null ? (AUTH_ERRORS[errorKey] ?? AUTH_ERRORS['auth_failed']) : null

  const handleGoogleSignIn = () => {
    window.location.href = `${BACKEND_URL}/auth/google`
  }

  return (
    <main className="flex min-h-screen">
      <LeftPanel />
      <RightPanel errorMessage={errorMessage} onGoogleSignIn={handleGoogleSignIn} />
    </main>
  )
}
