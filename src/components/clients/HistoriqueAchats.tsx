import { format, parseISO } from 'date-fns'
import type { Transaction } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/components/ui/table'

const TYPE_LABELS: Record<string, string> = {
  'gym-pass': 'Gym',
  fnb: 'F&B',
  bungalow: 'Bungalow',
  upgrade_pass: 'Upgrade',
}

export function HistoriqueAchats({ achats }: { achats: Transaction[] }) {
  return (
    <div className="space-y-3">
      <h2 className="font-display text-xl font-bold text-ww-text">Historique des achats</h2>
      {achats.length === 0 ? (
        <p className="text-ww-muted">Aucun achat enregistre</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Articles</TableHead>
              <TableHead className="text-right">Montant</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {achats.map((t) => (
              <TableRow key={t.id}>
                <TableCell>
                  {format(parseISO(t.date), 'dd/MM/yyyy HH:mm')}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {TYPE_LABELS[t.type] ?? t.type}
                  </Badge>
                </TableCell>
                <TableCell>
                  {t.items.map((i) => i.nom).join(', ')}
                </TableCell>
                <TableCell className="text-right">
                  {t.total.toLocaleString()} THB
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
