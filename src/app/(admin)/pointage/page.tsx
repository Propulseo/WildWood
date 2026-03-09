'use client'

import Link from 'next/link'
import { useStaff } from '@/contexts/staff-context'
import { LiveClock } from '@/components/pointage/LiveClock'
import { StaffCard } from '@/components/pointage/StaffCard'
import { PointageToast, triggerPointageToast } from '@/components/pointage/PointageToast'

function formatHeure(h: string) {
  return h.replace(':', 'h')
}

export default function PointagePage() {
  const { staff, pointerArrivee, pointerDepart, pointerPause, pointerFinPause, getPointageAujourdhui } = useStaff()

  function handleArrivee(staffId: string, prenom: string) {
    const heure = pointerArrivee(staffId)
    triggerPointageToast({ prenom, type: 'arrivee', heure: formatHeure(heure) })
  }

  function handleDepart(staffId: string, prenom: string) {
    const heure = pointerDepart(staffId)
    triggerPointageToast({ prenom, type: 'depart', heure: formatHeure(heure) })
  }

  function handlePause(staffId: string, prenom: string) {
    const heure = pointerPause(staffId)
    triggerPointageToast({ prenom, type: 'pause', heure: formatHeure(heure) })
  }

  function handleFinPause(staffId: string, prenom: string) {
    const heure = pointerFinPause(staffId)
    triggerPointageToast({ prenom, type: 'fin_pause', heure: formatHeure(heure) })
  }

  return (
    <div className="flex flex-col h-full bg-ww-bg">
      {/* Header — 64px */}
      <header className="h-16 shrink-0 flex items-center justify-between px-5 border-b border-ww-border bg-ww-surface">
        <h1 className="font-display font-bold text-lg uppercase tracking-wider text-ww-text">
          POINTAGE <span className="text-ww-muted text-sm font-semibold ml-1">— WildWood Koh Tao</span>
        </h1>
        <LiveClock />
      </header>

      {/* Staff grid */}
      <main className="flex-1 overflow-auto p-5">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {staff.map((member) => (
            <StaffCard
              key={member.id}
              member={member}
              pointage={getPointageAujourdhui(member.id)}
              onArrivee={() => handleArrivee(member.id, member.prenom)}
              onDepart={() => handleDepart(member.id, member.prenom)}
              onPause={() => handlePause(member.id, member.prenom)}
              onFinPause={() => handleFinPause(member.id, member.prenom)}
            />
          ))}
        </div>
      </main>

      {/* Sticky footer — 56px */}
      <footer className="h-14 shrink-0 flex items-center justify-center border-t border-ww-border bg-ww-surface">
        <Link
          href="/pos"
          className="font-sans text-sm text-ww-muted hover:text-ww-text transition-colors"
        >
          → Caisse POS
        </Link>
      </footer>

      <PointageToast />
    </div>
  )
}
