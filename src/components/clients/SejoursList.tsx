import type { Reservation, Bungalow, RoomCharge } from '@/lib/types'

interface SejourItem {
  reservation: Reservation
  bungalowNumero: number
  totalFnb: number
}

interface SejoursListProps {
  bungalows: Bungalow[]
  clientId: string
  roomCharges: RoomCharge[]
  onVoirActivite: (reservation: Reservation, bungalowNumero: number) => void
}

function formatDate(iso: string) {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

export function SejoursList({ bungalows, clientId, roomCharges, onVoirActivite }: SejoursListProps) {
  const sejours: SejourItem[] = []

  for (const b of bungalows) {
    for (const r of b.reservations) {
      if (r.clientId === clientId) {
        const totalFnb = roomCharges
          .filter((rc) => rc.reservationId === r.id)
          .reduce((s, rc) => s + rc.total, 0)
        sejours.push({ reservation: r, bungalowNumero: b.numero, totalFnb })
      }
    }
  }

  sejours.sort((a, b) => b.reservation.dateDebut.localeCompare(a.reservation.dateDebut))

  if (sejours.length === 0) return null

  return (
    <div className="space-y-3">
      <h2 className="font-display text-xl font-bold text-ww-text uppercase tracking-wide">
        Sejours
      </h2>
      <div className="space-y-2">
        {sejours.map((s) => (
          <div
            key={s.reservation.id}
            className="flex items-center justify-between p-3 rounded-lg bg-ww-surface border border-ww-border"
          >
            <div className="min-w-0">
              <p className="text-sm font-sans text-ww-text">
                Bungalow {s.bungalowNumero} &middot; {s.reservation.nuits} nuit{s.reservation.nuits > 1 ? 's' : ''}
              </p>
              <p className="text-xs text-ww-muted font-sans">
                {formatDate(s.reservation.dateDebut)} → {formatDate(s.reservation.dateFin)}
              </p>
              {s.totalFnb > 0 && (
                <p className="text-xs font-sans mt-0.5">
                  F&B : <span className="text-ww-orange font-bold">{'\u0E3F'} {s.totalFnb.toLocaleString()}</span>
                </p>
              )}
            </div>
            <button
              onClick={() => onVoirActivite(s.reservation, s.bungalowNumero)}
              className="text-xs text-ww-orange font-display font-bold hover:underline shrink-0 ml-3"
            >
              Voir l&apos;activite →
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
