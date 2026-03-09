'use client'

import { useState, useEffect, useCallback } from 'react'

interface PointageToastData {
  prenom: string
  type: 'arrivee' | 'depart' | 'pause' | 'fin_pause'
  heure: string
}

let showToastFn: ((data: PointageToastData) => void) | null = null

export function triggerPointageToast(data: PointageToastData) {
  showToastFn?.(data)
}

export function PointageToast() {
  const [toast, setToast] = useState<PointageToastData | null>(null)
  const [visible, setVisible] = useState(false)

  const show = useCallback((data: PointageToastData) => {
    setToast(data)
    setVisible(true)
    setTimeout(() => setVisible(false), 2500)
  }, [])

  useEffect(() => {
    showToastFn = show
    return () => { showToastFn = null }
  }, [show])

  if (!toast || !visible) return null

  const labels: Record<PointageToastData['type'], string> = {
    arrivee: 'Arrivee enregistree',
    depart: 'Depart enregistre',
    pause: 'Pause commencee',
    fin_pause: 'Pause terminee',
  }
  const borderColors: Record<PointageToastData['type'], string> = {
    arrivee: 'border-t-[var(--ww-lime)]',
    depart: 'border-t-[var(--ww-danger)]',
    pause: 'border-t-[var(--ww-orange)]',
    fin_pause: 'border-t-[var(--ww-lime)]',
  }
  const borderColor = borderColors[toast.type]
  const label = labels[toast.type]

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 bg-ww-surface border-t-[3px] ${borderColor} px-6 py-4 flex items-center justify-center gap-3 animate-[toast-slide-up_200ms_ease-out]`}
    >
      <span className="font-display font-semibold text-[28px] text-ww-text tracking-tight">
        {toast.prenom}
      </span>
      <span className="font-display font-semibold text-[28px] text-ww-muted">
        —
      </span>
      <span className="font-display font-semibold text-[28px] text-ww-text tracking-tight">
        {label} · {toast.heure}
      </span>
    </div>
  )
}
