'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { RoleToggle } from '@/components/role-toggle'
import { LayoutDashboard, Users, Home, Calculator, Mail, Camera } from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/bungalows', label: 'Bungalows', icon: Home },
  { href: '/comptabilite', label: 'Comptabilite', icon: Calculator },
  { href: '/newsletter', label: 'Newsletter', icon: Mail },
  { href: '/instagram', label: 'Instagram', icon: Camera },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-dvh bg-background text-foreground flex">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar-background text-sidebar-foreground flex flex-col shrink-0">
        <div className="p-4 border-b border-sidebar-border">
          <h1 className="font-display text-lg font-bold uppercase tracking-wider">
            WildWood
          </h1>
          <p className="text-xs text-sidebar-foreground/60">Administration</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'hover:bg-sidebar-accent/10 text-sidebar-foreground/80'
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {label}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-dvh">
        <header className="flex items-center justify-end px-6 py-3 border-b border-border">
          <RoleToggle />
        </header>
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
