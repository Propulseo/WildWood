'use client'

interface BuConf {
  label: string
  color: string
}

interface Props {
  totaux: Record<string, number>
  buConfig: Record<string, BuConf>
  nbTransactions: number
}

export function RevenusKpi({ totaux, buConfig, nbTransactions }: Props) {
  return (
    <>
      {/* KPI cards par BU */}
      <div className="grid grid-cols-3 gap-4">
        {(['resort', 'gym', 'fnb'] as const).map(bu => (
          <div key={bu} className="bg-ww-surface border border-ww-border rounded-xl p-5">
            <div className="flex items-center gap-2 text-ww-muted text-xs uppercase tracking-widest">
              <span>{buConfig[bu].label}</span>
            </div>
            <div className={`font-display text-5xl mt-3 ${buConfig[bu].color}`}>
              ฿ {(totaux[bu] || 0).toLocaleString()}
            </div>
            <div className="text-ww-muted text-sm mt-1">
              {totaux.total > 0
                ? `${(((totaux[bu] || 0) / totaux.total) * 100).toFixed(0)}%`
                : '—'}
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="bg-ww-surface border border-ww-orange/40 rounded-xl p-5
                      flex justify-between items-center">
        <div>
          <div className="text-ww-muted text-xs uppercase tracking-widest">TOTAL REVENUS</div>
          <div className="font-display text-6xl text-ww-orange mt-2">
            ฿ {totaux.total.toLocaleString()}
          </div>
        </div>
        <div className="text-right text-ww-muted">
          <div className="font-display text-3xl">{nbTransactions}</div>
          <div className="text-xs uppercase">transactions</div>
        </div>
      </div>
    </>
  )
}
