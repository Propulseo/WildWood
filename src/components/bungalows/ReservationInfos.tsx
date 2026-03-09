import { format, parseISO, subDays } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { Reservation } from '@/lib/types'
import { ContactBooking } from './ContactBooking'
import { TarifSection } from './TarifSection'

const STATUS_LABEL: Record<Reservation['statut'], string> = {
  'en-cours': 'En cours',
  confirmee: 'Confirmee',
  terminee: 'Terminee',
  annulee: 'Annulee',
  no_show: 'No Show',
  checked_out: 'Check-out',
}

export function ReservationInfos({
  reservation,
  clientName,
}: {
  reservation: Reservation
  clientName: string
}) {
  const debut = format(parseISO(reservation.dateDebut), 'dd/MM', { locale: fr })
  const fin = format(parseISO(reservation.dateFin), 'dd/MM/yyyy', { locale: fr })
  const statut = STATUS_LABEL[reservation.statut]

  const adultes = reservation.nb_adultes
  const enfants = reservation.nb_enfants
  const occupantsLabel = `${adultes} adulte${adultes > 1 ? 's' : ''}${
    enfants > 0 ? ` \u00B7 ${enfants} enfant${enfants > 1 ? 's' : ''}` : ''
  }`

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2">
        <span className="text-base">{'\u{1F464}'}</span>
        <span className="text-sm font-medium text-ww-text">{clientName}</span>
      </div>
      <p className="text-sm text-ww-muted ml-7">Du {debut} au {fin}</p>
      <ContactBooking email={reservation.email} telephone={reservation.telephone} />
      <div className="flex items-start gap-2">
        <span className="text-base">{'\u{1F465}'}</span>
        <div>
          <p className="text-xs text-ww-muted uppercase tracking-wide font-display font-bold">OCCUPANTS</p>
          <p className="text-sm font-medium text-ww-text">{occupantsLabel}</p>
        </div>
      </div>

      <TarifSection reservation={reservation} />

      <div className="flex items-start gap-2">
        <span className="text-base">{'\u{1F4CB}'}</span>
        <div>
          <p className="text-xs text-ww-muted">Statut</p>
          <p className="text-sm font-medium text-ww-text">
            {statut} {reservation.statut === 'confirmee' && '\u2713'}
            {reservation.statut === 'checked_out' && '\u2713'}
          </p>
        </div>
      </div>
      {reservation.note && (
        <div className="flex items-start gap-2">
          <span className="text-base">{'\u{1F4DD}'}</span>
          <div>
            <p className="text-xs text-ww-muted">Note</p>
            <p className="text-sm font-medium text-ww-text">{reservation.note}</p>
          </div>
        </div>
      )}
    </div>
  )
}
