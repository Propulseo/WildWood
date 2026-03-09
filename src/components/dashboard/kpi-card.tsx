'use client'

import { useCountUp } from '@/lib/use-count-up'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface KpiCardProps {
  label: string
  value: number
  prefix?: string
  suffix?: string
  accentColor?: string
  trend?: { value: number; label: string }
  subtitle?: string
  tooltip?: string
}

export function KpiCard({
  label,
  value,
  prefix = '',
  suffix = '',
  accentColor = 'var(--ww-orange)',
  trend,
  subtitle,
  tooltip,
}: KpiCardProps) {
  const animated = useCountUp(Math.abs(value))

  return (
    <div
      className="bg-ww-surface border border-ww-border rounded-xl p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_24px_var(--ww-orange-glow)]"
      style={{ borderLeftWidth: 3, borderLeftColor: accentColor }}
      title={tooltip}
    >
      <p className="ww-label mb-2">{label}</p>
      <p className="font-display font-extrabold text-3xl text-ww-text tracking-tight ww-count-in">
        {value < 0 && '-'}{prefix}{animated.toLocaleString()}{suffix}
      </p>
      {subtitle && (
        <p className="text-xs text-ww-muted mt-1 font-body">{subtitle}</p>
      )}
      {trend && (
        <div className={`flex items-center gap-1 mt-2.5 text-xs font-medium ${
          trend.value >= 0 ? 'text-ww-lime' : 'text-ww-danger'
        }`}>
          {trend.value >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          <span>{trend.value >= 0 ? '+' : ''}{trend.value}% {trend.label}</span>
        </div>
      )}
    </div>
  )
}
