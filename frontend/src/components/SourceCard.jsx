import { useLanguage } from '../contexts/LanguageContext'

function SourceCard({
  source, index, canRemove, onRemove, onUpdateName,
  onAddHypothesis, onRemoveHypothesis, onUpdateHypothesis,
  darkMode, readOnly = false, description
}) {
  const { t } = useLanguage()
  const totalMass = source.hypotheses.reduce((sum, h) => sum + (parseFloat(h.mass) || 0), 0)
  const isOverLimit = totalMass > 1

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b px-4 py-2.5" style={{ borderColor: 'var(--line)' }}>
        <div className="flex items-center gap-2.5">
          <span
            className="mono flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold"
            style={{ background: 'var(--accent-soft)', color: 'var(--accent-strong)' }}
          >
            {index}
          </span>
          {readOnly ? (
            <span className="text-sm font-semibold" style={{ color: 'var(--text-strong)' }}>{source.name}</span>
          ) : (
            <input
              type="text"
              value={source.name}
              onChange={(e) => onUpdateName(e.target.value)}
              className="border-0 bg-transparent text-sm font-semibold outline-none"
              style={{ color: 'var(--text-strong)' }}
            />
          )}
        </div>
        {!readOnly && canRemove && (
          <button type="button" onClick={onRemove} className="text-xs transition-colors" style={{ color: 'var(--text-muted)' }} title={t('source.remove')}>
            &times;
          </button>
        )}
      </div>

      <div className="px-4 py-3">
        {description && (
          <p className="mb-3 text-sm leading-6" style={{ color: 'var(--text)' }}>{description}</p>
        )}

        <div className="space-y-1.5">
          <div className="grid grid-cols-[1fr,5rem,1.5rem] gap-2 text-[11px] font-semibold uppercase tracking-[0.15em]" style={{ color: 'var(--text-muted)' }}>
            <span>{t('source.hypothesis')}</span>
            <span>{t('source.mass')}</span>
            <span />
          </div>
          {source.hypotheses.map((h, idx) => (
            <div key={idx} className="grid grid-cols-[1fr,5rem,1.5rem] gap-2 items-center">
              <input type="text" placeholder="e.g., A" value={h.name} onChange={(e) => onUpdateHypothesis(idx, { name: e.target.value })} disabled={readOnly} className="input py-1.5" />
              <input type="number" placeholder="0.0" value={h.mass} onChange={(e) => onUpdateHypothesis(idx, { mass: e.target.value })} step="0.1" min="0" max="1" disabled={readOnly} className="input py-1.5 mono" />
              <button
                onClick={() => onRemoveHypothesis(idx)}
                disabled={readOnly || source.hypotheses.length <= 1}
                className="text-center text-sm leading-none transition-colors disabled:opacity-0"
                style={{ color: 'var(--text-muted)' }}
              >
                &times;
              </button>
            </div>
          ))}
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 border-t pt-2.5" style={{ borderColor: 'var(--line)' }}>
          {readOnly ? <div /> : (
            <button type="button" onClick={onAddHypothesis} className="text-sm font-semibold transition-colors" style={{ color: 'var(--accent-strong)' }}>
              {t('source.addHyp')}
            </button>
          )}
          <span
            className="mono text-xs font-medium"
            style={{ color: isOverLimit ? 'var(--danger)' : 'var(--text-muted)' }}
          >
            {totalMass.toFixed(2)}{isOverLimit ? ' > 1.0' : ''}
          </span>
        </div>
      </div>
    </div>
  )
}

export default SourceCard
