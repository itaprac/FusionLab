import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'

function useOnScreen(ref, threshold = 0.12) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    if (!ref.current) return
    const el = ref.current
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.unobserve(el) } },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [ref, threshold])
  return visible
}

function Section({ children, className = '', delay = 0, ...props }) {
  const ref = useRef(null)
  const visible = useOnScreen(ref)

  return (
    <section
      ref={ref}
      className={className}
      style={{
        ...props.style,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 800ms cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 800ms cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      }}
    >
      {children}
    </section>
  )
}

function Home() {
  const navigate = useNavigate()
  const { t } = useLanguage()

  const STEPS = [
    {
      title: t('home.step1.title'),
      detail: t('home.step1.detail'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      title: t('home.step2.title'),
      detail: t('home.step2.detail'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      title: t('home.step3.title'),
      detail: t('home.step3.detail'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      title: t('home.step4.title'),
      detail: t('home.step4.detail'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
  ]

  return (
    <div>
      <section className="mx-auto max-w-6xl px-6 pb-20 pt-16 sm:px-8 sm:pt-24 lg:px-12">
        <p className="stagger-in label" style={{ animationDelay: '0ms', color: 'var(--accent)' }}>
          {t('home.badge')}
        </p>
        <h1
          className="stagger-in mt-4 max-w-3xl text-[clamp(2rem,4.5vw,3.4rem)] font-semibold leading-[1.12] tracking-[-0.035em]"
          style={{ animationDelay: '80ms', color: 'var(--text-strong)' }}
        >
          {t('home.hero.title')}{' '}
          <span style={{ color: 'var(--text-muted)' }}>{t('home.hero.sub')}</span>
        </h1>
        <p
          className="stagger-in mt-5 max-w-xl text-base leading-7"
          style={{ animationDelay: '160ms', color: 'var(--text)' }}
        >
          {t('home.hero.body')}
        </p>
        <div className="stagger-in mt-8 flex flex-wrap items-center gap-3" style={{ animationDelay: '240ms' }}>
          <button type="button" onClick={() => navigate('/calculator')} className="btn btn-primary">
            {t('home.cta.calc')}
          </button>
          <button type="button" onClick={() => navigate('/ml')} className="btn btn-secondary">
            {t('home.cta.ml')}
          </button>
        </div>
      </section>

      <Section className="border-y py-16" style={{ borderColor: 'var(--line)', background: 'var(--bg-sunken)' }}>
        <div className="mx-auto max-w-6xl px-6 sm:px-8 lg:px-12">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="label">{t('home.flow.label')}</p>
              <h2 className="mt-2 text-xl font-semibold tracking-[-0.02em]" style={{ color: 'var(--text-strong)' }}>
                {t('home.flow.title')}
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-6" style={{ color: 'var(--text-muted)' }}>
              {t('home.flow.aside')}
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-4">
            {STEPS.map((step, idx) => (
              <div
                key={step.title}
                className="relative rounded-xl border p-5"
                style={{ borderColor: 'var(--line)', background: 'var(--bg-elevated)' }}
              >
                {idx < 3 && (
                  <div
                    className="absolute -right-3 top-1/2 z-10 hidden h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border sm:flex"
                    style={{ borderColor: 'var(--line-strong)', background: 'var(--bg-sunken)' }}
                  >
                    <svg className="w-3 h-3" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: 'var(--accent-soft)', color: 'var(--accent-strong)' }}
                  >
                    {step.icon}
                  </div>
                  <span className="mono text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: 'var(--text-muted)' }}>
                    {t('home.step.n')} {idx + 1}
                  </span>
                </div>
                <h3 className="text-sm font-semibold" style={{ color: 'var(--text-strong)' }}>{step.title}</h3>
                <p className="mt-1.5 text-sm leading-6" style={{ color: 'var(--text-muted)' }}>{step.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section className="mx-auto max-w-6xl px-6 py-16 sm:px-8 lg:px-12" delay={80}>
        <p className="label">{t('home.workflows.label')}</p>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <button
            type="button"
            onClick={() => navigate('/calculator')}
            className="group rounded-xl border p-6 text-left transition-all duration-200 hover:shadow-sm"
            style={{ borderColor: 'var(--line)', background: 'var(--bg-elevated)' }}
          >
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg mb-4"
              style={{ background: 'var(--accent-soft)', color: 'var(--accent-strong)' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold tracking-[-0.01em]" style={{ color: 'var(--text-strong)' }}>
              {t('home.card.calc.title')}
            </h3>
            <p className="mt-2 text-sm leading-6" style={{ color: 'var(--text)' }}>{t('home.card.calc.body')}</p>
            <span className="mt-3 inline-block text-sm font-semibold transition-colors" style={{ color: 'var(--accent-strong)' }}>
              {t('home.card.calc.link')}
            </span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/ml')}
            className="group rounded-xl border p-6 text-left transition-all duration-200 hover:shadow-sm"
            style={{ borderColor: 'var(--line)', background: 'var(--bg-elevated)' }}
          >
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg mb-4"
              style={{ background: 'var(--accent-soft)', color: 'var(--accent-strong)' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
              </svg>
            </div>
            <h3 className="text-base font-semibold tracking-[-0.01em]" style={{ color: 'var(--text-strong)' }}>
              {t('home.card.ml.title')}
            </h3>
            <p className="mt-2 text-sm leading-6" style={{ color: 'var(--text)' }}>{t('home.card.ml.body')}</p>
            <span className="mt-3 inline-block text-sm font-semibold transition-colors" style={{ color: 'var(--accent-strong)' }}>
              {t('home.card.ml.link')}
            </span>
          </button>
        </div>
      </Section>

      <Section className="border-y py-16" style={{ borderColor: 'var(--line)', background: 'var(--bg-sunken)' }} delay={80}>
        <div className="mx-auto max-w-6xl px-6 sm:px-8 lg:px-12">
          <p className="label">{t('home.methods.label')}</p>
          <h2 className="mt-2 text-xl font-semibold tracking-[-0.02em]" style={{ color: 'var(--text-strong)' }}>
            {t('home.methods.title')}
          </h2>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border p-5" style={{ borderColor: 'var(--line)', background: 'var(--bg-elevated)' }}>
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-strong)' }}>{t('home.dst.title')}</h3>
              <p className="mt-2 text-sm leading-7" style={{ color: 'var(--text)' }}>{t('home.dst.body')}</p>
            </div>
            <div className="rounded-xl border p-5" style={{ borderColor: 'var(--line)', background: 'var(--bg-elevated)' }}>
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-strong)' }}>{t('home.pcr.title')}</h3>
              <p className="mt-2 text-sm leading-7" style={{ color: 'var(--text)' }}>{t('home.pcr.body')}</p>
            </div>
          </div>
        </div>
      </Section>

      <Section className="mx-auto max-w-6xl px-6 py-16 sm:px-8 lg:px-12" delay={80}>
        <div
          className="flex flex-col gap-5 rounded-xl border p-6 sm:flex-row sm:items-center sm:justify-between"
          style={{ borderColor: 'var(--line)', background: 'var(--bg-elevated)' }}
        >
          <div>
            <h2 className="text-base font-semibold tracking-[-0.01em]" style={{ color: 'var(--text-strong)' }}>
              {t('home.cta2.title')}
            </h2>
            <p className="mt-1 text-sm leading-6" style={{ color: 'var(--text)' }}>{t('home.cta2.body')}</p>
          </div>
          <button type="button" onClick={() => navigate('/examples')} className="btn btn-primary shrink-0">
            {t('home.cta2.btn')}
          </button>
        </div>
      </Section>
    </div>
  )
}

export default Home
