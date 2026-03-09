'use client'

import Link from 'next/link'
import { KeyRound, LogOut, AlertTriangle, UtensilsCrossed, MessageCircle } from 'lucide-react'
import type { ReactNode } from 'react'

interface AlertItem {
  icon: ReactNode
  count: number
  label: string
  href: string
  color: string
}

interface AlertsStripProps {
  checkoutsToday: number
  incompleteCheckins: number
  noShowCount: number
  tablesOuvertes: number
  tablesTotalThb: number
  messagesWA?: number
}

export function AlertsStrip({
  checkoutsToday,
  incompleteCheckins,
  noShowCount,
  tablesOuvertes,
  tablesTotalThb,
  messagesWA = 0,
}: AlertsStripProps) {
  const items: AlertItem[] = [
    {
      icon: <KeyRound className="h-3.5 w-3.5" />,
      count: incompleteCheckins,
      label: `check-in${incompleteCheckins > 1 ? 's' : ''} en attente`,
      href: '/bungalows',
      color: 'var(--ww-orange)',
    },
    {
      icon: <LogOut className="h-3.5 w-3.5" />,
      count: checkoutsToday,
      label: `check-out${checkoutsToday > 1 ? 's' : ''} du jour`,
      href: '/bungalows',
      color: 'var(--ww-wood)',
    },
    {
      icon: <AlertTriangle className="h-3.5 w-3.5" />,
      count: noShowCount,
      label: 'no-show',
      href: '/bungalows',
      color: '#7C3AED',
    },
    {
      icon: <UtensilsCrossed className="h-3.5 w-3.5" />,
      count: tablesOuvertes,
      label: `table${tablesOuvertes > 1 ? 's' : ''} · ฿ ${tablesTotalThb.toLocaleString()}`,
      href: '/tables',
      color: 'var(--ww-lime)',
    },
    {
      icon: <MessageCircle className="h-3.5 w-3.5" />,
      count: messagesWA,
      label: `message${messagesWA > 1 ? 's' : ''} WA a envoyer`,
      href: '/communications',
      color: 'var(--ww-lime)',
    },
  ].filter(item => item.count > 0)

  if (items.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2 px-4 py-3 rounded-xl bg-ww-surface border border-ww-border">
      <span className="text-[10px] font-display font-bold uppercase tracking-[0.15em] text-ww-muted mr-1">
        Operations
      </span>
      {items.map((item, i) => (
        <Link
          key={i}
          href={item.href}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-body bg-ww-surface-2 border border-ww-border/50 hover:border-ww-border transition-all duration-150 hover:-translate-y-px group"
        >
          <span style={{ color: item.color }}>{item.icon}</span>
          <span className="font-display font-bold text-ww-text">{item.count}</span>
          <span className="text-ww-muted group-hover:text-ww-text transition-colors">{item.label}</span>
        </Link>
      ))}
    </div>
  )
}
