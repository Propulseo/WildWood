'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import {
  Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { ChevronDown, ChevronRight } from 'lucide-react'
import type { Transaction, Client, Bungalow } from '@/lib/types'
import { getClients, getBungalows } from '@/lib/data-access'

interface DetailBungalowsProps {
  transactions: Transaction[]
}

export function DetailBungalows({ transactions }: DetailBungalowsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [bungalows, setBungalows] = useState<Bungalow[]>([])

  useEffect(() => {
    getClients().then(setClients)
    getBungalows().then(setBungalows)
  }, [])

  const bungalowTxns = useMemo(
    () => transactions.filter((t) => t.centreRevenu === 'Bungalows'),
    [transactions]
  )

  // Compute brut/net totals from reservation data
  const { totalBrut, totalNet, totalNuits, rows } = useMemo(() => {
    let brut = 0, net = 0, nuits = 0
    const r = bungalowTxns.map((t) => {
      const itemName = t.items[0]?.nom || ''
      const nuitMatch = itemName.match(/(\d+)\s*nuits?/)
      const n = nuitMatch ? parseInt(nuitMatch[1]) : 0
      const bungalowMatch = itemName.match(/Bungalow\s*(\d+)/)
      const bNum = bungalowMatch ? parseInt(bungalowMatch[1]) : 0
      // Find matching reservation for brut/net data
      const bung = bungalows.find(b => b.numero === bNum)
      const res = bung?.reservations.find(rv =>
        rv.prix_total_brut && rv.nuits === n && rv.clientId === t.clientId
      )
      const rowBrut = res?.prix_total_brut ?? t.total
      const rowNet = res?.prix_total_net ?? t.total
      brut += rowBrut
      net += rowNet
      nuits += n
      return { txn: t, nuits: n, bungalowNum: bNum ? bNum.toString() : '?', brut: rowBrut, net: rowNet }
    })
    return { totalBrut: brut, totalNet: net, totalNuits: nuits, rows: r }
  }, [bungalowTxns, bungalows])

  const commissionPct = ((1 - 0.8142) * 100).toFixed(2)
  const commissionAmount = totalBrut - totalNet

  return (
    <Card className="p-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full text-left"
      >
        {isOpen ? <ChevronDown className="h-5 w-5 text-ww-orange" /> : <ChevronRight className="h-5 w-5 text-ww-muted" />}
        <span className="text-2xl">{'\u{1F3E0}'}</span>
        <h3 className="font-display font-bold text-lg text-ww-text">Detail Bungalows</h3>
        <span className="ml-auto font-display font-extrabold text-xl" style={{ color: 'var(--ww-lime)' }}>
          {'\u0E3F'} {totalNet.toLocaleString()} NET
        </span>
      </button>

      {isOpen && (
        <div className="mt-4 space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bungalow</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Nuits</TableHead>
                <TableHead className="text-right">Brut (Booking)</TableHead>
                <TableHead className="text-right">Net (WildWood)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-ww-muted">
                    Aucune transaction bungalow sur cette periode
                  </TableCell>
                </TableRow>
              ) : (
                rows.map(({ txn: t, nuits: n, bungalowNum, brut, net }) => {
                  const client = clients.find((c) => c.id === t.clientId)
                  return (
                    <TableRow key={t.id}>
                      <TableCell className="font-display font-bold">B{bungalowNum}</TableCell>
                      <TableCell className="font-sans">
                        {client ? `${client.prenom} ${client.nom}` : t.clientId || '\u2014'}
                      </TableCell>
                      <TableCell className="text-ww-muted font-mono text-sm">
                        {new Date(t.date).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell className="text-right font-display">{n}</TableCell>
                      <TableCell className="text-right font-display text-ww-muted">
                        {'\u0E3F'} {brut.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-display font-bold" style={{ color: 'var(--ww-lime)' }}>
                        {'\u0E3F'} {net.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
            {rows.length > 0 && (
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={3} className="font-bold">TOTAL</TableCell>
                  <TableCell className="text-right font-display font-bold">{totalNuits}</TableCell>
                  <TableCell className="text-right font-display text-ww-muted">
                    {'\u0E3F'} {totalBrut.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-display font-bold" style={{ color: 'var(--ww-lime)' }}>
                    {'\u0E3F'} {totalNet.toLocaleString()}
                  </TableCell>
                </TableRow>
              </TableFooter>
            )}
          </Table>

          <div className="bg-ww-surface-2 border border-ww-border rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-ww-muted">Brut Booking</span>
              <span className="text-ww-muted">{'\u0E3F'} {totalBrut.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-ww-muted">Commission Booking ({commissionPct}%)</span>
              <span className="text-ww-danger">-{'\u0E3F'} {commissionAmount.toLocaleString()}</span>
            </div>
            <div className="border-t border-ww-border pt-2 flex justify-between">
              <span className="font-display font-bold text-sm text-ww-text uppercase">NET ENCAISSE</span>
              <span className="font-display font-extrabold text-lg" style={{ color: 'var(--ww-lime)' }}>
                {'\u0E3F'} {totalNet.toLocaleString()}
              </span>
            </div>
            <p className="text-[11px] text-ww-muted font-sans">
              Prix nets = prix Booking {'\u00D7'} 0.8142 (taux net apres commission)
            </p>
          </div>
        </div>
      )}
    </Card>
  )
}
