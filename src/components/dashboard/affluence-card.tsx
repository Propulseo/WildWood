'use client'

import { useMemo } from 'react'
import { Card } from '@/components/ui/card'
import type { ActiveGymPass, Client } from '@/lib/types'

const TODAY = new Date().toISOString().split('T')[0]

function last7Days(): string[] {
  const days: string[] = []
  const base = new Date(TODAY)
  for (let i = 6; i >= 0; i--) {
    const d = new Date(base)
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().slice(0, 10))
  }
  return days
}

interface AffluenceCardProps {
  activePasses: ActiveGymPass[]
  clients: Client[]
}

export function AffluenceCard({ activePasses, clients }: AffluenceCardProps) {
  const todayCount = useMemo(
    () => activePasses.reduce((n, p) => n + p.checkins.filter((c) => c.date === TODAY).length, 0),
    [activePasses]
  )

  const residentsToday = useMemo(() => {
    const residentIds = new Set(clients.filter((c) => c.type === 'resident').map((c) => c.id))
    return activePasses.filter(
      (p) => residentIds.has(p.clientId) && p.checkins.some((c) => c.date === TODAY)
    ).length
  }, [activePasses, clients])

  const sparkline = useMemo(() => {
    const days = last7Days()
    return days.map((day) =>
      activePasses.reduce((n, p) => n + p.checkins.filter((c) => c.date === day).length, 0)
    )
  }, [activePasses])

  const maxVal = Math.max(...sparkline, 1)

  return (
    <Card className="p-5">
      <div className="ww-label mb-2">AFFLUENCE GYM</div>
      <div className="font-display font-extrabold text-2xl text-ww-lime">
        {todayCount}
      </div>
      <p className="text-xs text-ww-muted font-sans mt-0.5">
        {residentsToday} resident{residentsToday !== 1 ? 's' : ''} bungalow inclus
      </p>
      <div className="flex items-end gap-1 mt-3 h-8">
        {sparkline.map((val, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm bg-ww-lime/60"
            style={{ height: `${(val / maxVal) * 100}%`, minHeight: val > 0 ? 4 : 0 }}
          />
        ))}
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-ww-muted font-mono">7j</span>
        <span className="text-[10px] text-ww-muted font-mono">auj.</span>
      </div>
    </Card>
  )
}
