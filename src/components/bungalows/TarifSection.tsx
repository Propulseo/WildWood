import { format, parseISO, subDays } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { Reservation } from '@/lib/types'

const COMMISSION_BOOKING = 0.8142

function getTarifLabel(res: Reservation) {
  if (res.reservation_directe) return { label: 'DIRECT', color: 'var(--ww-lime)', icon: '\u{1F91D}' }
  if (res.tarif_type === 'flex') return { label: 'FLEXIBLE', color: 'var(--ww-lime)', icon: '\u{1F7E2}' }
  if (res.tarif_type === 'non_remb') return { label: 'NON REMBOURSABLE', color: 'var(--ww-orange)', icon: '\u{1F7E0}' }
  return null
}

function getAnnulationText(res: Reservation): string | null {
  if (res.reservation_directe) return 'Reservation directe — pas de commission Booking'
  if (res.tarif_type === 'flex') {
    const dateLimite = format(subDays(parseISO(res.dateDebut), 14), 'dd/MM', { locale: fr })
    return `Annulation gratuite avant le ${dateLimite}`
  }
  if (res.tarif_type === 'non_remb') return 'Non modifiable \u00B7 Non remboursable'
  return null
}

export function TarifSection({ reservation }: { reservation: Reservation }) {
  const tarif = getTarifLabel(reservation)
  if (!tarif) {
    const montantFormatted = reservation.montant.toLocaleString('fr-FR')
    return (
      <div className="flex items-start gap-2">
        <span className="text-base">{'\u{1F4B0}'}</span>
        <div>
          <p className="text-xs text-ww-muted">Montant</p>
          <p className="text-sm font-medium text-ww-text">{'\u0E3F'} {montantFormatted}</p>
        </div>
      </div>
    )
  }

  const prixNuitBrut = reservation.prix_nuit_brut ?? 0
  const prixNuitNet = reservation.prix_nuit_net ?? 0
  const totalNet = reservation.prix_total_net ?? reservation.montant
  const isDirect = reservation.reservation_directe
  const annulation = getAnnulationText(reservation)

  return (
    <div className="bg-ww-surface-2 border border-ww-border rounded-lg p-4 space-y-3">
      <p className="text-xs text-ww-muted uppercase tracking-wide font-display font-bold">TARIF</p>

      <div className="flex items-center gap-2">
        <span className="text-sm">{tarif.icon}</span>
        <span className="text-sm font-display font-bold" style={{ color: tarif.color }}>
          {tarif.label}
        </span>
      </div>

      {annulation && (
        <p className="text-xs text-ww-muted font-body">{annulation}</p>
      )}

      <div className="border-t border-ww-border pt-3 space-y-1.5">
        {!isDirect && (
          <>
            <div className="flex justify-between text-xs">
              <span className="text-ww-muted">Prix nuit (Booking)</span>
              <span className="text-ww-muted">{'\u0E3F'} {prixNuitBrut.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-ww-muted">Commission Booking</span>
              <span className="text-ww-muted font-mono text-[11px]">{'\u00D7'} {COMMISSION_BOOKING}</span>
            </div>
          </>
        )}
        <div className="flex justify-between text-xs">
          <span className="text-ww-muted">Prix nuit {isDirect ? '' : 'net'}</span>
          <span className="font-medium" style={{ color: 'var(--ww-lime)' }}>
            {'\u0E3F'} {prixNuitNet.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="border-t border-ww-border pt-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-ww-muted">Nuits</span>
          <span className="text-ww-text">{reservation.nuits}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs font-display font-bold text-ww-muted uppercase">TOTAL NET</span>
          <span className="font-display font-extrabold text-base" style={{ color: 'var(--ww-orange)' }}>
            {'\u0E3F'} {totalNet.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  )
}
