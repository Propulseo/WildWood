'use client'

interface Props {
  tarifType: 'flex' | 'non_remb'
  onTarifChange: (t: 'flex' | 'non_remb') => void
  isDirect: boolean
  onDirectChange: (d: boolean) => void
}

export function TarifSelector({ tarifType, onTarifChange, isDirect, onDirectChange }: Props) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-body text-ww-muted">Tarif</label>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onTarifChange('flex')}
          className={`px-3 py-2.5 rounded-lg text-xs font-display font-bold transition-all duration-150 text-left ${
            tarifType === 'flex'
              ? 'border-2 border-ww-lime bg-ww-lime/10 text-ww-lime'
              : 'border border-ww-border bg-ww-surface-2 text-ww-muted hover:text-ww-text'
          }`}
        >
          <span className="block">{'\u{1F7E2}'} FLEXIBLE</span>
          <span className="block font-mono text-[11px] mt-0.5 opacity-80">{'\u0E3F'} 4,000/nuit</span>
        </button>
        <button
          type="button"
          onClick={() => onTarifChange('non_remb')}
          className={`px-3 py-2.5 rounded-lg text-xs font-display font-bold transition-all duration-150 text-left ${
            tarifType === 'non_remb'
              ? 'border-2 border-ww-orange bg-ww-orange/10 text-ww-orange'
              : 'border border-ww-border bg-ww-surface-2 text-ww-muted hover:text-ww-text'
          }`}
        >
          <span className="block">{'\u{1F512}'} NON REMB</span>
          <span className="block font-mono text-[11px] mt-0.5 opacity-80">{'\u0E3F'} 3,600/nuit</span>
        </button>
      </div>

      <label className="flex items-center gap-2 cursor-pointer group">
        <div
          onClick={() => onDirectChange(!isDirect)}
          className={`w-9 h-5 rounded-full transition-colors duration-200 relative ${
            isDirect ? 'bg-ww-lime' : 'bg-ww-border'
          }`}
        >
          <div
            className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
              isDirect ? 'translate-x-4' : 'translate-x-0.5'
            }`}
          />
        </div>
        <span className="text-xs font-body text-ww-muted group-hover:text-ww-text transition-colors">
          Reservation directe (pas de commission Booking)
        </span>
      </label>
    </div>
  )
}
