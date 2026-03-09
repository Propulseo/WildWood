'use client'

import { useMemo } from 'react'
import { useClosings } from '@/contexts/closings-context'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import type { ClosingStatut } from '@/lib/types-reporting'

const STATUT_CONFIG: Record<ClosingStatut, { label: string; class: string }> = {
  soumis: { label: 'En attente', class: 'bg-ww-orange/15 text-ww-orange' },
  valide_admin: { label: 'Valide', class: 'bg-ww-lime-glow text-ww-lime' },
  litige: { label: 'Litige', class: 'bg-red-500/10 text-ww-danger' },
}

export default function HistoriqueClosings() {
  const { closings } = useClosings()

  const sorted = useMemo(
    () => [...closings].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 30),
    [closings]
  )

  if (sorted.length === 0) {
    return (
      <Card className="p-8 text-center text-ww-muted text-sm">
        Aucun closing enregistre
      </Card>
    )
  }

  return (
    <Card>
      <div className="px-5 pt-5 pb-3">
        <h3 className="font-display text-lg font-bold">Historique des closings</h3>
        <p className="text-xs text-ww-muted">30 derniers jours</p>
      </div>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Staff</TableHead>
              <TableHead className="text-right">CA jour</TableHead>
              <TableHead className="text-right">Compte</TableHead>
              <TableHead className="text-right">Ecart</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Valide par</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((c) => {
              const cfg = STATUT_CONFIG[c.statut]
              return (
                <TableRow key={c.id}>
                  <TableCell className="font-mono text-xs">
                    {format(parseISO(c.date), 'dd/MM', { locale: fr })}
                  </TableCell>
                  <TableCell className="text-sm">{c.soumis_par}</TableCell>
                  <TableCell className="text-right font-display font-bold">
                    {c.ca_jour.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-display">
                    {c.cash_compte.toLocaleString()}
                  </TableCell>
                  <TableCell className={`text-right font-display font-bold ${
                    c.ecart === 0 ? 'text-ww-muted' : Math.abs(c.ecart) <= 50 ? 'text-ww-lime' : 'text-ww-danger'
                  }`}>
                    {c.ecart === 0 ? '-' : `${c.ecart >= 0 ? '+' : ''}${c.ecart.toLocaleString()}`}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${cfg.class}`}>
                      {cfg.label}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-ww-muted">
                    {c.valide_par || '-'}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
