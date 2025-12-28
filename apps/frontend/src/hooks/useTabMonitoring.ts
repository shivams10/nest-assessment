import { useEffect, useRef, useState } from 'react'
import { useMonitoringEvent } from '@/queries/examRuntime.queries'

interface UseTabMonitoringOptions {
  submissionId: string | undefined
  enabled?: boolean
  maxViolations?: number
  onMaxViolations?: () => void
}

/**
 * useTabMonitoring - Hook for monitoring tab switches and blur events
 * Detects visibilitychange, blur, focus events
 * Calls monitoring API on tab switch
 * Shows warning toast after first switch
 * Disables exam after multiple violations
 */
export function useTabMonitoring({
  submissionId,
  enabled = true,
  maxViolations = 3,
  onMaxViolations,
}: UseTabMonitoringOptions) {
  const [violationCount, setViolationCount] = useState(0)
  const [hasWarned, setHasWarned] = useState(false)
  const monitoringMutation = useMonitoringEvent()
  const isDisabledRef = useRef(false)

  useEffect(() => {
    if (!enabled || !submissionId || isDisabledRef.current) {
      return
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab switched away
        handleTabSwitch()
      } else {
        // Tab switched back
        handleTabFocus()
      }
    }

    const handleBlur = () => {
      // Window lost focus
      handleTabSwitch()
    }

    const handleFocus = () => {
      // Window gained focus
      handleTabFocus()
    }

    const handleTabSwitch = () => {
      if (isDisabledRef.current || !submissionId) return

      const newCount = violationCount + 1
      setViolationCount(newCount)

      // Submit monitoring event
      monitoringMutation.mutate({
        submissionId,
        eventType: 'tab_switch',
      })

      // Show warning after first violation
      if (newCount === 1 && !hasWarned) {
        setHasWarned(true)
        // Warning will be shown by parent component
      }

      // Disable exam after max violations
      if (newCount >= maxViolations) {
        isDisabledRef.current = true
        onMaxViolations?.()
      }
    }

    const handleTabFocus = () => {
      if (!submissionId || isDisabledRef.current) return

      monitoringMutation.mutate({
        submissionId,
        eventType: 'focus',
      })
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('blur', handleBlur)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('blur', handleBlur)
      window.removeEventListener('focus', handleFocus)
    }
  }, [
    enabled,
    submissionId,
    violationCount,
    hasWarned,
    maxViolations,
    onMaxViolations,
    monitoringMutation,
  ])

  return {
    violationCount,
    hasWarned,
    isDisabled: isDisabledRef.current,
    showWarning: hasWarned && violationCount > 0,
  }
}

