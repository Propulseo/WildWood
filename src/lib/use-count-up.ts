'use client'

import { useState, useEffect, useRef } from 'react'

/**
 * Animates a number from 0 to `end` over `duration` ms using easeOutExpo.
 * Returns the current animated value as a formatted string.
 */
export function useCountUp(end: number, duration = 800): number {
  const [value, setValue] = useState(0)
  const frameRef = useRef<number>(0)
  const startTimeRef = useRef<number>(0)

  useEffect(() => {
    if (end === 0) {
      setValue(0)
      return
    }

    startTimeRef.current = performance.now()

    function tick(now: number) {
      const elapsed = now - startTimeRef.current
      const progress = Math.min(elapsed / duration, 1)
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
      setValue(Math.round(eased * end))

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick)
      }
    }

    frameRef.current = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(frameRef.current)
  }, [end, duration])

  return value
}
