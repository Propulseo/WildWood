'use client'

import { useState, useEffect, useCallback } from 'react'
import type { CheckinEntry } from '@/lib/types'
import { getCheckins } from '@/lib/data-access'
import { useRealtime } from './use-realtime'

export function useCheckins() {
  const [checkins, setCheckins] = useState<CheckinEntry[]>([])
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    try {
      setCheckins(await getCheckins())
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refetch() }, [refetch])
  useRealtime('checkins', 'INSERT', refetch)

  return { checkins, loading, refetch, setCheckins }
}
