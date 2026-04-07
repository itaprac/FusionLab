import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'

function Examples() {
  const navigate = useNavigate()
  const { t } = useLanguage()

  return (
    <div className="space-y-12">
      <div className="max-w-3xl">
        <p className="label">{t('examples.badge')}</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-[-0.03em]" style={{ color: 'var(--text-strong)' }}>
          {t('examples.title')}
        </h1>
        <p className="mt-3 text-sm leading-7" style={{ color: 'var(--text)' }}>{t('examples.intro')}</p>
      </div>

      <div className="space-y-6">
        <button
          type="button"
          onClick={() => navigate('/examples/calculator')}
          className="group block w-full border-t py-6 text-left"
          style={{ borderColor: 'var(--line)' }}
        >
          <h2 className="text-base font-semibold tracking-[-0.01em]" style={{ color: 'var(--text-strong)' }}>
            {t('examples.ava.title')}
          </h2>
          <p className="mt-2 max-w-lg text-sm leading-7" style={{ color: 'var(--text)' }}>{t('examples.ava.body')}</p>
          <span className="mt-3 inline-block text-sm font-semibold transition-colors" style={{ color: 'var(--accent-strong)' }}>
            {t('examples.ava.link')}
          </span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/examples/ml')}
          className="group block w-full border-t py-6 text-left"
          style={{ borderColor: 'var(--line)' }}
        >
          <h2 className="text-base font-semibold tracking-[-0.01em]" style={{ color: 'var(--text-strong)' }}>
            {t('examples.digits.title')}
          </h2>
          <p className="mt-2 max-w-lg text-sm leading-7" style={{ color: 'var(--text)' }}>{t('examples.digits.body')}</p>
          <span className="mt-3 inline-block text-sm font-semibold transition-colors" style={{ color: 'var(--accent-strong)' }}>
            {t('examples.digits.link')}
          </span>
        </button>
      </div>
    </div>
  )
}

export default Examples
