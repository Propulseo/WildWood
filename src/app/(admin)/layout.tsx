'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'
import { RoleToggle } from '@/components/role-toggle'
import { Sidebar } from '@/components/layout/Sidebar'
import { MobileDrawer } from '@/components/layout/MobileDrawer'
import { TransactionsProvider } from '@/contexts/transactions-context'
import { ExpensesProvider } from '@/contexts/expenses-context'
import { ActivePassesProvider } from '@/contexts/active-passes-context'
import { StaffProvider } from '@/contexts/staff-context'
import { ServiettesProvider } from '@/contexts/serviettes-context'
import { ProductsProvider } from '@/contexts/products-context'
import { MaintenanceProvider } from '@/contexts/maintenance-context'
import { ShiftProvider } from '@/contexts/shift-context'
import { ChatProvider } from '@/contexts/chat-context'
import { TablesProvider } from '@/contexts/tables-context'
import { PlanningProvider } from '@/contexts/planning-context'
import { ReportingProvider } from '@/contexts/reporting-context'
import { ClosingsProvider } from '@/contexts/closings-context'
import { MessagesWAProvider } from '@/contexts/messages-wa-context'
import { Toaster } from '@/components/ui/sonner'

const STORAGE_KEY = 'ww_sidebar_collapsed'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/statistiques': 'Statistiques',
  '/clients': 'Clients',
  '/bungalows': 'Bungalows',
  '/maintenance': 'Maintenance',
  '/comptabilite': 'Comptabilite',
  '/revenus': 'Revenus',
  '/depenses': 'Depenses',
  '/presence': 'Presence',
  '/checkin': 'Entrees du jour',
  '/parametres/produits': 'Parametres — Produits',
  '/pos': 'Caisse POS',
  '/tables': 'Tables ouvertes',
  '/pointage': 'Pointage',
  '/planning': 'Planning',
  '/reporting': 'Reporting',
  '/communications': 'Communications',
  '/parametres/messages': 'Templates WhatsApp',
}

function TodayDate() {
  const today = new Date()
  return today.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)

  const isPosPage = pathname.startsWith('/pos') || pathname.startsWith('/pointage')

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

  const currentPage = Object.entries(pageTitles).find(
    ([href]) => pathname === href || pathname.startsWith(href + '/')
  )

  if (!isHydrated) return null

  return (
    <ProductsProvider>
    <MessagesWAProvider>
    <MaintenanceProvider>
    <StaffProvider>
    <ShiftProvider>
    <ChatProvider>
    <ServiettesProvider>
    <ActivePassesProvider>
    <ExpensesProvider>
      <TransactionsProvider>
      <TablesProvider>
      <ReportingProvider>
      <ClosingsProvider>
      <PlanningProvider>
        <div className="h-dvh bg-ww-bg text-ww-text flex overflow-hidden">
          <Sidebar isCollapsed={isCollapsed} onToggle={toggleSidebar} pathname={pathname} />

          <div className="flex-1 flex flex-col h-full min-w-0">
            {!isPosPage && (
              <header className="h-12 md:h-14 shrink-0 flex items-center justify-between px-3 md:px-6 border-b border-ww-border bg-ww-bg">
                {/* Mobile: WW logo + page title + hamburger */}
                <div className="flex md:hidden items-center gap-2 flex-1 min-w-0">
                  <span className="font-display font-extrabold text-ww-orange text-lg shrink-0">WW</span>
                  {currentPage && (
                    <span className="text-ww-text font-sans font-medium text-sm truncate">{currentPage[1]}</span>
                  )}
                </div>
                <button
                  onClick={() => setMobileDrawerOpen(true)}
                  className="md:hidden text-ww-muted hover:text-ww-text p-1.5"
                >
                  <Menu className="h-5 w-5" />
                </button>

                {/* Desktop: breadcrumb + date + role */}
                <div className="hidden md:flex items-center gap-2 text-sm">
                  <span className="text-ww-muted font-sans">WildWood</span>
                  {currentPage && (
                    <>
                      <span className="text-ww-border">/</span>
                      <span className="text-ww-text font-sans font-medium">{currentPage[1]}</span>
                    </>
                  )}
                </div>
                <div className="hidden md:flex items-center gap-6">
                  <span className="text-sm text-ww-muted font-sans capitalize hidden xl:inline">
                    <TodayDate />
                  </span>
                  <RoleToggle />
                </div>
              </header>
            )}

            <main className={isPosPage ? 'flex-1 overflow-hidden' : 'flex-1 px-3 py-4 md:p-6 overflow-auto min-h-0 ww-page-in'}>
              {children}
            </main>
          </div>

          <MobileDrawer open={mobileDrawerOpen} onClose={() => setMobileDrawerOpen(false)} pathname={pathname} />
        </div>
        <Toaster position="bottom-right" />
      </PlanningProvider>
      </ClosingsProvider>
      </ReportingProvider>
      </TablesProvider>
      </TransactionsProvider>
    </ExpensesProvider>
    </ActivePassesProvider>
    </ServiettesProvider>
    </ChatProvider>
    </ShiftProvider>
    </StaffProvider>
    </MaintenanceProvider>
    </MessagesWAProvider>
    </ProductsProvider>
  )
}
