'use client'

import { useMemo } from 'react'
import { useReporting } from '@/contexts/reporting-context'
import type { BusinessUnit } from '@/lib/types-reporting'
import { parseISO, startOfWeek, addDays, format, isSameDay } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter,
} from '@/components/ui/table'

const DAY_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

interface DayData {
  date: Date
  label: string
  dateStr: string
  revenus: number
  depenses: number
  profit: number
}

export default function TableauSemaine({ activeBus }: { activeBus: BusinessUnit[] }) {
  const { revenues, expensesDaily, mockToday } = useReporting()

  const weekData = useMemo(() => {
    const today = parseISO(mockToday)
    const monday = startOfWeek(today, { weekStartsOn: 1 })

    return DAY_LABELS.map((label, i): DayData => {
      const date = addDays(monday, i)
      const dateStr = format(date, 'yyyy-MM-dd')
      const revenus = revenues
        .filter((r) => r.date === dateStr && activeBus.includes(r.bu))
        .reduce((s, r) => s + r.montant, 0)
      const depenses = expensesDaily
        .filter((e) => e.date === dateStr && activeBus.includes(e.bu))
        .reduce((s, e) => s + e.montant, 0)
      return { date, label, dateStr, revenus, depenses, profit: revenus - depenses }
    })
  }, [revenues, expensesDaily, mockToday, activeBus])

  const totals = useMemo(() => ({
    revenus: weekData.reduce((s, d) => s + d.revenus, 0),
    depenses: weekData.reduce((s, d) => s + d.depenses, 0),
    profit: weekData.reduce((s, d) => s + d.profit, 0),
  }), [weekData])

  const bestDay = useMemo(
    () => weekData.reduce((best, d) => (d.profit > best.profit ? d : best), weekData[0]),
    [weekData]
  )
  const worstDay = useMemo(
    () => weekData.reduce((worst, d) => (d.profit < worst.profit ? d : worst), weekData[0]),
    [weekData]
  )

  const chartData = weekData.map((d) => ({
    jour: d.label,
    revenus: d.revenus,
    depenses: d.depenses,
    profit: d.profit,
    isToday: isSameDay(d.date, parseISO(mockToday)),
  }))

  const tooltipStyle = {
    backgroundColor: 'var(--ww-surface)',
    border: '1px solid var(--ww-orange)',
    borderRadius: '8px',
    color: 'var(--ww-text)',
  }

  return (
    <div className="space-y-4">
      {/* Mini bar chart */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-base font-bold">
            {format(weekData[0].date, 'd MMM', { locale: fr })} — {format(weekData[6].date, 'd MMM yyyy', { locale: fr })}
          </h3>
          <div className="flex items-center gap-4 text-xs text-ww-muted">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-ww-lime inline-block" /> Revenus
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-ww-danger inline-block" /> Depenses
            </span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={chartData} barGap={2}>
            <XAxis dataKey="jour" stroke="var(--ww-muted)" tick={{ fill: 'var(--ww-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number | string | undefined) => [`${Number(v ?? 0).toLocaleString()} THB`]} />
            <Bar dataKey="revenus" radius={[3, 3, 0, 0]}>
              {chartData.map((d, i) => (
                <Cell key={i} fill={d.isToday ? 'var(--ww-orange)' : 'var(--ww-lime)'} opacity={d.isToday ? 1 : 0.7} />
              ))}
            </Bar>
            <Bar dataKey="depenses" fill="var(--ww-danger)" radius={[3, 3, 0, 0]} opacity={0.5} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Detail table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Jour</TableHead>
                <TableHead className="w-20 text-xs">Date</TableHead>
                <TableHead className="text-right">Revenus</TableHead>
                <TableHead className="text-right">Depenses</TableHead>
                <TableHead className="text-right">Profit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {weekData.map((d) => {
                const isToday = isSameDay(d.date, parseISO(mockToday))
                const isBest = d === bestDay && d.profit > 0
                const isWorst = d === worstDay && d.revenus > 0
                return (
                  <TableRow
                    key={d.label}
                    className={
                      isToday ? 'bg-ww-orange-glow' :
                      isBest ? 'bg-ww-lime-glow' :
                      isWorst ? 'bg-red-500/5' : ''
                    }
                  >
                    <TableCell className="font-display font-bold">
                      {d.label}
                      {isToday && <span className="ml-1 text-[9px] text-ww-orange font-sans font-normal">auj.</span>}
                    </TableCell>
                    <TableCell className="text-xs text-ww-muted font-mono">
                      {format(d.date, 'dd/MM')}
                    </TableCell>
                    <TableCell className="text-right font-display">
                      {d.revenus > 0 ? d.revenus.toLocaleString() : '-'}
                    </TableCell>
                    <TableCell className="text-right font-display text-ww-danger">
                      {d.depenses > 0 ? d.depenses.toLocaleString() : '-'}
                    </TableCell>
                    <TableCell className={`text-right font-display font-bold ${
                      d.profit >= 0 ? 'text-ww-success' : 'text-ww-danger'
                    }`}>
                      {d.revenus > 0 ? d.profit.toLocaleString() : '-'}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={2} className="font-bold">TOTAL</TableCell>
                <TableCell className="text-right font-display font-bold">
                  {totals.revenus.toLocaleString()}
                </TableCell>
                <TableCell className="text-right font-display font-bold text-ww-danger">
                  {totals.depenses.toLocaleString()}
                </TableCell>
                <TableCell className={`text-right font-display font-bold ${
                  totals.profit >= 0 ? 'text-ww-success' : 'text-ww-danger'
                }`}>
                  {totals.profit.toLocaleString()}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
