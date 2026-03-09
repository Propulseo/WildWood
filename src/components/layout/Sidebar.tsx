'use client'

import { useAuth } from '@/lib/contexts/auth-context'
import { useTables } from '@/contexts/tables-context'
import { getNavSections } from './sidebar-nav-config'
import { SidebarLogo } from './SidebarLogo'
import { SidebarSection } from './SidebarSection'
import { SidebarFooter } from './SidebarFooter'

interface SidebarProps {
  isCollapsed: boolean
  onToggle: () => void
  pathname: string
}

export function Sidebar({ isCollapsed, onToggle, pathname }: SidebarProps) {
  const { role } = useAuth()
  const { getTablesOuvertes } = useTables()

  if (!role) return null

  const sections = getNavSections(role)
  const tablesCount = getTablesOuvertes().length

  const badgeCounts = {
    tables: { count: tablesCount, color: 'var(--ww-danger)' },
  }

  return (
    <aside
      className={`hidden md:flex md:w-16 ${
        isCollapsed ? 'lg:w-16' : 'lg:w-60'
      } bg-ww-surface border-r border-ww-border flex-col shrink-0 h-full transition-all duration-250 ease-in-out`}
    >
      <SidebarLogo isCollapsed={isCollapsed} />

      <nav className="flex-1 overflow-y-auto overflow-visible py-2">
        {sections.map((section, i) => (
          <SidebarSection
            key={section.label}
            label={section.label}
            items={section.items}
            isFirst={i === 0}
            isCollapsed={isCollapsed}
            pathname={pathname}
            badgeCounts={badgeCounts}
          />
        ))}
      </nav>

      <SidebarFooter isCollapsed={isCollapsed} onToggle={onToggle} />
    </aside>
  )
}
