import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import en from '../locales/en.json'
import pl from '../locales/pl.json'

const DICTS = { en, pl }

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [locale, setLocale] = useState(() => {
    if (typeof window === 'undefined') return 'en'
    const s = localStorage.getItem('locale')
    if (s === 'en' || s === 'pl') return s
    return navigator.language?.toLowerCase().startsWith('pl') ? 'pl' : 'en'
  })

  useEffect(() => {
    localStorage.setItem('locale', locale)
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
