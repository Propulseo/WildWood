'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CashboxRow = any

export default function ComptabilitePage() {
  const [closings, setClosings] = useState<CashboxRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('cashbox_journees')
      .select('*')
      .eq('closed', true)
      .order('date', { ascending: false })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then(({ data, error }: { data: any; error: any }) => {
        if (!error) setClosings(data ?? [])
        setLoading(false)
      })
  }, [])

  if (loading) return <div className="p-6 text-ww-muted">Chargement...</div>

  if (closings.length === 0) return (
    <div className="space-y-6">
      <h1 className="font-display text-4xl font-bold">COMPTABILITE</h1>
      <div className="flex flex-col items-center justify-center h-64 text-ww-muted">
        <div className="text-5xl mb-4">📒</div>
        <p className="font-display text-xl">Aucune journee cloturee</p>
        <p className="text-sm mt-2 max-w-xs text-center">
          La comptabilite se met a jour apres chaque closing valide par l&apos;admin
        </p>
      </div>
    </div>
  )

  const totaux = closings.reduce((acc: Record<string, number>, c: CashboxRow) => ({
    revenus:  acc.revenus  + (c.revenus_total_thb  || 0),
    depenses: acc.depenses + (c.depenses_black_box_thb || 0),
    gym:      acc.gym      + (c.revenus_gym_thb    || 0),
    fnb:      acc.fnb      + (c.revenus_fnb_thb    || 0),
    resort:   acc.resort   + (c.revenus_resort_thb || 0),
  }), { revenus: 0, depenses: 0, gym: 0, fnb: 0, resort: 0 })

  const profitNet = totaux.revenus - totaux.depenses

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl font-bold">COMPTABILITE</h1>
        <p className="text-ww-muted mt-1">
          {closings.length} journee{closings.length > 1 ? 's' : ''} cloturee{closings.length > 1 ? 's' : ''}
        </p>
      </div>

      {/* KPI totaux */}
      <ComptaKpi totaux={totaux} profitNet={profitNet} />

      {/* Journal */}
      <ComptaJournal closings={closings} totaux={totaux} profitNet={profitNet} />
    </div>
  )
}

function ComptaKpi({ totaux, profitNet }: {
  totaux: Record<string, number>; profitNet: number
}) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-ww-surface border border-ww-lime/30 rounded-xl p-5">
        <div className="text-ww-muted text-xs uppercase tracking-widest">Total revenus</div>
        <div className="font-display text-4xl text-ww-lime mt-2">
          ฿ {totaux.revenus.toLocaleString()}
        </div>
        <div className="flex gap-3 mt-2 text-xs text-ww-muted">
          <span>Gym ฿{totaux.gym.toLocaleString()}</span>
          <span>F&B ฿{totaux.fnb.toLocaleString()}</span>
          <span>Resort ฿{totaux.resort.toLocaleString()}</span>
        </div>
      </div>
      <div className="bg-ww-surface border border-ww-danger/30 rounded-xl p-5">
        <div className="text-ww-muted text-xs uppercase tracking-widest">Total depenses (black box)</div>
        <div className="font-display text-4xl text-ww-danger mt-2">
          ฿ {totaux.depenses.toLocaleString()}
        </div>
      </div>
      <div className="bg-ww-surface border border-ww-orange/30 rounded-xl p-5">
        <div className="text-ww-muted text-xs uppercase tracking-widest">Profit net</div>
        <div className={`font-display text-4xl mt-2 ${profitNet >= 0 ? 'text-ww-lime' : 'text-ww-danger'}`}>
          {profitNet >= 0 ? '+' : ''}฿ {profitNet.toLocaleString()}
        </div>
      </div>
    </div>
  )
}

function ComptaJournal({ closings, totaux, profitNet }: {
  closings: CashboxRow[]; totaux: Record<string, number>; profitNet: number
}) {
  return (
    <div className="bg-ww-surface border border-ww-border rounded-xl overflow-hidden">
      <div className="p-4 border-b border-ww-border">
        <span className="text-ww-muted text-xs uppercase tracking-widest">
          Journal des journees cloturees
        </span>
      </div>
      <table className="w-full">
        <thead className="border-b border-ww-border bg-ww-surface-2">
          <tr className="text-ww-muted text-xs uppercase tracking-widest">
            <th className="text-left px-5 py-3">Date</th>
            <th className="text-right px-5 py-3">Gym</th>
            <th className="text-right px-5 py-3">F&B</th>
            <th className="text-right px-5 py-3">Resort</th>
            <th className="text-right px-5 py-3">Total Rev.</th>
            <th className="text-right px-5 py-3">Depenses</th>
            <th className="text-right px-5 py-3">Profit</th>
            <th className="text-right px-5 py-3">Especes</th>
          </tr>
        </thead>
        <tbody>
          {closings.map((c: CashboxRow) => <ComptaRow key={c.id} c={c} />)}
        </tbody>
        <ComptaFooter totaux={totaux} profitNet={profitNet} />
      </table>
    </div>
  )
}

function ComptaRow({ c }: { c: CashboxRow }) {
  const rev = c.revenus_total_thb || 0
  const dep = c.depenses_black_box_thb || 0
  const profit = rev - dep
  return (
    <tr className="border-b border-ww-border/30 hover:bg-ww-surface-2">
      <td className="px-5 py-4">
        <div className="text-ww-text font-medium">
          {new Date(c.date).toLocaleDateString('fr-FR', {
            weekday: 'short', day: '2-digit', month: '2-digit',
          })}
        </div>
        {c.closing_note && (
          <div className="text-ww-muted text-xs mt-0.5">{c.closing_note}</div>
        )}
      </td>
      <td className="px-5 py-4 text-right text-sm text-ww-text">
        {c.revenus_gym_thb > 0 ? `฿${c.revenus_gym_thb.toLocaleString()}` : '—'}
      </td>
      <td className="px-5 py-4 text-right text-sm text-ww-text">
        {c.revenus_fnb_thb > 0 ? `฿${c.revenus_fnb_thb.toLocaleString()}` : '—'}
      </td>
      <td className="px-5 py-4 text-right text-sm text-ww-text">
        {c.revenus_resort_thb > 0 ? `฿${c.revenus_resort_thb.toLocaleString()}` : '—'}
      </td>
      <td className="px-5 py-4 text-right font-display text-ww-lime">
        {rev > 0 ? `฿${rev.toLocaleString()}` : '—'}
      </td>
      <td className="px-5 py-4 text-right font-display text-ww-danger">
        {dep > 0 ? `฿${dep.toLocaleString()}` : '—'}
      </td>
      <td className={`px-5 py-4 text-right font-display ${
        profit >= 0 ? 'text-ww-lime' : 'text-ww-danger'
      }`}>
        {rev === 0 ? '—' : `${profit >= 0 ? '+' : ''}฿${profit.toLocaleString()}`}
      </td>
      <td className="px-5 py-4 text-right text-sm text-ww-muted">
        {c.cash_counted_thb > 0 ? `฿${c.cash_counted_thb.toLocaleString()}` : '—'}
      </td>
    </tr>
  )
}

function ComptaFooter({ totaux, profitNet }: {
  totaux: Record<string, number>; profitNet: number
}) {
  return (
    <tfoot className="border-t-2 border-ww-border bg-ww-surface-2">
      <tr className="font-display">
        <td className="px-5 py-4 text-ww-muted text-sm uppercase">TOTAL</td>
        <td className="px-5 py-4 text-right text-ww-text">
          ฿{totaux.gym.toLocaleString()}
        </td>
        <td className="px-5 py-4 text-right text-ww-text">
          ฿{totaux.fnb.toLocaleString()}
        </td>
        <td className="px-5 py-4 text-right text-ww-text">
          ฿{totaux.resort.toLocaleString()}
        </td>
        <td className="px-5 py-4 text-right text-ww-lime text-xl">
          ฿{totaux.revenus.toLocaleString()}
        </td>
        <td className="px-5 py-4 text-right text-ww-danger text-xl">
          ฿{totaux.depenses.toLocaleString()}
        </td>
        <td className={`px-5 py-4 text-right text-xl ${
          profitNet >= 0 ? 'text-ww-lime' : 'text-ww-danger'
        }`}>
          {profitNet >= 0 ? '+' : ''}฿{profitNet.toLocaleString()}
        </td>
        <td />
      </tr>
    </tfoot>
  )
}
