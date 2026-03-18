'use client'

const BILLETS = [20, 50, 100, 500, 1000] as const

export interface RecapData {
  revenus: { gym: number; fnb: number; resort: number; total: number }
  depenses: { black_box: number; total: number }
  alreadyClosed: boolean
}

export function ClosingHeader({ step, onClose }: { step: number; onClose: () => void }) {
  const steps = [
    { n: 1, label: 'Recap du jour' },
    { n: 2, label: 'Comptage' },
    { n: 3, label: 'Confirmation' },
  ]
  return (
    <div className="flex items-center justify-between p-5 border-b border-ww-border">
      <div className="flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s.n} className="flex items-center gap-2">
            {i > 0 && <div className={`h-px w-8 ${step > i ? 'bg-ww-orange' : 'bg-ww-border'}`} />}
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
              step >= s.n ? 'bg-ww-orange text-white' : 'bg-ww-surface-2 text-ww-muted'
            }`}>{s.n}</div>
            <span className={`text-sm ${step === s.n ? 'text-ww-text font-bold' : 'text-ww-muted'}`}>
              {s.label}
            </span>
          </div>
        ))}
      </div>
      <button onClick={onClose} className="text-ww-muted hover:text-ww-text ml-2 text-lg">✕</button>
    </div>
  )
}

export function Step1Recap({ recap, alreadyClosed, onNext }: {
  recap: RecapData; alreadyClosed: boolean; onNext: () => void
}) {
  const dateLabel = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long',
  })
  const buLines = [
    { label: 'Gym', value: recap.revenus.gym },
    { label: 'F&B', value: recap.revenus.fnb },
    { label: 'Bungalows', value: recap.revenus.resort },
  ].filter(r => r.value > 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-3xl">💰</span>
        <div>
          <h2 className="font-display text-2xl font-bold text-ww-text">Recap du jour</h2>
          <p className="text-ww-muted text-sm capitalize">{dateLabel}</p>
        </div>
      </div>
      {alreadyClosed && (
        <div className="bg-ww-lime/10 border border-ww-lime/30 rounded-lg p-3 text-ww-lime text-sm">
          Closing deja effectue aujourd&apos;hui
        </div>
      )}
      <div className="space-y-2">
        {buLines.map(r => (
          <div key={r.label} className="flex justify-between bg-ww-surface-2 rounded-lg px-4 py-3">
            <span className="text-ww-muted">{r.label}</span>
            <span className="font-display text-ww-text">
              ฿ {r.value.toLocaleString()} <span className="text-ww-muted text-xs">THB</span>
            </span>
          </div>
        ))}
      </div>
      <div className="flex justify-between items-center pt-2 border-t border-ww-border">
        <span className="font-display text-xl text-ww-text">CA DU JOUR</span>
        <span className="font-display text-4xl text-ww-orange">
          ฿ {recap.revenus.total.toLocaleString()}
          <span className="text-lg ml-1 text-ww-muted">THB</span>
        </span>
      </div>
      <button onClick={onNext}
        className="w-full py-4 bg-ww-orange text-white font-display text-lg rounded-xl mt-4 hover:brightness-110 transition-all">
        Passer au comptage →
      </button>
    </div>
  )
}

export function Step2Comptage({ billets, cashCounted, onBillet, onReset, onBack, onSubmit, submitting }: {
  billets: Record<number, number>; cashCounted: number
  onBillet: (v: number, d: number) => void; onReset: () => void
  onBack: () => void; onSubmit: () => void; submitting: boolean
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-3xl">💵</span>
        <div>
          <h2 className="font-display text-2xl font-bold text-ww-text">Comptage especes</h2>
          <p className="text-ww-muted text-sm">Comptez les billets dans la caisse</p>
        </div>
      </div>
      <div className="bg-ww-surface-2 border border-ww-border rounded-xl p-5 text-center">
        <div className="text-ww-muted text-xs uppercase tracking-widest">Total compte</div>
        <div className="font-display text-6xl text-ww-text mt-2">
          {cashCounted.toLocaleString()}
          <span className="text-xl ml-2 text-ww-muted">THB</span>
        </div>
      </div>
      <div className="grid grid-cols-5 gap-3">
        {BILLETS.map(b => (
          <div key={b} className="bg-ww-surface-2 border border-ww-border rounded-xl p-3 text-center">
            <button onClick={() => onBillet(b, 1)}
              className="w-full text-ww-orange font-display text-xl hover:text-ww-lime transition-colors">
              {b}
            </button>
            <div className="text-ww-muted text-xs mt-1">x{billets[b] || 0}</div>
            <button onClick={() => onBillet(b, -1)}
              className="text-ww-muted text-xs hover:text-ww-danger mt-1 transition-colors">−</button>
          </div>
        ))}
      </div>
      {cashCounted > 0 && (
        <div className="text-xs text-ww-muted space-y-1">
          {BILLETS.filter(b => billets[b] > 0).map(b => (
            <div key={b} className="flex justify-between">
              <span>{b} x {billets[b]}</span>
              <span>฿ {(b * billets[b]).toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
      <button onClick={onReset} className="text-ww-muted text-sm hover:text-ww-text w-full text-center">
        Reset
      </button>
      <div className="flex gap-3 mt-4">
        <button onClick={onBack}
          className="flex-1 border border-ww-border rounded-xl py-3 text-ww-muted hover:text-ww-text transition-colors">
          ← Retour
        </button>
        <button onClick={onSubmit} disabled={submitting || cashCounted === 0}
          className="flex-[2] bg-ww-orange text-white font-display text-lg rounded-xl py-3 px-8 disabled:opacity-40 hover:brightness-110 transition-all">
          {submitting ? 'Enregistrement...' : 'Confirmer →'}
        </button>
      </div>
    </div>
  )
}

export function Step3Confirmation({ recap, cashCounted, onClose }: {
  recap: RecapData; cashCounted: number; onClose: () => void
}) {
  return (
    <div className="text-center py-8 space-y-4">
      <div className="text-6xl">✅</div>
      <h2 className="font-display text-3xl text-ww-lime">CLOSING VALIDE</h2>
      <div className="space-y-2 text-sm text-ww-muted">
        <div className="flex justify-between bg-ww-surface-2 rounded-lg px-4 py-3">
          <span>CA du jour</span>
          <span className="text-ww-text">฿ {recap.revenus.total.toLocaleString()}</span>
        </div>
        <div className="flex justify-between bg-ww-surface-2 rounded-lg px-4 py-3">
          <span>Especes comptees</span>
          <span className="text-ww-text">฿ {cashCounted.toLocaleString()}</span>
        </div>
        <div className="flex justify-between bg-ww-surface-2 rounded-lg px-4 py-3">
          <span>Versement change box</span>
          <span className="text-ww-lime">฿ {Math.max(0, cashCounted - 2000).toLocaleString()}</span>
        </div>
      </div>
      <button onClick={onClose}
        className="w-full py-4 bg-ww-lime text-black font-display text-lg rounded-xl mt-4 hover:brightness-110 transition-all">
        FERMER
      </button>
    </div>
  )
}
