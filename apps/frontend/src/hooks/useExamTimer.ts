import { useEffect, useState, useRef } from 'react'
import type { GetExamResponse } from '@/services/exam-runtime.service'

/**
 * useExamTimer - Hook for managing exam countdown timer
 * Timer source of truth is backend (expiresAt or calculated from startedAt + duration)
 * Calculates remaining time safely
 */
export function useExamTimer(
  examData: GetExamResponse | undefined,
  examDurationSeconds: number | undefined,
  onExpire: () => void,
) {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const intervalRef = useRef<number | null>(null)
  const onExpireRef = useRef(onExpire)

  // Keep onExpire ref updated
  useEffect(() => {
    onExpireRef.current = onExpire
  }, [onExpire])

  useEffect(() => {
    // Calculate expiresAt from startedAt + duration if not provided
    let expiresAt: string | undefined = examData?.expiresAt

    if (!expiresAt && examData?.startedAt && examDurationSeconds) {
      const started = new Date(examData.startedAt).getTime()
      const expires = new Date(started + examDurationSeconds * 1000)
      expiresAt = expires.toISOString()
    }

    if (!expiresAt) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    const updateTimer = () => {
      const now = new Date().getTime()
      const expires = new Date(expiresAt!).getTime()
      const remaining = Math.max(0, Math.floor((expires - now) / 1000))

      setTimeRemaining(remaining)

      if (remaining === 0) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
        onExpireRef.current()
      }
    }

    // Update immediately (in next tick to avoid setState in effect)
    const timeoutId = setTimeout(updateTimer, 0)

    // Update every second
    intervalRef.current = window.setInterval(updateTimer, 1000)

    return () => {
      clearTimeout(timeoutId)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [examData?.expiresAt, examData?.startedAt, examDurationSeconds])

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  return {
    timeRemaining,
    formattedTime: timeRemaining !== null ? formatTime(timeRemaining) : '00:00',
    isExpired: timeRemaining === 0,
  }
}

