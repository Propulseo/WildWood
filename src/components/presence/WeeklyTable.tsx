'use client'

import { useState } from 'react'
import type { StaffMember, Pointage } from '@/lib/types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const JOURS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'] as const
const PERIODES = [
  { label: 'Cette semaine', days: 7 },
  { label: '7 derniers jours', days: 7 },
  { label: '14 derniers jours', days: 14 },
] as const

const POSTE_LABELS: Record<string, string> = {
  reception: 'Reception',
  bar: 'Bar',
  admin: 'Admin',
}

function getMonday(d: Date): Date {
  const date = new Date(d)
  const day = date.getDay()
  const diff = day === 0 ? -6 : 1 - day
  date.setDate(date.getDate() + diff)
  date.setHours(0, 0, 0, 0)
  return date
}

function dateToStr(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function parseMins(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

function formatDuree(totalMin: number): string {
  if (totalMin <= 0) return '—'
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  return m > 0 ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`
}

function dureeFromPointage(p: Pointage, todayStr: string): number {
  const arrMin = parseMins(p.heure_arrivee)
  if (!p.heure_depart) {
    if (p.date !== todayStr) return 0
    const now = new Date()
    return Math.max(0, now.getHours() * 60 + now.getMinutes() - arrMin)
  }
  return Math.max(0, parseMins(p.heure_depart) - arrMin)
}

function getWeeks(periode: number): Date[] {
  const today = new Date()
  const thisMonday = getMonday(today)
  if (periode <= 7) return [thisMonday]
  const prevMonday = new Date(thisMonday)
  prevMonday.setDate(prevMonday.getDate() - 7)
  return [prevMonday, thisMonday]
}

function formatWeekLabel(monday: Date): string {
  return `Semaine du ${monday.getDate()} ${monday.toLocaleDateString('fr-FR', { month: 'short' })}`
}

interface WeeklyTableProps {
  staff: StaffMember[]
}

export function WeeklyTable({ staff }: WeeklyTableProps) {
  const [periodeIdx, setPeriodeIdx] = useState(0)
  const periode = PERIODES[periodeIdx]
  const weeks = getWeeks(periode.days)
  const todayStr = dateToStr(new Date())

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 flex-wrap">
        <h2 className="font-display text-xl font-extrabold uppercase tracking-wide text-ww-text">
          Historique
        </h2>
        <div className="flex gap-1">
          {PERIODES.map((p, i) => (
            <button
              key={p.label}
              onClick={() => setPeriodeIdx(i)}
              className={`px-3 py-1.5 rounded-lg text-xs font-display font-bold uppercase tracking-wider transition-all ${
                i === periodeIdx
                  ? 'bg-ww-orange text-white'
                  : 'bg-ww-surface text-ww-muted border border-ww-border hover:bg-ww-surface-2'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {weeks.map((monday) => (
        <WeekBlock
          key={dateToStr(monday)}
          monday={monday}
          staff={staff}
          todayStr={todayStr}
          label={formatWeekLabel(monday)}
        />
      ))}
    </div>
  )
}

interface WeekBlockProps {
  monday: Date
  staff: StaffMember[]
  todayStr: string
  label: string
}

function WeekBlock({ monday, staff, todayStr, label }: WeekBlockProps) {
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(d.getDate() + i)
    return dateToStr(d)
  })

  return (
    <div>
      <p className="text-xs text-ww-muted font-sans uppercase tracking-wider mb-2">{label}</p>
      <div className="border border-ww-border rounded-xl overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-ww-border bg-ww-surface-2 h-[44px]">
              <TableHead className="font-display font-semibold text-xs uppercase tracking-widest text-ww-muted w-[180px]">
                Nom
              </TableHead>
              {JOURS.map((j) => (
                <TableHead
                  key={j}
                  className="font-display font-semibold text-xs uppercase tracking-widest text-ww-muted text-center w-[80px]"
                >
                  {j}
                </TableHead>
              ))}
              <TableHead className="font-display font-semibold text-xs uppercase tracking-widest text-ww-muted text-center w-[90px]">
                Total
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staff.map((member) => {
              let totalMin = 0
              const cells = weekDates.map((dateStr) => {
                const p = member.pointages.find((pt) => pt.date === dateStr)
                if (!p) return { dateStr, duree: 0, enCours: false }
                const d = dureeFromPointage(p, todayStr)
                totalMin += d
                return { dateStr, duree: d, enCours: !p.heure_depart && p.date === todayStr }
              })
              return (
                <TableRow
                  key={member.id}
                  className="border-ww-border h-[52px] hover:bg-ww-surface-2 transition-colors duration-150"
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span
                        className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                        style={{ backgroundColor: member.couleur_avatar }}
                      >
                        {member.avatar_initiales}
                      </span>
                      <div className="min-w-0">
                        <p className="font-display font-semibold text-base text-ww-text truncate">
                          {member.prenom}
                        </p>
                        <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-display font-bold uppercase tracking-wide bg-ww-surface-2 text-ww-muted">
                          {POSTE_LABELS[member.poste] || member.poste}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  {cells.map((c) => (
                    <TableCell key={c.dateStr} className="text-center p-1.5">
                      <DayPill duree={c.duree} enCours={c.enCours} />
                    </TableCell>
                  ))}
                  <TableCell className="text-center">
                    <span className={`font-display font-bold text-lg ${
                      totalMin > 0 ? 'text-ww-orange' : 'text-ww-danger'
                    }`}>
                      {formatDuree(totalMin)}
                    </span>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function DayPill({ duree, enCours }: { duree: number; enCours: boolean }) {
  if (duree <= 0) return <span className="text-ww-muted text-xs">—</span>
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-1 text-[13px] font-mono font-bold ${
        enCours
          ? 'bg-orange-500/20 text-orange-400 animate-pulse'
          : 'bg-ww-lime/15 text-ww-lime'
      }`}
    >
      {enCours ? 'En cours' : formatDuree(duree)}
    </span>
  )
}
