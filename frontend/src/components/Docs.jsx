import { useLanguage } from '../contexts/LanguageContext'

function Docs() {
  const { t } = useLanguage()

  return (
    <div className="mx-auto max-w-3xl space-y-10 pb-16">
      <div>
        <p className="label" style={{ color: 'var(--accent)' }}>Fusion Lab</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-[-0.03em]" style={{ color: 'var(--text-strong)' }}>
          {t('docs.title')}
        </h1>
        <p className="mt-4 text-sm leading-7" style={{ color: 'var(--text)' }}>{t('docs.intro')}</p>
      </div>

      <section className="border-t pt-8" style={{ borderColor: 'var(--line)' }}>
        <h2 className="text-base font-semibold" style={{ color: 'var(--text-strong)' }}>{t('docs.dst.title')}</h2>
        <p className="mt-3 text-sm leading-7" style={{ color: 'var(--text)' }}>{t('docs.dst.body')}</p>
      </section>

      <section className="border-t pt-8" style={{ borderColor: 'var(--line)' }}>
        <h2 className="text-base font-semibold" style={{ color: 'var(--text-strong)' }}>{t('docs.pcr.title')}</h2>
        <p className="mt-3 text-sm leading-7" style={{ color: 'var(--text)' }}>{t('docs.pcr.body')}</p>
      </section>

      <section className="border-t pt-8" style={{ borderColor: 'var(--line)' }}>
        <h2 className="text-base font-semibold" style={{ color: 'var(--text-strong)' }}>{t('docs.ml.title')}</h2>
        <p className="mt-3 text-sm leading-7" style={{ color: 'var(--text)' }}>{t('docs.ml.body')}</p>
      </section>
    </div>
  )
}

export default Docs
