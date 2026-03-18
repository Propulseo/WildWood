'use client'

import { useLocale } from '@/lib/i18n/provider'

const FLAGS = [
  { locale: 'fr' as const, flag: '\u{1F1EB}\u{1F1F7}', label: 'FR' },
  { locale: 'en' as const, flag: '\u{1F1EC}\u{1F1E7}', label: 'EN' },
  { locale: 'th' as const, flag: '\u{1F1F9}\u{1F1ED}', label: 'TH' },
]

interface LocaleSwitcherProps {
  isCollapsed: boolean
}

export function LocaleSwitcher({ isCollapsed }: LocaleSwitcherProps) {
  const { locale, setLocale } = useLocale()

  if (isCollapsed) {
    const current = FLAGS.find((f) => f.locale === locale) ?? FLAGS[0]
    return (
      <div className="flex justify-center py-2" title={`${current.label} / ${FLAGS.map((f) => f.label).join(' / ')}`}>
        <button
          onClick={() => {
            const idx = FLAGS.findIndex((f) => f.locale === locale)
            const next = FLAGS[(idx + 1) % FLAGS.length]
            setLocale(next.locale)
          }}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-base bg-[var(--ww-orange-glow)] border border-ww-orange/30 transition-all duration-150 hover:bg-ww-orange/20 active:scale-[0.97]"
        >
          {current.flag}
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1.5 px-3 py-2">
      {FLAGS.map((f) => {
        const isActive = locale === f.locale
        return (
          <button
            key={f.locale}
            onClick={() => setLocale(f.locale)}
            title={f.label}
            className={`flex items-center justify-center w-9 h-8 rounded-lg text-base transition-all duration-150 active:scale-[0.97] ${
              isActive
                ? 'bg-[var(--ww-orange-glow)] border border-ww-orange'
                : 'bg-ww-surface-2 border border-ww-border hover:bg-ww-surface hover:border-ww-muted'
            }`}
          >
            {f.flag}
          </button>
        )
      })}
    </div>
  )
}
