'use client'

import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*'

/**
 * Subscribe to Postgres changes on a table via Supabase Realtime.
 * No-op when Supabase is not configured.
 *
 * Usage:
 *   useRealtime('reservations', '*', () => refetchData())
 */
export function useRealtime(
  table: string,
  event: RealtimeEvent,
  onUpdate: () => void
) {
  const callbackRef = useRef(onUpdate)
  callbackRef.current = onUpdate

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return

    let client: ReturnType<typeof createClient>
    try {
      client = createClient()
    } catch {
      return
    }

    const channel = client
      .channel(`realtime-${table}`)
      .on(
        'postgres_changes',
        { event, schema: 'public', table },
        () => callbackRef.current()
      )
      .subscribe()

    return () => {
      client.removeChannel(channel)
    }
  }, [table, event])
}

/**
 * Tables critiques pour Realtime (Phase 5):
 * - reservations  → calendrier bungalow temps réel
 * - tables_bar    → bar voit les tables ouvertes en live
 * - room_charges  → badge rouge sur calendrier
 * - closings      → admin voit le closing soumis instantanément
 * - shifts_actifs → dashboard shift en cours
 */
