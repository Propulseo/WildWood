'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { NextIntlClientProvider } from 'next-intl'
import type { Role } from '@/lib/types'

type Locale = 'fr' | 'en' | 'th'

interface LocaleContextType {
  locale: Locale
  setLocale: (l: Locale) => void
}

const LocaleCtx = createContext<LocaleContextType>({
  locale: 'fr',
  setLocale: () => {},
})

export const useLocale = () => useContext(LocaleCtx)

const STORAGE_KEY = 'ww_locale'
const LOCALES: Locale[] = ['fr', 'en', 'th']

function getDefaultLocale(role: Role | null): Locale {
  if (role === 'reception' || role === 'bar') return 'en'
  return 'fr'
}

function getStoredLocale(): Locale | null {
  if (typeof window === 'undefined') return null
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored && LOCALES.includes(stored as Locale)) return stored as Locale
  return null
}

// Merge fallback: th → en → fr
async function loadMessages(locale: Locale): Promise<Record<string, unknown>> {
  const fr = (await import('../../../messages/fr.json')).default
  if (locale === 'fr') return fr
  const en = (await import('../../../messages/en.json')).default
  if (locale === 'en') return deepMerge(fr, en)
  const th = (await import('../../../messages/th.json')).default
  return deepMerge(deepMerge(fr, en), th)
}

function deepMerge(base: Record<string, unknown>, over: Record<string, unknown>): Record<string, unknown> {
  const result = { ...base }
  for (const key of Object.keys(over)) {
    if (
      typeof over[key] === 'object' && over[key] !== null &&
      typeof base[key] === 'object' && base[key] !== null
    ) {
      result[key] = deepMerge(
        base[key] as Record<string, unknown>,
        over[key] as Record<string, unknown>,
      )
    } else {
      result[key] = over[key]
    }
  }
  return result
}

interface I18nProviderProps {
  role: Role | null
  children: React.ReactNode
}

export function I18nProvider({ role, children }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    return getStoredLocale() ?? getDefaultLocale(role)
  })
  const [messages, setMessages] = useState<Record<string, unknown> | null>(null)

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l)
    localStorage.setItem(STORAGE_KEY, l)
  }, [])

  // Update locale when role changes and no stored preference
  useEffect(() => {
    if (!getStoredLocale()) {
      setLocaleState(getDefaultLocale(role))
    }
  }, [role])

  useEffect(() => {
    loadMessages(locale).then(setMessages)
  }, [locale])

  if (!messages) return null

  return (
    <LocaleCtx.Provider value={{ locale, setLocale }}>
      <NextIntlClientProvider locale={locale} messages={messages}>
        {children}
      </NextIntlClientProvider>
    </LocaleCtx.Provider>
  )
}
