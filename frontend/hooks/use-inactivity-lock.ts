'use client'

import { useEffect, useRef, useCallback } from 'react'

interface UseInactivityLockOptions {
  isEnabled: boolean
  timeoutMinutes?: number
  onLock: () => void
}

export function useInactivityLock({
  isEnabled,
  timeoutMinutes = 5,
  onLock,
}: UseInactivityLockOptions) {
  const lastActivityRef = useRef<number>(Date.now())
  const lockTriggeredRef = useRef<boolean>(false)

  const resetActivity = useCallback(() => {
    lastActivityRef.current = Date.now()
    lockTriggeredRef.current = false
  }, [])

  useEffect(() => {
    if (!isEnabled) {
      lockTriggeredRef.current = false
      return
    }

    lastActivityRef.current = Date.now()
    lockTriggeredRef.current = false

    const timeoutMs = Math.max(1, timeoutMinutes) * 60 * 1000

    // Throttle event resets to avoid excessive CPU usage
    let lastThrottledTime = Date.now()
    const handleUserInteraction = () => {
      const now = Date.now()
      if (now - lastThrottledTime > 1000) {
        lastThrottledTime = now
        lastActivityRef.current = now
      }
    }

    const events = [
      'mousemove',
      'mousedown',
      'keydown',
      'touchstart',
      'scroll',
      'wheel',
    ]

    events.forEach((evt) => {
      window.addEventListener(evt, handleUserInteraction, { passive: true })
    })

    // Check periodically if timeout elapsed
    const interval = setInterval(() => {
      if (!isEnabled || lockTriggeredRef.current) return

      const elapsed = Date.now() - lastActivityRef.current
      if (elapsed >= timeoutMs) {
        lockTriggeredRef.current = true
        onLock()
      }
    }, 5000)

    // Handle tab visibility change: if user was away longer than timeout, lock immediately
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isEnabled && !lockTriggeredRef.current) {
        const elapsed = Date.now() - lastActivityRef.current
        if (elapsed >= timeoutMs) {
          lockTriggeredRef.current = true
          onLock()
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      events.forEach((evt) => {
        window.removeEventListener(evt, handleUserInteraction)
      })
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      clearInterval(interval)
    }
  }, [isEnabled, timeoutMinutes, onLock])

  return { resetActivity }
}

