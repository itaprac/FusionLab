import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import en from '../locales/en.json'
import pl from '../locales/pl.json'

const DICTS = { en, pl }

const LanguageContext = createContext(null)

function getDefaultLocale() {
  if (typeof window === 'undefined') return 'en'
  return window.navigator.language?.toLowerCase().startsWith('pl') ? 'pl' : 'en'
}

function readStoredLocale() {
  if (typeof window === 'undefined') return 'en'

  try {
    const storedLocale = window.localStorage.getItem('locale')
    if (storedLocale === 'en' || storedLocale === 'pl') return storedLocale
  } catch {
    // Ignore storage failures and fall back to browser language.
  }

  return getDefaultLocale()
}

function writeStoredLocale(locale) {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem('locale', locale)
  } catch {
    // Ignore storage failures so language preference never breaks rendering.
  }
}

export function LanguageProvider({ children }) {
  const [locale, setLocale] = useState(readStoredLocale)

  useEffect(() => {
    writeStoredLocale(locale)
  }, [locale])

  const t = useCallback(
    (key) => {
      const d = DICTS[locale] || DICTS.en
      return d[key] ?? DICTS.en[key] ?? key
    },
    [locale]
  )

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, t])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
