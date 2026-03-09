'use client'

import { Skeleton } from '@/components/ui/skeleton'

/* ------------------------------------------------------------------ */
/*  Skeleton                                                          */
/* ------------------------------------------------------------------ */
export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div>
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-4 w-64 mt-2" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-ww-surface border border-ww-border rounded-xl p-5"
          >
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-3 w-24 mt-3" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-ww-surface border border-ww-border rounded-xl p-5">
          <Skeleton className="h-[280px] w-full" />
        </div>
        <div className="bg-ww-surface border border-ww-border rounded-xl p-5">
          <Skeleton className="h-[280px] w-full" />
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Chart Tooltip                                                     */
/* ------------------------------------------------------------------ */
export function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { value: number; name: string; color: string }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-ww-surface border border-ww-orange rounded-lg px-3 py-2 shadow-lg">
      <p className="text-xs text-ww-muted mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm font-display font-bold" style={{ color: entry.color }}>
          {Number(entry.value).toLocaleString()} THB
        </p>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Donut label                                                       */
/* ------------------------------------------------------------------ */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function renderDonutLabel(props: any) {
  const { cx, cy, midAngle, innerRadius, outerRadius, name, percent } = props
  const RADIAN = Math.PI / 180
  const radius = innerRadius + (outerRadius - innerRadius) * 1.4
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  if (!percent || percent < 0.05) return null
  return (
    <text
      x={x}
      y={y}
      fill="var(--ww-text)"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      className="text-xs font-sans"
    >
      {name} ({(percent * 100).toFixed(0)}%)
    </text>
  )
}

/* ------------------------------------------------------------------ */
/*  Constants                                                         */
/* ------------------------------------------------------------------ */
export const TYPE_LABELS: Record<string, string> = {
  'gym-pass': 'Gym Pass',
  fnb: 'F&B',
  bungalow: 'Bungalow',
  upgrade_pass: 'Upgrade Pass',
}

export const TYPE_COLORS: Record<string, string> = {
  'gym-pass': 'text-ww-orange',
  fnb: 'text-ww-lime',
  bungalow: 'text-ww-wood',
  upgrade_pass: 'text-ww-lime',
}
