'use client'

import { useState } from 'react'
import { useTables } from '@/contexts/tables-context'
import { useAuth } from '@/lib/contexts/auth-context'
import { TablesKpiHeader } from '@/components/tables/TablesKpiHeader'
import { TableCardLarge } from '@/components/tables/TableCardLarge'
import { TablesPayeesSection } from '@/components/tables/TablesPayeesSection'
import { PaiementCashModal } from '@/components/bar/PaiementCashModal'
import { OuvrirTableModal } from '@/components/bar/OuvrirTableModal'
import type { TableOuverte } from '@/lib/types'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'

function nowISO() { return new Date().toISOString().slice(0, 19) }

export default function TablesPage() {
  const t = useTranslations('tables')
  const tPos = useTranslations('pos')
  const { tables, addTable, encaisserTable, getTablesOuvertes } = useTables()
  const { staffMember } = useAuth()
  const [paiementTable, setPaiementTable] = useState<TableOuverte | null>(null)
  const [paiementOpen, setPaiementOpen] = useState(false)
  const [ouvrirOpen, setOuvrirOpen] = useState(false)

  const ouvertes = getTablesOuvertes()
  const payees = tables.filter((t) => t.statut === 'payee')

  const handleEncaisser = (tableId: string) => {
    const t = ouvertes.find((t) => t.id === tableId)
    if (t) { setPaiementTable(t); setPaiementOpen(true) }
  }

  const handlePaiementConfirm = () => {
    if (!paiementTable) return
    encaisserTable(paiementTable.id, staffMember?.id)
    toast.success(t('tableCollected', { name: paiementTable.nom_table }), {
      description: `฿ ${paiementTable.total_thb.toLocaleString()} — ${paiementTable.client_nom}`,
    })
    setPaiementOpen(false)
    setPaiementTable(null)
  }

  const handleAddToTable = (tableId: string) => {
    toast.info(t('redirectFnb'), { description: t('addItemsHint') })
  }

  const handleOuvrirTable = (clientNom: string, nomTable: string) => {
    addTable({
      id: `tab-${Date.now()}`, nom_table: nomTable, client_nom: clientNom,
      type_client: 'externe', bungalow_id: null, items: [], total_thb: 0,
      heure_ouverture: nowISO(), statut: 'ouverte',
      staff_ouverture: staffMember?.id ?? '',
    })
    toast.success(`${tPos('tableOpened')}: ${nomTable}`, { description: clientNom })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-ww-text tracking-tight">{t('title')}</h1>
          <p className="text-ww-muted text-sm mt-1">{t('management')}</p>
        </div>
        <button
          onClick={() => setOuvrirOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-ww-orange text-white font-display font-bold text-sm uppercase tracking-wider hover:bg-ww-orange/90 transition-all active:scale-[0.97]"
        >
          <Plus className="h-4 w-4" />
          {t('newTable').toUpperCase()}
        </button>
      </div>

      {/* KPIs */}
      <TablesKpiHeader ouvertes={ouvertes} payees={payees} />

      {/* Active tables grid */}
      {ouvertes.length === 0 ? (
        <div className="bg-ww-surface border border-ww-border rounded-xl p-12 text-center">
          <p className="text-ww-muted font-sans text-sm">{t('noOpenTable')}</p>
          <p className="text-ww-muted/60 text-xs mt-1">{t('noOpenTableHint')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ouvertes.map((table) => (
            <TableCardLarge
              key={table.id}
              table={table}
              onAdd={handleAddToTable}
              onEncaisser={handleEncaisser}
            />
          ))}
        </div>
      )}

      {/* Historique */}
      <TablesPayeesSection tables={payees} />

      {/* Modals */}
      <PaiementCashModal
        open={paiementOpen}
        total={paiementTable?.total_thb ?? 0}
        onConfirm={handlePaiementConfirm}
        onCancel={() => { setPaiementOpen(false); setPaiementTable(null) }}
        table={paiementTable ?? undefined}
      />
      <OuvrirTableModal open={ouvrirOpen} onClose={() => setOuvrirOpen(false)} onConfirm={handleOuvrirTable} />
    </div>
  )
}
