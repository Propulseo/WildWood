'use client'

interface BuConf {
  label: string
  color: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TxRow = any

interface Props {
  transactions: TxRow[]
  loading: boolean
  buConfig: Record<string, BuConf>
}

const BU_BAR_COLOR: Record<string, string> = {
  gym: 'bg-ww-orange',
  fnb: 'bg-ww-lime',
  resort: 'bg-ww-wood',
}

export function RevenusListe({ transactions, loading, buConfig }: Props) {
  if (loading) {
    return <div className="text-center text-ww-muted py-12">Chargement...</div>
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center text-ww-muted py-16">
        Aucun revenu enregistre pour cette periode
      </div>
    )
  }

  // Grouper par date
  const parDate = transactions.reduce((acc: Record<string, TxRow[]>, t: TxRow) => {
    if (!acc[t.date]) acc[t.date] = []
    acc[t.date].push(t)
    return acc
  }, {} as Record<string, TxRow[]>)

  return (
    <div className="space-y-6">
      {Object.entries(parDate).map(([date, items]) => {
        const totalJour = items.reduce((s: number, t: TxRow) => s + t.montant_thb, 0)
        return (
          <div key={date}>
            <div className="flex justify-between items-center mb-3">
              <span className="text-ww-muted text-sm font-display uppercase">
                {new Date(date).toLocaleDateString('fr-FR', {
                  weekday: 'long', day: 'numeric', month: 'long',
                })}
              </span>
              <span className="font-display text-ww-orange">
                ฿ {totalJour.toLocaleString()}
              </span>
            </div>
            <div className="space-y-2">
              {items.map((t: TxRow) => (
                <RevenuRow key={t.id} t={t} buConfig={buConfig} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function RevenuRow({ t, buConfig }: { t: TxRow; buConfig: Record<string, BuConf> }) {
  return (
    <div className="bg-ww-surface border border-ww-border rounded-xl
                   px-5 py-4 flex items-center gap-4">
      <div className={`w-1 h-10 rounded-full flex-shrink-0 ${
        BU_BAR_COLOR[t.business_unit] || 'bg-ww-muted'
      }`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-ww-text font-medium">{t.note || t.categorie}</span>
          {t.saisie_type === 'manuel' && (
            <span className="text-xs bg-ww-surface-2 border border-ww-border
                           px-2 py-0.5 rounded text-ww-muted">
              manuel
            </span>
          )}
        </div>
        <div className="text-xs text-ww-muted mt-0.5">
          {buConfig[t.business_unit]?.label}
          {t.saisie_type === 'auto_resort' && ' · Calcule auto Booking'}
        </div>
      </div>
      <span className="font-display text-ww-lime text-lg">
        ฿ {t.montant_thb.toLocaleString()}
      </span>
    </div>
  )
}
