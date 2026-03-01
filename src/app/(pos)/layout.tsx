import { RoleToggle } from '@/components/role-toggle'

export default function PosLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="pos-theme h-dvh overflow-hidden bg-background text-foreground grid grid-rows-[auto_1fr]">
      <header className="flex items-center justify-between px-4 py-2 border-b border-border">
        <h1 className="font-display text-xl font-bold uppercase tracking-wider">
          WildWood POS
        </h1>
        <RoleToggle />
      </header>
      <main className="overflow-hidden">
        {children}
      </main>
    </div>
  )
}
