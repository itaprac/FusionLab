import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'

const PATHS = {
  home: '/',
  calculator: '/calculator',
  mlfusion: '/ml',
  examples: '/examples',
  docs: '/docs',
}

function Header({ darkMode, onToggleDarkMode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { locale, setLocale, t } = useLanguage()

  const path = location.pathname

  const isActive = (id) => {
    const p = PATHS[id]
    if (id === 'examples') return path === '/examples' || path.startsWith('/examples/')
    if (id === 'docs') return path === '/docs'
    return path === p
  }

  const go = (id) => {
    navigate(PATHS[id])
    setMobileOpen(false)
  }

  const NAV_LINKS = [
    { id: 'home', label: t('nav.home') },
    { id: 'calculator', label: t('nav.calculator') },
    { id: 'mlfusion', label: t('nav.ml') },
    { id: 'examples', label: t('nav.examples') },
    { id: 'docs', label: t('nav.docs') },
  ]

  return (
    <header
      className="sticky top-0 z-30 border-b backdrop-blur-md"
      style={{
        borderColor: 'var(--line)',
        background: darkMode ? 'oklch(13% 0.008 155 / 0.92)' : 'oklch(98.5% 0.003 85 / 0.92)',
      }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3 sm:px-8 lg:px-12">
        <button type="button" onClick={() => go('home')} className="flex items-center gap-2">
          <svg className="h-5 w-5" style={{ color: 'var(--accent)' }} fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="text-sm font-bold tracking-[-0.02em]" style={{ color: 'var(--text-strong)' }}>
            Fusion Lab
          </span>
        </button>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map(link => (
            <button
              key={link.id}
              type="button"
              onClick={() => go(link.id)}
              className="rounded-md px-3 py-1.5 text-sm transition-colors"
              style={{
                color: isActive(link.id) ? 'var(--text-strong)' : 'var(--text-muted)',
                fontWeight: isActive(link.id) ? 600 : 400,
                background: isActive(link.id) ? 'var(--bg-sunken)' : 'transparent',
              }}
            >
              {link.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <div className="flex items-center rounded-md border text-xs" style={{ borderColor: 'var(--line)' }}>
            <button
              type="button"
              onClick={() => setLocale('en')}
              className="px-2 py-1 transition-colors"
              style={{
                fontWeight: locale === 'en' ? 700 : 400,
                color: locale === 'en' ? 'var(--text-strong)' : 'var(--text-muted)',
                background: locale === 'en' ? 'var(--bg-sunken)' : 'transparent',
              }}
            >
              {t('nav.langEn')}
            </button>
            <button
              type="button"
              onClick={() => setLocale('pl')}
              className="px-2 py-1 transition-colors"
              style={{
                fontWeight: locale === 'pl' ? 700 : 400,
                color: locale === 'pl' ? 'var(--text-strong)' : 'var(--text-muted)',
                background: locale === 'pl' ? 'var(--bg-sunken)' : 'transparent',
              }}
            >
              {t('nav.langPl')}
            </button>
          </div>

          <a
            href="https://github.com/itaprac/FusionLab"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-8 w-8 items-center justify-center rounded-md transition-colors"
            style={{ color: 'var(--text-muted)' }}
            title="GitHub"
          >
            <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
          </a>

          <button
            type="button"
            onClick={onToggleDarkMode}
            className="flex h-8 w-8 items-center justify-center rounded-md transition-colors"
            style={{ color: 'var(--text-muted)' }}
            title={darkMode ? t('theme.light') : t('theme.dark')}
          >
            {darkMode ? (
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen(v => !v)}
            className="flex h-8 w-8 items-center justify-center rounded-md md:hidden"
            style={{ color: 'var(--text)' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t px-6 pb-4 pt-2 md:hidden" style={{ borderColor: 'var(--line)' }}>
          {NAV_LINKS.map(link => (
            <button
              key={link.id}
              type="button"
              onClick={() => go(link.id)}
              className="block w-full py-2.5 text-left text-sm transition-colors"
              style={{
                color: isActive(link.id) ? 'var(--text-strong)' : 'var(--text-muted)',
                fontWeight: isActive(link.id) ? 600 : 400,
              }}
            >
              {link.label}
            </button>
          ))}
        </div>
      )}
    </header>
  )
}

export default Header
