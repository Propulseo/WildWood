import { getGymPasses, getFnbProducts, getClients, getBungalows } from '@/lib/data-access'
import { PosRegister } from '@/components/pos/pos-register'

export default async function PosPage() {
  const [gymPasses, fnbProducts, clients, bungalows] = await Promise.all([
    getGymPasses(),
    getFnbProducts(),
    getClients(),
    getBungalows(),
  ])

  return (
    <PosRegister
      gymPasses={gymPasses}
      fnbProducts={fnbProducts}
      clients={clients}
      bungalows={bungalows}
    />
  )
}
