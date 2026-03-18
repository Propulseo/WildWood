import type { LucideIcon } from 'lucide-react'
import {
  LayoutDashboard, TrendingUp, Receipt, Calculator,
  BedDouble, DoorOpen, Wrench, UserCheck, MessageCircle,
  Settings, Users, Ticket, Waves, UtensilsCrossed, Coffee,
  BarChart3, CalendarDays, FileBarChart,
} from 'lucide-react'
import type { Role } from '@/lib/types'

export interface NavItem {
  href: string
  /** Translation key in the 'nav' namespace */
  labelKey: string
  icon: LucideIcon
  badgeKey?: 'tables'
}

export interface NavSection {
  /** Translation key in the 'sections' namespace */
  labelKey: string
  items: NavItem[]
}

const ADMIN_SECTIONS: NavSection[] = [
  {
    labelKey: 'overview',
    items: [
      { href: '/dashboard', labelKey: 'dashboard', icon: LayoutDashboard },
      { href: '/statistiques', labelKey: 'statistics', icon: BarChart3 },
    ],
  },
  {
    labelKey: 'finances',
    items: [
      { href: '/reporting', labelKey: 'reporting', icon: FileBarChart },
      { href: '/revenus', labelKey: 'revenues', icon: TrendingUp },
      { href: '/depenses', labelKey: 'expenses', icon: Receipt },
      { href: '/comptabilite', labelKey: 'accounting', icon: Calculator },
    ],
  },
  {
    labelKey: 'operations',
    items: [
      { href: '/bungalows', labelKey: 'bungalows', icon: BedDouble },
      { href: '/checkin', labelKey: 'checkin', icon: DoorOpen },
      { href: '/maintenance', labelKey: 'maintenance', icon: Wrench },
      { href: '/communications', labelKey: 'communications', icon: MessageCircle },
    ],
  },
  {
    labelKey: 'team',
    items: [
      { href: '/presence', labelKey: 'presence', icon: UserCheck },
      { href: '/planning', labelKey: 'planning', icon: CalendarDays },
    ],
  },
  {
    labelKey: 'settings',
    items: [
      { href: '/parametres/produits', labelKey: 'products', icon: Settings },
      { href: '/pointage', labelKey: 'staff', icon: Users },
      { href: '/parametres/messages', labelKey: 'templatesWA', icon: MessageCircle },
    ],
  },
]

const RECEPTION_SECTIONS: NavSection[] = [
  {
    labelKey: 'reception',
    items: [
      { href: '/pos?tab=gym', labelKey: 'gymPasses', icon: Ticket },
      { href: '/pos?tab=serviettes', labelKey: 'towels', icon: Waves },
      { href: '/checkin', labelKey: 'checkin', icon: DoorOpen },
    ],
  },
  {
    labelKey: 'accommodation',
    items: [
      { href: '/bungalows', labelKey: 'bungalows', icon: BedDouble },
    ],
  },
  {
    labelKey: 'finances',
    items: [
      { href: '/reporting', labelKey: 'reporting', icon: FileBarChart },
    ],
  },
  {
    labelKey: 'team',
    items: [
      { href: '/planning', labelKey: 'planning', icon: CalendarDays },
    ],
  },
]

const BAR_SECTIONS: NavSection[] = [
  {
    labelKey: 'service',
    items: [
      { href: '/pos?tab=fnb', labelKey: 'fnb', icon: UtensilsCrossed },
      { href: '/tables', labelKey: 'openTables', icon: Coffee, badgeKey: 'tables' },
    ],
  },
  {
    labelKey: 'finances',
    items: [
      { href: '/reporting', labelKey: 'reporting', icon: FileBarChart },
    ],
  },
  {
    labelKey: 'team',
    items: [
      { href: '/planning', labelKey: 'planning', icon: CalendarDays },
    ],
  },
]

export function getNavSections(role: Role): NavSection[] {
  if (role === 'reception') return RECEPTION_SECTIONS
  if (role === 'bar') return BAR_SECTIONS
  return ADMIN_SECTIONS
}
