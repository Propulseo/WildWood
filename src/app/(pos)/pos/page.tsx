import { Button } from '@/components/ui/button'

export default function PosPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 p-4">
      <h2 className="font-display text-3xl font-bold uppercase">Caisse</h2>
      <p className="text-muted-foreground text-center max-w-md">
        L&apos;interface de caisse sera construite dans la Phase 2.
        Les passes gym et produits F&amp;B apparaitront ici.
      </p>
      <div className="flex gap-4">
        <Button variant="pos" size="pos">
          Passes Gym
        </Button>
        <Button variant="pos-accent" size="pos">
          F&amp;B
        </Button>
      </div>
    </div>
  )
}
