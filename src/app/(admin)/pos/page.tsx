import { getGymPasses, getFnbProducts, getClients, getBungalows } from '@/lib/data-access'
import { PosRouter } from './pos-router'

type TabId = 'gym' | 'fnb' | 'serviettes'
const VALID_TABS: TabId[] = ['gym', 'fnb', 'serviettes']

export default async function PosPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const [gymPassesAll, fnbProductsAll, clients, bungalows, params] = await Promise.all([
    getGymPasses(),
    getFnbProducts(),
    getClients(),
    getBungalows(),
    searchParams,
  ])

  const gymPasses = gymPassesAll.filter((p) => p.actif !== false)
  const fnbProducts = fnbProductsAll.filter((p) => p.actif !== false)
  const defaultTab = VALID_TABS.includes(params.tab as TabId) ? (params.tab as TabId) : undefined

  return (
    <PosRouter
      gymPasses={gymPasses}
      fnbProducts={fnbProducts}
      clients={clients}
      bungalows={bungalows}
      defaultTab={defaultTab}
    />
  )
}
