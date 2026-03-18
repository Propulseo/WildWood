'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { getDailyReport, getRevenusAgreges, getDepensesAgregees, getPeriodeDates }
  from '@/lib/supabase/queries/reporting'
import { ReportingChart } from '@/components/reporting/ReportingChart'
import { ClosingModal } from '@/components/closing/ClosingModal'

type BU = 'gym' | 'resort' | 'global'
type Periode = 'today' | 'week' | 'month'

export default function ReportingPage() {
  const [bu, setBu] = useState<BU>('gym')
  const [periode, setPeriode] = useState<Periode>('week')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [rows, setRows] = useState<any[]>([])
  const [revenus, setRevenus] = useState({ gym: 0, fnb: 0, resort: 0, total: 0, nb: 0 })
  const [depenses, setDepenses] = useState({ gym: 0, fnb: 0, resort: 0, total: 0 })
  const [loading, setLoading] = useState(true)
  const [showClosing, setShowClosing] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const { from, to } = getPeriodeDates(periode)
    try {
      const [dailyRows, rev, dep] = await Promise.all([
        getDailyReport({ from, to }),
        getRevenusAgreges(from, to),
        getDepensesAgregees(from, to),
      ])
      setRows(dailyRows)
      setRevenus(rev)
      setDepenses(dep)
    } catch {
      toast.error('Erreur chargement reporting')
    } finally {
      setLoading(false)
    }
  }, [periode])

  useEffect(() => { fetchData() }, [fetchData])

  const revBu = bu === 'gym' ? revenus.gym : bu === 'resort' ? revenus.resort : revenus.total
  const depBu = bu === 'gym' ? depenses.gym : bu === 'resort' ? depenses.resort : depenses.total
  const profitBu = revBu - depBu
  const margin = revBu > 0 ? ((profitBu / revBu) * 100).toFixed(1) : '0'
  const labelPeriode = periode === 'today' ? "Aujourd'hui" : periode === 'week' ? 'Semaine' : 'Mois'

  return (
    <div className="space-y-6">
      <ReportingHeader bu={bu} setBu={setBu} />
      <PeriodePills periode={periode} setPeriode={setPeriode} />
      <KpiCards revBu={revBu} depBu={depBu} profitBu={profitBu} margin={margin} label={labelPeriode} />

      {rows.length > 0 && (
        <div className="bg-ww-surface border border-ww-border rounded-xl p-5">
          <div className="flex justify-between items-center mb-4">
            <span className="font-display text-xl text-ww-text">
              {getPeriodeDates(periode).from} — {getPeriodeDates(periode).to}
            </span>
            <div className="flex gap-4 text-xs">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-ww-lime inline-block" /> Revenus
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-ww-orange inline-block" /> Depenses
              </span>
            </div>
          </div>
          <ReportingChart rows={rows} bu={bu} />
        </div>
      )}

      <DailyTable rows={rows} bu={bu} loading={loading} />

      <button onClick={() => setShowClosing(true)}
        className="w-full py-4 bg-ww-orange text-white font-display text-lg rounded-xl hover:brightness-110 transition-all">
        Closing du jour
      </button>

      {showClosing && (
        <ClosingModal
          onClose={() => { setShowClosing(false); fetchData() }}
          onSuccess={() => fetchData()}
        />
      )}
    </div>
  )
}

function ReportingHeader({ bu, setBu }: { bu: BU; setBu: (b: BU) => void }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-ww-text tracking-tight">Reporting</h1>
        <p className="text-ww-muted text-sm mt-1 capitalize">
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>
      <div className="flex bg-ww-surface-2 rounded-xl p-1 gap-1">
        {(['gym', 'resort', 'global'] as BU[]).map(b => (
          <button key={b} onClick={() => setBu(b)}
            className={`px-5 py-2 rounded-lg font-display transition-all ${
              bu === b ? 'bg-ww-orange text-white' : 'text-ww-muted hover:text-ww-text'
            }`}>
            {b.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  )
}

function PeriodePills({ periode, setPeriode }: { periode: Periode; setPeriode: (p: Periode) => void }) {
  const tabs = [
    { value: 'today' as const, label: "Aujourd'hui" },
    { value: 'week' as const, label: 'Semaine' },
    { value: 'month' as const, label: 'Mois' },
  ]
  return (
    <div className="flex gap-2">
      {tabs.map(p => (
        <button key={p.value} onClick={() => setPeriode(p.value)}
          className={`px-5 py-2 rounded-lg font-display transition-all ${
            periode === p.value
              ? 'bg-ww-orange text-white'
              : 'bg-ww-surface-2 border border-ww-border text-ww-muted'
          }`}>
          {p.label}
        </button>
      ))}
    </div>
  )
}

function KpiCards({ revBu, depBu, profitBu, margin, label }: {
  revBu: number; depBu: number; profitBu: number; margin: string; label: string
}) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-ww-surface border border-ww-lime/30 rounded-xl p-5">
        <div className="text-ww-muted text-xs uppercase tracking-widest">Revenus · {label}</div>
        <div className="font-display text-4xl text-ww-text mt-2">
          {revBu.toLocaleString()} <span className="text-lg text-ww-muted">THB</span>
        </div>
      </div>
      <div className="bg-ww-surface border border-ww-danger/30 rounded-xl p-5">
        <div className="text-ww-muted text-xs uppercase tracking-widest">Depenses · {label}</div>
        <div className="font-display text-4xl text-ww-text mt-2">
          {depBu.toLocaleString()} <span className="text-lg text-ww-muted">THB</span>
        </div>
      </div>
      <div className="bg-ww-surface border border-ww-orange/30 rounded-xl p-5">
        <div className="text-ww-muted text-xs uppercase tracking-widest">Profit · {label}</div>
        <div className={`font-display text-4xl mt-2 ${profitBu >= 0 ? 'text-ww-lime' : 'text-ww-danger'}`}>
          {profitBu >= 0 ? '+' : ''}{profitBu.toLocaleString()} <span className="text-lg text-ww-muted">THB</span>
        </div>
        <div className={`text-sm mt-1 ${profitBu >= 0 ? 'text-ww-lime' : 'text-ww-danger'}`}>
          {margin}% marge
        </div>
      </div>
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function DailyTable({ rows, bu, loading }: { rows: any[]; bu: BU; loading: boolean }) {
  const today = new Date().toISOString().split('T')[0]
  return (
    <div className="bg-ww-surface border border-ww-border rounded-xl overflow-hidden">
      <table className="w-full">
        <thead className="border-b border-ww-border">
          <tr className="text-ww-muted text-xs uppercase tracking-widest">
            <th className="text-left px-5 py-3">Jour</th>
            <th className="text-left px-5 py-3">Date</th>
            <th className="text-right px-5 py-3">Revenus</th>
            <th className="text-right px-5 py-3">Depenses</th>
            <th className="text-right px-5 py-3">Profit</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={5} className="text-center py-8 text-ww-muted">Chargement...</td></tr>
          ) : rows.length === 0 ? (
            <tr><td colSpan={5} className="text-center py-8 text-ww-muted">Aucune donnee</td></tr>
          ) : [...rows].reverse().map(row => {
            const rev = bu === 'gym' ? row.revenus_gym : bu === 'resort' ? row.revenus_resort : row.revenus_total
            const dep = bu === 'gym' ? row.depenses_gym : bu === 'resort' ? row.depenses_resort : row.depenses_total
            const p = rev - dep
            const jourLabel = new Date(row.date).toLocaleDateString('fr-FR', { weekday: 'short' }).toUpperCase()
            const dateLabel = new Date(row.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
            const isToday = row.date === today
            return (
              <tr key={row.date} className={`border-b border-ww-border/50 hover:bg-ww-surface-2 ${isToday ? 'bg-ww-orange/5' : ''}`}>
                <td className={`px-5 py-3 font-display font-bold ${isToday ? 'text-ww-orange' : 'text-ww-text'}`}>{jourLabel}</td>
                <td className="px-5 py-3 text-ww-muted text-sm">{dateLabel}</td>
                <td className="px-5 py-3 text-right text-ww-text">{rev > 0 ? `฿ ${rev.toLocaleString()}` : '—'}</td>
                <td className="px-5 py-3 text-right text-ww-danger">{dep > 0 ? `฿ ${dep.toLocaleString()}` : '—'}</td>
                <td className={`px-5 py-3 text-right font-display ${p > 0 ? 'text-ww-lime' : p < 0 ? 'text-ww-danger' : 'text-ww-muted'}`}>
                  {rev === 0 && dep === 0 ? '—' : `${p >= 0 ? '+' : ''}฿ ${p.toLocaleString()}`}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
