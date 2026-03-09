import type { RoomCharge } from '@/lib/types'

interface CommandesFavoritesProps {
  roomCharges: RoomCharge[]
}

interface ProductAgg {
  nom: string
  quantite: number
  total: number
}

export function CommandesFavorites({ roomCharges }: CommandesFavoritesProps) {
  const prodMap = new Map<string, ProductAgg>()

  for (const rc of roomCharges) {
    for (const it of rc.items) {
      const existing = prodMap.get(it.produitId)
      if (existing) {
        existing.quantite += it.quantite
        existing.total += it.sousTotal
      } else {
        prodMap.set(it.produitId, {
          nom: it.nom,
          quantite: it.quantite,
          total: it.sousTotal,
        })
      }
    }
  }

  const top3 = Array.from(prodMap.values())
    .sort((a, b) => b.quantite - a.quantite)
    .slice(0, 3)

  if (top3.length === 0) return null

  return (
    <div className="space-y-3">
      <h2 className="font-display text-xl font-bold text-ww-text uppercase tracking-wide">
        Commandes favorites
      </h2>
      <div className="space-y-2">
        {top3.map((p) => (
          <div
            key={p.nom}
            className="flex items-center gap-3 p-3 rounded-lg bg-ww-surface border border-ww-border"
          >
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-sans text-ww-text">
                {p.nom}
                <span className="text-ww-muted ml-2">
                  — commande {p.quantite}&times;
                </span>
                <span className="text-ww-orange ml-2 font-bold">
                  {'\u0E3F'} {p.total.toLocaleString()} total
                </span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
