'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import {
  Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { ChevronDown, ChevronRight } from 'lucide-react'
import type { Transaction, RoomCharge } from '@/lib/types'
import { getRoomCharges } from '@/lib/data-access'
import { parseISO, format, isWithinInterval, startOfDay, endOfDay } from 'date-fns'

interface DetailFnBProps {
  transactions: Transaction[]
}

export function DetailFnB({ transactions }: DetailFnBProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [roomCharges, setRoomCharges] = useState<RoomCharge[]>([])

  useEffect(() => {
    getRoomCharges().then(setRoomCharges)
  }, [])

  const fnbTxns = useMemo(
    () => transactions.filter((t) => t.centreRevenu === 'F&B'),
    [transactions]
  )

  const filteredRoomCharges = useMemo(() => {
    const dates = transactions.map((t) => parseISO(t.date))
    if (dates.length === 0) return []
    const minDate = startOfDay(new Date(Math.min(...dates.map((d) => d.getTime()))))
    const maxDate = endOfDay(new Date(Math.max(...dates.map((d) => d.getTime()))))
    return roomCharges.filter((rc) => isWithinInterval(parseISO(rc.date), { start: minDate, end: maxDate }))
  }, [roomCharges, transactions])

  const comptoirTotal = fnbTxns.reduce((s, t) => s + t.total, 0)
  const bungalowTotal = filteredRoomCharges.reduce((s, rc) => s + rc.total, 0)
  const totalAmount = comptoirTotal + bungalowTotal

  const byDate = useMemo(() => {
    const map: Record<string, { isoKey: string; display: string; comptoir: number; cCount: number; bungalow: number; bCount: number }> = {}
    fnbTxns.forEach((t) => {
      const d = parseISO(t.date)
      const isoKey = format(d, 'yyyy-MM-dd')
      const display = format(d, 'dd/MM/yyyy')
      if (!map[isoKey]) map[isoKey] = { isoKey, display, comptoir: 0, cCount: 0, bungalow: 0, bCount: 0 }
      map[isoKey].comptoir += t.total
      map[isoKey].cCount++
    })
    filteredRoomCharges.forEach((rc) => {
      const d = parseISO(rc.date)
      const isoKey = format(d, 'yyyy-MM-dd')
      const display = format(d, 'dd/MM/yyyy')
      if (!map[isoKey]) map[isoKey] = { isoKey, display, comptoir: 0, cCount: 0, bungalow: 0, bCount: 0 }
      map[isoKey].bungalow += rc.total
      map[isoKey].bCount++
    })
    return Object.values(map).sort((a, b) => a.isoKey.localeCompare(b.isoKey))
  }, [fnbTxns, filteredRoomCharges])

  const top5 = useMemo(() => {
    const map: Record<string, { nom: string; qty: number; total: number }> = {}
    const addItems = (items: { nom: string; quantite: number; sousTotal: number }[]) => {
      items.forEach((item) => {
        if (!map[item.nom]) map[item.nom] = { nom: item.nom, qty: 0, total: 0 }
        map[item.nom].qty += item.quantite
        map[item.nom].total += item.sousTotal
      })
    }
    fnbTxns.forEach((t) => addItems(t.items))
    filteredRoomCharges.forEach((rc) => addItems(rc.items))
    return Object.values(map).sort((a, b) => b.qty - a.qty).slice(0, 5)
  }, [fnbTxns, filteredRoomCharges])

  return (
    <Card className="p-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full text-left"
      >
        {isOpen ? <ChevronDown className="h-5 w-5 text-ww-orange" /> : <ChevronRight className="h-5 w-5 text-ww-muted" />}
        <span className="text-2xl">🍹</span>
        <h3 className="font-display font-bold text-lg text-ww-text">Detail F&B</h3>
        <span className="ml-auto font-display font-extrabold text-xl text-ww-orange">
          ฿ {totalAmount.toLocaleString()}
        </span>
      </button>

      {isOpen && (
        <div className="mt-4 space-y-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Comptoir</TableHead>
                <TableHead className="text-right">Bungalow</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {byDate.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-ww-muted">
                    Aucune vente F&B sur cette periode
                  </TableCell>
                </TableRow>
              ) : (
                byDate.map((row) => (
                  <TableRow key={row.isoKey}>
                    <TableCell className="font-mono text-sm text-ww-muted">{row.display}</TableCell>
                    <TableCell className="text-right font-display">
                      {row.cCount > 0 ? `฿ ${row.comptoir.toLocaleString()}` : '—'}
                      {row.cCount > 0 && <span className="text-xs text-ww-muted ml-1">({row.cCount})</span>}
                    </TableCell>
                    <TableCell className="text-right font-display">
                      {row.bCount > 0 ? `฿ ${row.bungalow.toLocaleString()}` : '—'}
                      {row.bCount > 0 && <span className="text-xs text-ww-muted ml-1">({row.bCount})</span>}
                    </TableCell>
                    <TableCell className="text-right font-display font-bold">
                      ฿ {(row.comptoir + row.bungalow).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
            {byDate.length > 0 && (
              <TableFooter>
                <TableRow>
                  <TableCell className="font-bold">TOTAL</TableCell>
                  <TableCell className="text-right font-display font-bold">฿ {comptoirTotal.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-display font-bold">฿ {bungalowTotal.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-display font-bold text-ww-orange">
                    ฿ {totalAmount.toLocaleString()}
                  </TableCell>
                </TableRow>
              </TableFooter>
            )}
          </Table>

          {top5.length > 0 && (
            <div>
              <h4 className="font-display font-bold text-sm text-ww-muted uppercase mb-2">Top 5 produits</h4>
              <div className="space-y-1">
                {top5.map((p, i) => (
                  <div key={p.nom} className="flex items-center gap-3 text-sm">
                    <span className="font-display font-bold text-ww-orange w-5">{i + 1}.</span>
                    <span className="font-sans text-ww-text">{p.nom}</span>
                    <span className="text-ww-muted">—</span>
                    <span className="font-mono text-ww-muted">{p.qty}x vendus</span>
                    <span className="text-ww-muted">·</span>
                    <span className="font-display font-bold">฿ {p.total.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}
