'use client'

import type { NavItem } from './sidebar-nav-config'
import { SidebarItem } from './SidebarItem'

interface BadgeCounts {
  tables?: { count: number; color: string }
}

interface SidebarSectionProps {
  label: string
  items: NavItem[]
  isFirst: boolean
  isCollapsed: boolean
  pathname: string
  badgeCounts: BadgeCounts
}

export function SidebarSection({
  label, items, isFirst, isCollapsed, pathname, badgeCounts,
}: SidebarSectionProps) {
  return (
    <div>
      {!isFirst && <div className="h-px bg-ww-border mx-3" />}

      {!isCollapsed && (
        <p className="text-[10px] font-sans uppercase tracking-widest text-ww-muted pt-5 pb-1 px-4">
          {label}
        </p>
      )}

      {isCollapsed && !isFirst && <div className="h-3" />}

      <div className="space-y-0.5 px-1">
        {items.map((item) => {
          const cleanHref = item.href.split('?')[0]
          const isActive = pathname === cleanHref || pathname.startsWith(cleanHref + '/')
          const badge = item.badgeKey ? badgeCounts[item.badgeKey] : undefined

          return (
            <SidebarItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              sectionLabel={label}
              isActive={isActive}
              isCollapsed={isCollapsed}
              badge={badge}
            />
          )
        })}
      </div>
    </div>
  )
}
