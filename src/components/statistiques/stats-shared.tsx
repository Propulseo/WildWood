'use client'

import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

/* ------------------------------------------------------------------ */
/*  Constants                                                         */
/* ------------------------------------------------------------------ */
export const COLORS = {
  orange: 'var(--ww-orange)',
  lime: 'var(--ww-lime)',
  wood: 'var(--ww-wood)',
  danger: 'var(--ww-danger)',
  success: 'var(--ww-success)',
  muted: 'var(--ww-muted)',
  text: 'var(--ww-text)',
  surface: 'var(--ww-surface)',
  surface2: 'var(--ww-surface-2)',
  border: 'var(--ww-border)',
}

export const EXPENSE_COLORS = [
  '#C94E0A', '#7AB648', '#8B6B3D', '#4A9ECC',
  '#9B6DB7', '#EF4444', '#F59E0B', '#6B7280',
]

export const DAY_NAMES = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']

/* ------------------------------------------------------------------ */
/*  Custom Tooltip                                                    */
/* ------------------------------------------------------------------ */
export function WwTooltip({
  active,
  payload,
  label,
  formatter,
}: {
  active?: boolean
  payload?: { value: number; name: string; color: string }[]
  label?: string
  formatter?: (v: number) => string
}) {
  if (!active || !payload?.length) return null
  const fmt = formatter || ((v: number) => `${v.toLocaleString()} THB`)
  return (
    <div className="bg-ww-surface border border-ww-border rounded-lg px-3 py-2 shadow-xl">
      {label && <p className="text-xs text-ww-muted mb-1">{label}</p>}
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <span
            className="inline-block w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-ww-muted text-xs">{entry.name}:</span>
          <span className="font-display font-bold" style={{ color: entry.color }}>
            {fmt(Number(entry.value))}
          </span>
        </div>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Section header                                                    */
/* ------------------------------------------------------------------ */
export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display text-xl font-bold text-ww-text">{children}</h2>
  )
}

/* ------------------------------------------------------------------ */
/*  Skeleton                                                          */
/* ------------------------------------------------------------------ */
export function StatsSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-4 w-72 mt-2" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-5">
            <Skeleton className="h-5 w-40 mb-4" />
            <Skeleton className="h-[260px] w-full" />
          </Card>
        ))}
      </div>
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
  const radius = innerRadius + (outerRadius - innerRadius) * 1.6
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  if (!percent || percent < 0.04) return null
  return (
    <text
      x={x}
      y={y}
      fill="var(--ww-text)"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      className="text-[11px] font-sans"
    >
      {name} ({(percent * 100).toFixed(0)}%)
    </text>
  )
}
