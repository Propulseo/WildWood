'use client'

import { useState, useMemo } from 'react'
import { Plus } from 'lucide-react'
import { useStaff } from '@/contexts/staff-context'
import { StaffStatusCard } from '@/components/presence/StaffStatusCard'
import { WeeklyTable } from '@/components/presence/WeeklyTable'
import { PresenceKpiCards } from '@/components/presence/PresenceKpiCards'
import { AddStaffDialog } from '@/components/presence/AddStaffDialog'
import type { StaffMember } from '@/lib/types'
import { toast } from 'sonner'

function todayFormatted(): string {
  return new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

function parseMins(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

function formatDuree(totalMin: number): string {
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  return m > 0 ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`
}

function computeWeeklyMinutes(members: StaffMember[], today: string): number {
  const d = new Date(today)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  const monday = d.toISOString().slice(0, 10)

  let total = 0
  for (const member of members) {
    for (const p of member.pointages) {
      if (p.date >= monday && p.date <= today) {
        const arr = parseMins(p.heure_arrivee)
        if (p.heure_depart) {
          total += Math.max(0, parseMins(p.heure_depart) - arr)
        } else if (p.date === today) {
          const now = new Date()
          total += Math.max(0, now.getHours() * 60 + now.getMinutes() - arr)
        }
      }
    }
  }
  return total
}

interface PresenceContentProps {
  initialStaff: StaffMember[]
}

export function PresenceContent({ initialStaff }: PresenceContentProps) {
  const { staff, removeStaffMember } = useStaff()
  const [addOpen, setAddOpen] = useState(false)
  const displayStaff = staff.length > 0 ? staff : initialStaff
  const today = todayStr()

  const presentsToday = useMemo(
    () => displayStaff.filter((s) => s.pointages.some((p) => p.date === today)).length,
    [displayStaff, today]
  )

  const enCoursCount = useMemo(
    () => displayStaff.filter((s) =>
      s.pointages.some((p) => p.date === today && !p.heure_depart)
    ).length,
    [displayStaff, today]
  )

  const weeklyMinutes = useMemo(
    () => computeWeeklyMinutes(displayStaff, today),
    [displayStaff, today]
  )

  function handleRemove(id: string) {
    const member = displayStaff.find((s) => s.id === id)
    removeStaffMember(id)
    if (member) toast.success(`${member.prenom} ${member.nom} retire du staff`)
  }

  return (
    <div className="w-full px-6 py-6 space-y-8">
      <section>
        <div className="flex items-center gap-3 mb-5">
          <h2 className="font-display text-2xl font-extrabold uppercase tracking-wide">
            Presence du jour
          </h2>
          <span className="text-sm text-ww-muted font-sans capitalize">
            {todayFormatted()}
          </span>
          <button
            onClick={() => setAddOpen(true)}
            className="ml-auto flex items-center gap-2 px-3 py-2 rounded-lg bg-ww-lime text-ww-bg font-display font-bold text-sm uppercase tracking-wide transition-all hover:translate-y-[-1px] active:scale-[0.97]"
          >
            <Plus className="h-4 w-4" />
            Ajouter
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayStaff.map((member) => (
            <StaffStatusCard key={member.id} member={member} todayStr={today} onRemove={handleRemove} />
          ))}
        </div>
      </section>

      <PresenceKpiCards
        presentsToday={presentsToday}
        enCoursCount={enCoursCount}
        heuresTotal={weeklyMinutes > 0 ? formatDuree(weeklyMinutes) : '0h'}
      />

      <div className="border-t border-ww-border" />

      <section>
        <WeeklyTable staff={displayStaff} />
      </section>

      <AddStaffDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  )
}
