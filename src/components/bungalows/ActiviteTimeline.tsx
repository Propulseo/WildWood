import { useMemo } from 'react'
import type { Reservation, RoomCharge, MaintenanceTask } from '@/lib/types'
import { SejourStats } from './SejourStats'
import { ActiviteEvent, type TimelineEvent } from './ActiviteEvent'

interface ActiviteTimelineProps {
  reservation: Reservation
  roomCharges: RoomCharge[]
  maintenanceTasks: MaintenanceTask[]
}

function timeFromISO(iso: string): string {
  const t = iso.split('T')[1]
  if (!t) return '00h00'
  const [h, m] = t.split(':')
  return `${h}h${m}`
}

export function ActiviteTimeline({ reservation, roomCharges, maintenanceTasks }: ActiviteTimelineProps) {
  const events = useMemo(() => {
    const list: TimelineEvent[] = []

    // CHECK-IN event
    if (reservation.checkin_fait) {
      list.push({
        id: `ev-checkin-${reservation.id}`,
        type: 'checkin',
        date: reservation.dateDebut,
        heure: '08h00',
        label: 'CHECK-IN',
        detail: 'Arrivee enregistree',
      })
    }

    // NO SHOW event
    if (reservation.statut === 'no_show') {
      list.push({
        id: `ev-noshow-${reservation.id}`,
        type: 'no_show',
        date: reservation.dateDebut,
        heure: '18h00',
        label: 'NO SHOW',
        detail: 'Client non presente',
      })
    }

    // F&B room charges
    for (const rc of roomCharges) {
      list.push({
        id: `ev-fnb-${rc.id}`,
        type: 'fnb',
        date: rc.date.split('T')[0],
        heure: timeFromISO(rc.date),
        label: 'COMMANDE F&B',
        detail: `Signe par ${rc.signed_by}`,
        items: rc.items,
        total: rc.total,
      })
    }

    // Maintenance tasks during the stay
    for (const mt of maintenanceTasks) {
      if (mt.date_creation >= reservation.dateDebut && mt.date_creation <= reservation.dateFin) {
        list.push({
          id: `ev-maint-${mt.id}`,
          type: 'maintenance',
          date: mt.date_creation,
          heure: '10h00',
          label: 'MAINTENANCE',
          detail: `Signale : ${mt.titre}`,
        })
      }
    }

    // CHECK-OUT event
    if (reservation.statut === 'checked_out') {
      const totalFnb = roomCharges.reduce((s, rc) => s + rc.total, 0)
      list.push({
        id: `ev-checkout-${reservation.id}`,
        type: 'checkout',
        date: reservation.dateFin,
        heure: '11h00',
        label: 'CHECK-OUT',
        detail: totalFnb > 0
          ? `\u0E3F ${totalFnb.toLocaleString()} encaisses`
          : 'Aucune consommation',
      })
    }

    return list.sort((a, b) => {
      const cmp = a.date.localeCompare(b.date)
      if (cmp !== 0) return cmp
      return a.heure.localeCompare(b.heure)
    })
  }, [reservation, roomCharges, maintenanceTasks])

  const totalConsomme = roomCharges.reduce((s, rc) => s + rc.total, 0)

  if (events.length === 0) {
    return (
      <div className="py-6 text-center">
        <p className="text-sm text-ww-muted font-sans">Aucune activite enregistree pour ce sejour</p>
      </div>
    )
  }

  return (
    <div>
      <SejourStats
        totalConsomme={totalConsomme}
        nbCommandes={roomCharges.length}
        nuits={reservation.nuits}
      />
      <div className="mt-2">
        {events.map((ev, i) => (
          <ActiviteEvent key={ev.id} event={ev} isLast={i === events.length - 1} />
        ))}
      </div>
    </div>
  )
}
