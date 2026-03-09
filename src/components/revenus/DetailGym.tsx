'use client'

import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import {
  Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { ChevronDown, ChevronRight } from 'lucide-react'
import type { Transaction } from '@/lib/types'

interface DetailGymProps {
  transactions: Transaction[]
}

export function DetailGym({ transactions }: DetailGymProps) {
  const [isOpen, setIsOpen] = useState(false)

  const gymTxns = useMemo(
    () => transactions.filter((t) => t.centreRevenu === 'Gym'),
    [transactions]
  )

  const grouped = useMemo(() => {
    const map: Record<string, { type: string; count: number; prixUnit: number; total: number; isUpgrade: boolean }> = {}
    gymTxns.forEach((t) => {
      t.items.forEach((item) => {
        const key = item.nom
        if (!map[key]) map[key] = { type: item.nom, count: 0, prixUnit: item.prixUnitaire, total: 0, isUpgrade: t.type === 'upgrade_pass' }
        map[key].count += item.quantite
        map[key].total += item.sousTotal
      })
    })
    return Object.values(map).sort((a, b) => b.total - a.total)
  }, [gymTxns])

  const totalPasses = grouped.reduce((s, g) => s + g.count, 0)
  const totalAmount = gymTxns.reduce((s, t) => s + t.total, 0)

  return (
    <Card className="p-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full text-left"
      >
        {isOpen ? <ChevronDown className="h-5 w-5 text-ww-orange" /> : <ChevronRight className="h-5 w-5 text-ww-muted" />}
        <span className="text-2xl">🎟️</span>
        <h3 className="font-display font-bold text-lg text-ww-text">Detail Gym</h3>
        <span className="ml-auto font-display font-extrabold text-xl text-ww-orange">
          ฿ {totalAmount.toLocaleString()}
        </span>
      </button>

      {isOpen && (
        <div className="mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type de pass</TableHead>
                <TableHead className="text-right">Nb vendus</TableHead>
                <TableHead className="text-right">Prix unit.</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grouped.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-ww-muted">
                    Aucune vente gym sur cette periode
                  </TableCell>
                </TableRow>
              ) : (
                grouped.map((g) => (
                  <TableRow key={g.type}>
                    <TableCell className="font-sans">
                      {g.type}
                      {g.isUpgrade && (
                        <span className="ml-2 text-xs bg-ww-lime/20 text-ww-lime px-2 py-0.5 rounded-full">
                          Upgrade
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-display">{g.count}</TableCell>
                    <TableCell className="text-right font-display text-ww-muted">
                      ฿ {g.prixUnit.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-display font-bold">
                      ฿ {g.total.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
            {grouped.length > 0 && (
              <TableFooter>
                <TableRow>
                  <TableCell className="font-bold">TOTAL</TableCell>
                  <TableCell className="text-right font-display font-bold">{totalPasses}</TableCell>
                  <TableCell />
                  <TableCell className="text-right font-display font-bold text-ww-orange">
                    ฿ {totalAmount.toLocaleString()}
                  </TableCell>
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </div>
      )}
    </Card>
  )
}
