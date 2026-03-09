'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { Card } from '@/components/ui/card'
import { COLORS } from './stats-shared'

/* ------------------------------------------------------------------ */
/*  KPI Summary Row                                                   */
/* ------------------------------------------------------------------ */
export function StatsKpiRow({
  kpis,
}: {
  kpis: { totalRevenue: number; totalExpenses: number; avgTxn: number; topDay: string }
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <Card className="p-5">
        <div className="ww-label mb-1">REVENU TOTAL</div>
        <div className="font-display font-extrabold text-2xl text-ww-orange">
          &#3647; {kpis.totalRevenue.toLocaleString()}
        </div>
      </Card>
      <Card className="p-5">
        <div className="ww-label mb-1">DEPENSES TOTALES</div>
        <div className="font-display font-extrabold text-2xl text-ww-danger">
          &#3647; {kpis.totalExpenses.toLocaleString()}
        </div>
      </Card>
      <Card className="p-5">
        <div className="ww-label mb-1">PANIER MOYEN</div>
        <div className="font-display font-extrabold text-2xl text-ww-text">
          &#3647; {kpis.avgTxn.toLocaleString()}
        </div>
      </Card>
      <Card className="p-5">
        <div className="ww-label mb-1">MEILLEUR JOUR</div>
        <div className="font-display font-extrabold text-2xl text-ww-lime">
          {kpis.topDay}
        </div>
      </Card>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Donut Card (Payment methods / Client types)                       */
/* ------------------------------------------------------------------ */
type DonutEntry = { name: string; value: number; color: string; count?: number }

function DonutCard({
  title,
  data,
  renderLegend,
}: {
  title: string
  data: DonutEntry[]
  renderLegend: (data: DonutEntry[]) => React.ReactNode
}) {
  return (
    <Card className="p-5">
      <h3 className="font-display text-lg font-bold text-ww-text mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={70} strokeWidth={0}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number | string | undefined) => [`${Number(value ?? 0).toLocaleString()} THB`]}
            contentStyle={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: '8px', color: COLORS.text }}
          />
        </PieChart>
      </ResponsiveContainer>
      {renderLegend(data)}
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/*  Bottom 3-column cards row                                         */
/* ------------------------------------------------------------------ */
export function BottomSummaryCards({
  paymentData,
  clientTypes,
  monthlyData,
}: {
  paymentData: { name: string; count: number; value: number; color: string }[]
  clientTypes: { name: string; value: number; color: string }[]
  monthlyData: { mois: string; revenus: number; depenses: number; solde: number }[]
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <DonutCard
        title="Modes de paiement"
        data={paymentData}
        renderLegend={(data) => (
          <div className="space-y-2 mt-2">
            {data.map((entry) => (
              <div key={entry.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-ww-text">{entry.name}</span>
                </div>
                <div className="text-right">
                  <span className="font-display font-bold">{entry.count}</span>
                  <span className="text-ww-muted text-xs ml-1">txns</span>
                </div>
              </div>
            ))}
          </div>
        )}
      />

      <DonutCard
        title="Types de clients"
        data={clientTypes}
        renderLegend={(data) => (
          <div className="space-y-2 mt-2">
            {data.map((entry) => (
              <div key={entry.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-ww-text">{entry.name}</span>
                </div>
                <span className="font-display font-bold">{entry.value}</span>
              </div>
            ))}
          </div>
        )}
      />

      <Card className="p-5">
        <h3 className="font-display text-lg font-bold text-ww-text mb-4">Solde net mensuel</h3>
        <div className="space-y-2">
          {monthlyData
            .filter((m) => m.revenus > 0 || m.depenses > 0)
            .map((m) => {
              const maxVal = Math.max(...monthlyData.map((d) => Math.abs(d.solde))) || 1
              const pct = Math.round((Math.abs(m.solde) / maxVal) * 100)
              return (
                <div key={m.mois}>
                  <div className="flex items-center justify-between text-xs mb-0.5">
                    <span className="text-ww-muted uppercase">{m.mois}</span>
                    <span className={`font-display font-bold ${m.solde >= 0 ? 'text-ww-success' : 'text-ww-danger'}`}>
                      {m.solde >= 0 ? '+' : ''}{m.solde.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-1.5 bg-ww-surface-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, backgroundColor: m.solde >= 0 ? COLORS.success : COLORS.danger }}
                    />
                  </div>
                </div>
              )
            })}
        </div>
      </Card>
    </div>
  )
}
