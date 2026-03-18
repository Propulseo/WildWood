'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { getPeriodeDates } from '@/lib/supabase/queries/reporting'
import { calculerEtInsererRevenuResort } from '@/lib/supabase/queries/resort'
import { useAuth } from '@/lib/contexts/auth-context'
import { AjouterRevenuManuelModal } from '@/components/revenus/AjouterRevenuManuelModal'
import { RevenusKpi } from '@/components/revenus/RevenusKpi'
import { RevenusListe } from '@/components/revenus/RevenusListe'

type Periode = 'today' | 'week' | 'month' | 'year'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TxRow = any

const PERIODES = [
  { value: 'today' as const, label: "AUJOURD'HUI" },
  { value: 'week' as const, label: 'CETTE SEMAINE' },
  { value: 'month' as const, label: 'CE MOIS' },
  { value: 'year' as const, label: 'CETTE ANNEE' },
]

const BU_CONFIG = {
  gym:    { label: 'GYM',       color: 'text-ww-orange' },
  fnb:    { label: 'F&B',       color: 'text-ww-lime' },
  resort: { label: 'BUNGALOWS', color: 'text-ww-wood' },
} as const

export default function RevenusPage() {
  const { staffMember } = useAuth()
  const [periode, setPeriode] = useState<Periode>('today')
  const [transactions, setTransactions] = useState<TxRow[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddManuel, setShowAddManuel] = useState(false)
  const [calculatingResort, setCalculatingResort] = useState(false)

  const fetchTransactions = useCallback(async () => {
    const { from, to } = getPeriodeDates(periode)
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('type', 'income')
      .gte('date', from)
      .lte('date', to)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })

    if (!error) setTransactions(data ?? [])
    setLoading(false)
  }, [periode])

  useEffect(() => { fetchTransactions() }, [fetchTransactions])

  const totaux = transactions.reduce((acc: Record<string, number>, t: TxRow) => {
    acc.total += t.montant_thb
    acc[t.business_unit] = (acc[t.business_unit] || 0) + t.montant_thb
    return acc
  }, { total: 0, gym: 0, fnb: 0, resort: 0 })

  const handleCalculerResort = async () => {
    if (!staffMember) return
    setCalculatingResort(true)
    try {
      const today = new Date().toISOString().split('T')[0]
      const result = await calculerEtInsererRevenuResort(today, staffMember.id)
      if (result) {
        toast.success('Revenu resort calcule et enregistre')
        fetchTransactions()
      } else {
        toast('Aucun bungalow occupe aujourd\'hui')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur calcul resort')
    } finally {
      setCalculatingResort(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <h1 className="font-display text-5xl font-bold">REVENUS</h1>
        <div className="flex gap-2">
          <button onClick={handleCalculerResort}
            disabled={calculatingResort || periode !== 'today'}
            className="flex items-center gap-2 border border-ww-wood text-ww-wood
                       px-4 py-2 rounded-xl text-sm hover:bg-ww-wood/10
                       disabled:opacity-40 transition-all">
            {calculatingResort ? 'Calcul...' : 'Calcul resort'}
          </button>
          <button onClick={() => setShowAddManuel(true)}
            className="flex items-center gap-2 bg-ww-orange text-white
                       px-4 py-2 rounded-xl text-sm hover:bg-ww-orange/90">
            + Ajouter un revenu
          </button>
        </div>
      </div>

      {/* Filtres période */}
      <div className="flex gap-2 flex-wrap">
        {PERIODES.map(p => (
          <button key={p.value} onClick={() => setPeriode(p.value)}
            className={`px-4 py-2 rounded-lg font-display text-sm transition-all ${
              periode === p.value
                ? 'bg-ww-orange text-white'
                : 'bg-ww-surface-2 border border-ww-border text-ww-muted'
            }`}>
            {p.label}
          </button>
        ))}
      </div>

      {/* KPI + Total */}
      <RevenusKpi totaux={totaux} buConfig={BU_CONFIG} nbTransactions={transactions.length} />

      {/* Liste par date */}
      <RevenusListe
        transactions={transactions}
        loading={loading}
        buConfig={BU_CONFIG}
      />

      {/* Modal ajout manuel */}
      {showAddManuel && staffMember && (
        <AjouterRevenuManuelModal
          staffId={staffMember.id}
          onClose={() => setShowAddManuel(false)}
          onSuccess={() => {
            toast.success('Revenu enregistre')
            fetchTransactions()
            setShowAddManuel(false)
          }}
        />
      )}
    </div>
  )
}
