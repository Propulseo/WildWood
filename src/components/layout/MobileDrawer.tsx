'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/lib/contexts/auth-context'
import { useTables } from '@/contexts/tables-context'
import { getNavSections } from './sidebar-nav-config'
import { SidebarLogo } from './SidebarLogo'
import { SidebarFooter } from './SidebarFooter'
import Link from 'next/link'

interface MobileDrawerProps {
  open: boolean
  onClose: () => void
  pathname: string
}

export function MobileDrawer({ open, onClose, pathname }: MobileDrawerProps) {
  const { role } = useAuth()
  const { getTablesOuvertes } = useTables()
  const tSections = useTranslations('sections')
  const tNav = useTranslations('nav')

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!role) return null

  const sections = getNavSections(role)
  const tablesCount = getTablesOuvertes().length
  const badgeCounts: Record<string, { count: number; color: string }> = {
    tables: { count: tablesCount, color: 'var(--ww-danger)' },
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/60 transition-opacity duration-200 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-ww-surface border-r border-ww-border flex flex-col transition-transform duration-200 ease-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between pr-3">
          <SidebarLogo isCollapsed={false} />
          <button onClick={onClose} className="text-ww-muted hover:text-ww-text p-2">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-2">
          {sections.map((section) => (
            <div key={section.labelKey} className="mb-2">
              <p className="px-4 py-2 text-[10px] font-display font-bold uppercase tracking-widest text-ww-muted">
                {tSections(section.labelKey)}
              </p>
              {section.items.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                const badge = item.badgeKey ? badgeCounts[item.badgeKey] : undefined
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 h-[52px] px-4 text-sm font-sans transition-colors ${
                      isActive
                        ? 'bg-[var(--ww-orange-glow)] border-l-[3px] border-ww-orange text-ww-text font-medium'
                        : 'text-ww-muted hover:bg-ww-surface-2 hover:text-ww-text'
                    }`}
                  >
                    <span className="relative shrink-0">
                      <Icon className={`h-[18px] w-[18px] ${isActive ? 'text-ww-orange' : ''}`} />
                      {badge && badge.count > 0 && (
                        <span
                          className="absolute -top-1.5 -right-1.5 text-white text-[9px] font-display font-bold rounded-full h-4 min-w-4 flex items-center justify-center px-0.5"
                          style={{ backgroundColor: badge.color }}
                        >
                          {badge.count}
                        </span>
                      )}
                    </span>
                    <span className="truncate">{tNav(item.labelKey)}</span>
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        <SidebarFooter isCollapsed={false} onToggle={() => {}} />
      </aside>
    </>
  )
}
