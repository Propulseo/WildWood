interface SejourStatsProps {
  totalConsomme: number
  nbCommandes: number
  nuits: number
}

export function SejourStats({ totalConsomme, nbCommandes, nuits }: SejourStatsProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-ww-surface-2 border border-ww-border text-[13px] font-sans">
        <span className="font-bold text-ww-orange">{'\u0E3F'} {totalConsomme.toLocaleString()}</span>
        <span className="text-ww-muted">consommes</span>
      </span>
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-ww-surface-2 border border-ww-border text-[13px] font-sans">
        <span className="font-bold text-ww-text">{nbCommandes}</span>
        <span className="text-ww-muted">commande{nbCommandes > 1 ? 's' : ''}</span>
      </span>
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-ww-surface-2 border border-ww-border text-[13px] font-sans">
        <span className="font-bold text-ww-text">{nuits}</span>
        <span className="text-ww-muted">nuit{nuits > 1 ? 's' : ''}</span>
      </span>
    </div>
  )
}
