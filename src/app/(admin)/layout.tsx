'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Menu } from 'lucide-react'
import { useAuth } from '@/lib/contexts/auth-context'
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
import { I18nProvider, useLocale } from '@/lib/i18n/provider'
import { useTranslations } from 'next-intl'

const STORAGE_KEY = 'ww_sidebar_collapsed'

const PAGE_KEYS: Record<string, string> = {
  '/dashboard': 'dashboard',
  '/statistiques': 'statistiques',
  '/clients': 'clients',
  '/bungalows': 'bungalows',
  '/maintenance': 'maintenance',
  '/comptabilite': 'comptabilite',
  '/revenus': 'revenus',
  '/depenses': 'depenses',
  '/presence': 'presence',
  '/checkin': 'checkin',
  '/parametres/produits': 'produits',
  '/pos': 'pos',
  '/tables': 'tables',
  '/pointage': 'pointage',
  '/planning': 'planning',
  '/reporting': 'reporting',
  '/communications': 'communications',
  '/parametres/messages': 'templatesWA',
}

function TodayDate() {
  const { locale } = useLocale()
  const loc = locale === 'th' ? 'th-TH' : locale === 'en' ? 'en-GB' : 'fr-FR'
  const today = new Date()
  return today.toLocaleDateString(loc, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const BAR_ROUTES = ['/pos', '/pointage', '/tables']
const RECEPTION_ROUTES = [...BAR_ROUTES, '/bungalows', '/checkin', '/communications']

function isAllowed(role: string | null, path: string): boolean {
  if (role === 'admin') return true
  const routes = role === 'reception' ? RECEPTION_ROUTES : BAR_ROUTES
  return routes.some((r) => path === r || path.startsWith(r + '/') || path.startsWith(r + '?'))
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { role, isAuthenticated } = useAuth()

  return (
    <I18nProvider role={role}>
      <AdminLayoutInner role={role} isAuthenticated={isAuthenticated}>
        {children}
      </AdminLayoutInner>
    </I18nProvider>
  )
}

function AdminLayoutInner({ children, role, isAuthenticated }: { children: React.ReactNode; role: string | null; isAuthenticated: boolean }) {
  const pathname = usePathname()
  const router = useRouter()
  const t = useTranslations('pages')
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)

  const isPosPage = pathname.startsWith('/pos') || pathname.startsWith('/pointage')

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'true') setIsCollapsed(true)
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (!isAuthenticated) { router.replace('/login'); return }
    if (role && !isAllowed(role, pathname)) {
      router.replace(role === 'bar' ? '/pos?tab=fnb' : '/pos?tab=gym')
    }
  }, [isAuthenticated, role, pathname, router])

  function toggleSidebar() {
    setIsCollapsed((prev) => {
      const next = !prev
      localStorage.setItem(STORAGE_KEY, String(next))
      return next
    })
  }

  const currentPageEntry = Object.entries(PAGE_KEYS).find(
    ([href]) => pathname === href || pathname.startsWith(href + '/')
  )
  const currentPageTitle = currentPageEntry ? t(currentPageEntry[1]) : null

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
                  {currentPageTitle && (
                    <span className="text-ww-text font-sans font-medium text-sm truncate">{currentPageTitle}</span>
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
                  {currentPageTitle && (
                    <>
                      <span className="text-ww-border">/</span>
                      <span className="text-ww-text font-sans font-medium">{currentPageTitle}</span>
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

