'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { RoleToggle } from '@/components/role-toggle'
import { TransactionsProvider } from '@/contexts/transactions-context'
import {
  LayoutDashboard,
  Users,
  Home,
  Calculator,
  Mail,
  Camera,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'

const STORAGE_KEY = 'wildwood-sidebar-collapsed'

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
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'true') setIsCollapsed(true)
    setIsHydrated(true)
  }, [])

  function toggleSidebar() {
    setIsCollapsed((prev) => {
      const next = !prev
      localStorage.setItem(STORAGE_KEY, String(next))
      return next
    })
  }

  if (!isHydrated) return null

  return (
    <div className="min-h-dvh bg-background text-foreground flex">
      {/* Sidebar */}
      <aside
        className={`${
          isCollapsed ? 'w-16' : 'w-64'
        } bg-sidebar-background text-sidebar-foreground flex flex-col shrink-0 transition-all duration-300 ease-in-out`}
      >
        <div className="p-4 border-b border-sidebar-border">
          {isCollapsed ? (
            <h1 className="font-display text-lg font-bold uppercase tracking-wider text-center">
              W
            </h1>
          ) : (
            <>
              <h1 className="font-display text-lg font-bold uppercase tracking-wider">
                WildWood
              </h1>
              <p className="text-xs text-sidebar-foreground/60">Administration</p>
            </>
          )}
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                title={isCollapsed ? label : undefined}
                className={`flex items-center ${
                  isCollapsed ? 'justify-center px-2 py-2' : 'gap-3 px-3 py-2'
                } rounded-md text-sm transition-colors ${
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'hover:bg-sidebar-accent/10 text-sidebar-foreground/80'
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!isCollapsed && <span>{label}</span>}
              </Link>
            )
          })}
        </nav>
        <div className="p-3 border-t border-sidebar-border">
          <button
            onClick={toggleSidebar}
            title={isCollapsed ? 'Ouvrir le menu' : 'Reduire le menu'}
            className={`flex items-center ${
              isCollapsed ? 'justify-center px-2 py-2' : 'gap-3 px-3 py-2'
            } rounded-md text-sm transition-colors hover:bg-sidebar-accent/10 text-sidebar-foreground/80 w-full`}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="h-5 w-5 shrink-0" />
            ) : (
              <>
                <PanelLeftClose className="h-5 w-5 shrink-0" />
                <span>Reduire</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-dvh">
        <header className="flex items-center justify-end px-6 py-3 border-b border-border">
          <RoleToggle />
        </header>
        <main className="flex-1 p-6 overflow-auto">
          <TransactionsProvider>{children}</TransactionsProvider>
        </main>
      </div>
    </div>
  )
}
