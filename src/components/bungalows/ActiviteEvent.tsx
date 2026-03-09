import type { TransactionItem } from '@/lib/types'

export type EventType = 'checkin' | 'fnb' | 'maintenance' | 'no_show' | 'checkout'

export interface TimelineEvent {
  id: string
  type: EventType
  date: string
  heure: string
  label: string
  detail?: string
  items?: TransactionItem[]
  total?: number
}

const EVENT_CONFIG: Record<EventType, { icon: string; color: string; label: string }> = {
  checkin:     { icon: '\u{1F7E2}', color: 'var(--ww-lime)',   label: 'CHECK-IN' },
  fnb:         { icon: '\u{1F379}', color: 'var(--ww-orange)', label: 'COMMANDE F&B' },
  maintenance: { icon: '\u{1F527}', color: 'var(--ww-wood)',   label: 'MAINTENANCE' },
  no_show:     { icon: '\u{26A0}\u{FE0F}',  color: 'var(--ww-danger)', label: 'NO SHOW' },
  checkout:    { icon: '\u{1F6AA}', color: 'var(--ww-muted)',  label: 'CHECK-OUT' },
}

function formatDate(iso: string) {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}`
}

export function ActiviteEvent({ event, isLast }: { event: TimelineEvent; isLast: boolean }) {
  const cfg = EVENT_CONFIG[event.type]

  return (
    <div className="flex gap-3 relative">
      {/* Vertical line + dot */}
      <div className="flex flex-col items-center shrink-0">
        <div
          className="w-[10px] h-[10px] rounded-full shrink-0 mt-1"
          style={{ background: cfg.color }}
        />
        {!isLast && (
          <div className="flex-1 w-px bg-ww-border" />
        )}
      </div>

      {/* Content */}
      <div className="pb-5 flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-xs text-ww-muted">
            {formatDate(event.date)} &middot; {event.heure}
          </span>
          <span
            className="font-display font-bold text-xs uppercase tracking-wide"
            style={{ color: cfg.color }}
          >
            {cfg.label}
          </span>
          <span className="text-sm ml-auto">{cfg.icon}</span>
        </div>

        {event.detail && (
          <p className="text-sm text-ww-text font-sans mt-0.5">{event.detail}</p>
        )}

        {event.items && event.items.length > 0 && (
          <div className="mt-1 space-y-0.5">
            {event.items.map((it, i) => (
              <p key={i} className="text-xs text-ww-muted font-sans">
                {it.nom} &times;{it.quantite}
                <span className="ml-2 text-ww-text">{'\u0E3F'} {it.sousTotal.toLocaleString()}</span>
              </p>
            ))}
          </div>
        )}

        {event.total !== undefined && event.items && event.items.length > 1 && (
          <p className="text-xs font-display font-bold text-ww-orange mt-1">
            Total {'\u0E3F'} {event.total.toLocaleString()}
          </p>
        )}
      </div>
    </div>
  )
}
