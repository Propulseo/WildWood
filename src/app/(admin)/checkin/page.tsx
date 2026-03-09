'use client'

import { useState, useMemo, useEffect } from 'react'
import { toast } from 'sonner'
import { useActivePasses } from '@/contexts/active-passes-context'
import { useTransactions } from '@/contexts/transactions-context'
import { getCheckins } from '@/lib/data-access'
import type { CheckinEntry } from '@/lib/types'
import { LiveCounter } from '@/components/checkin/LiveCounter'
import { SearchBar } from '@/components/checkin/SearchBar'
import { ClientResultCard } from '@/components/checkin/ClientResultCard'
import { ListeEntreesDuJour } from '@/components/checkin/ListeEntreesDuJour'
import { KpiCards } from '@/components/checkin/KpiCards'
import { UpgradeModal } from '@/components/checkin/UpgradeModal'
import { HourlyActivityChart } from '@/components/checkin/HourlyActivityChart'

const TODAY = '2026-03-06'

const PASS_LABELS: Record<string, string> = {
  '3_jours': '3j',
  '1_semaine': '1 sem',
  '1_mois': '1 mois',
}

function formatDate(iso: string) {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

export default function CheckinPage() {
  const { activePasses, addCheckin } = useActivePasses()
  const { transactions, addTransaction } = useTransactions()
  const [search, setSearch] = useState('')
  const [checkins, setCheckins] = useState<CheckinEntry[]>([])
  const [upgrading, setUpgrading] = useState<CheckinEntry | null>(null)

  useEffect(() => {
    getCheckins().then(setCheckins)
  }, [])

  const activeOnly = useMemo(
    () => activePasses.filter((p) => p.actif && p.dateExpiration >= TODAY),
    [activePasses]
  )

  const todayCheckins = useMemo(
    () => checkins.filter((c) => c.date_entree === TODAY),
    [checkins]
  )

  const filtered = useMemo(() => {
    if (search.trim().length < 2) return []
    const q = search.toLowerCase()
    return activeOnly.filter((p) => p.clientNom.toLowerCase().includes(q))
  }, [search, activeOnly])

  const gymCount = todayCheckins.filter((e) => e.type_entree === 'gym_pass').length
  const residentCount = todayCheckins.filter((e) => e.type_entree === 'hotel_resident').length
  const totalEncaisse = todayCheckins.reduce((s, e) => {
    const upgradePrix = e.upgrade_effectue ? e.upgrade_effectue.prix_upgrade : 0
    return s + e.prix_paye + upgradePrix
  }, 0)

  function handleCheckin(passId: string) {
    const now = new Date()
    const heure = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    addCheckin(passId, { date: TODAY, heure })
  }

  function handleUpgradeConfirm(entry: CheckinEntry, vers: string, prixUpgrade: number) {
    const now = new Date()
    const heure = `${String(now.getHours()).padStart(2, '0')}h${String(now.getMinutes()).padStart(2, '0')}`

    setCheckins((prev) =>
      prev.map((c) =>
        c.id === entry.id
          ? { ...c, upgrade_effectue: { vers, prix_upgrade: prixUpgrade, heure } }
          : c
      )
    )

    addTransaction({
      id: `txn-upg-${Date.now()}`,
      date: new Date().toISOString(),
      type: 'upgrade_pass',
      centreRevenu: 'Gym',
      clientId: entry.client_id,
      items: [{
        produitId: `pass-${vers}`,
        nom: `Upgrade 1j → ${PASS_LABELS[vers] || vers} · ${entry.client_nom}`,
        quantite: 1,
        prixUnitaire: prixUpgrade,
        sousTotal: prixUpgrade,
      }],
      total: prixUpgrade,
      methode: 'especes',
    })

    toast.success(
      `${entry.client_nom} upgradee · PASS ${(PASS_LABELS[vers] || vers).toUpperCase()} · ฿ ${prixUpgrade.toLocaleString('fr-FR')} encaisses`
    )

    setUpgrading(null)
  }

  return (
    <div className="w-full px-6 py-6 space-y-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-ww-text tracking-tight uppercase">
          Entrees du jour
        </h1>
        <p className="text-ww-muted text-sm mt-1 font-sans">{formatDate(TODAY)}</p>
      </div>

      <LiveCounter count={todayCheckins.length} />

      <div className="flex flex-col-reverse lg:flex-row gap-6">
        <div className="lg:w-3/5 space-y-4">
          <div className="sticky top-0 z-10 py-2 bg-ww-bg">
            <SearchBar value={search} onChange={setSearch} />
          </div>

          {filtered.length > 0 && (
            <div className="space-y-2">
              {filtered.map((pass) => {
                const already = pass.checkins.some((c) => c.date === TODAY)
                return (
                  <ClientResultCard
                    key={pass.id}
                    pass={pass}
                    alreadyCheckedIn={already}
                    onCheckin={handleCheckin}
                  />
                )
              })}
            </div>
          )}

          <ListeEntreesDuJour
            entries={checkins}
            today={TODAY}
            onUpgrade={setUpgrading}
          />
        </div>

        <div className="lg:w-2/5 space-y-4">
          <KpiCards
            gymCount={gymCount}
            residentCount={residentCount}
            totalEncaisse={totalEncaisse}
          />
          <button className="w-full py-3 rounded-lg bg-ww-orange text-ww-bg font-display font-bold text-base uppercase tracking-wide hover:translate-y-[-2px] active:scale-[0.97] transition-all duration-150">
            Enregistrer une entree
          </button>
        </div>
      </div>

      <div className="border-t border-ww-border pt-4">
        <HourlyActivityChart
          checkins={checkins}
          transactions={transactions}
          today={TODAY}
        />
      </div>

      {upgrading && (
        <UpgradeModal
          entry={upgrading}
          onClose={() => setUpgrading(null)}
          onConfirm={handleUpgradeConfirm}
        />
      )}
    </div>
  )
}
