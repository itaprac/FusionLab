import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import SourceCard from './SourceCard'
import ResultCard from './ResultCard'
import { useLanguage } from '../contexts/LanguageContext'

function ExampleCalculator() {
  const { darkMode } = useOutletContext()
  const navigate = useNavigate()
  const { t } = useLanguage()
  const methodId = 'dempster'
  const methodName = 'Dempster-Shafer Theory (DST)'

  const sources = useMemo(() => ([
    {
      id: 1, name: 'Meteorological conditions',
      description: 'Worsening weather conditions. Snowfall, wind, and temperature changes that influence snowpack stability.',
      hypotheses: [
        { name: 'Level 2 – Moderate', mass: '0.20' },
        { name: 'Level 3 – Considerable', mass: '0.30' },
        { name: 'Level 4 – High', mass: '0.35' },
        { name: 'Uncertainty', mass: '0.15' },
      ],
    },
    {
      id: 2, name: 'Field observations',
      description: 'Terrain still looks stable. On-site observations such as visible instability signs and recent avalanche activity.',
      hypotheses: [
        { name: 'Level 2 – Moderate', mass: '0.40' },
        { name: 'Level 3 – Considerable', mass: '0.30' },
        { name: 'Level 4 – High', mass: '0.10' },
        { name: 'Uncertainty', mass: '0.20' },
      ],
    },
  ]), [])

  const requestSources = useMemo(() => sources.map(s => ({
    name: s.name,
    masses: Object.fromEntries(s.hypotheses.map(h => [h.name, parseFloat(h.mass)])),
  })), [sources])

  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      setLoading(true); setError(null); setResult(null)
      try {
        const r = await fetch('/api/fusion', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fusion_method: methodId, sources: requestSources }) })
        const d = await r.json(); if (!r.ok) throw new Error(d.detail || 'Fusion failed')
        if (!cancelled) setResult(d.result)
      } catch (e) { if (!cancelled) setError(e.message) }
      finally { if (!cancelled) setLoading(false) }
    }
    run()
    return () => { cancelled = true }
  }, [methodId, requestSources])

  return (
    <div className="space-y-10">
      <div className="max-w-3xl">
        <p className="label">{t('exCalc.badge')}</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-[-0.03em]" style={{ color: 'var(--text-strong)' }}>
          {t('exCalc.title')}
        </h1>
        <p className="mt-5 text-sm leading-7" style={{ color: 'var(--text-muted)' }}>{t('exCalc.intro')}</p>
        <div className="mt-5 space-y-3 text-sm leading-7" style={{ color: 'var(--text)' }}>
          <p>
            Information rarely comes from a single reliable source. In real-world decision making,
            multiple experts or sensors provide estimates that may partially agree or conflict with each other.
            Evidence fusion provides a mathematically grounded framework for combining these uncertain
            inputs into a single, coherent belief distribution.
          </p>
          <p>
            In this example we use <strong style={{ color: 'var(--text-strong)' }}>Dempster-Shafer Theory (DST)</strong> to
            fuse two independent assessments of avalanche hazard. Each source assigns belief masses to
            different danger levels on the European Avalanche Danger Scale, plus a residual mass
            representing overall uncertainty. The fusion rule then combines these masses, normalising
            any conflicting evidence to produce a single result.
          </p>
        </div>
      </div>

      <section className="border-t pt-8" style={{ borderColor: 'var(--line)' }}>
        <h2 className="text-base font-semibold" style={{ color: 'var(--text-strong)' }}>Scenario: Avalanche hazard assessment</h2>
        <p className="mt-2 max-w-2xl text-sm leading-7" style={{ color: 'var(--text)' }}>
          Two independent sources evaluate the current avalanche danger level. The first source
          relies on meteorological data (snowfall intensity, wind speed, temperature gradient),
          while the second source is based on direct field observations (terrain stability signs,
          recent avalanche activity, snowpack tests). Notice how they partially agree on Level 3
          but differ significantly on Level 4 — the weather data suggests higher risk than what
          the field observer sees on the ground.
        </p>
        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
          {sources.map((s, idx) => (
            <SourceCard
              key={s.id} source={s} index={idx + 1} canRemove={false}
              onRemove={() => {}} onUpdateName={() => {}} onAddHypothesis={() => {}}
              onRemoveHypothesis={() => {}} onUpdateHypothesis={() => {}}
              darkMode={darkMode} readOnly description={s.description}
            />
          ))}
        </div>
      </section>

      <section className="border-t pt-8" style={{ borderColor: 'var(--line)' }}>
        <h2 className="text-base font-semibold" style={{ color: 'var(--text-strong)' }}>Fusion result</h2>
        <div className="mt-2 max-w-2xl space-y-3 text-sm leading-7" style={{ color: 'var(--text)' }}>
          <p>
            After applying the Dempster combination rule, the fused result converges on
            <strong style={{ color: 'var(--text-strong)' }}> Level 3 – Considerable</strong> avalanche danger.
            Even though the meteorological source assigned the highest individual mass to Level 4,
            the field observations strongly disagreed, pushing the combined belief toward Level 3.
          </p>
          <p>
            The conflict value shown below indicates how much the two sources disagreed.
            Higher conflict means the sources provided more contradictory evidence, and the
            normalisation step in Dempster's rule redistributed more mass. In practice, a conflict
            value above 0.5 is often a signal that the sources may not be compatible, and
            alternative rules like PCR5 or PCR6 may be more appropriate.
          </p>
        </div>

        {loading && <p className="mt-3 text-sm" style={{ color: 'var(--text-muted)' }}>Calculating…</p>}
        {error && <p className="mt-3 text-sm" style={{ color: 'var(--danger)' }}>Failed: {error}</p>}

        {result && (
          <ResultCard result={result} methodId={methodId} methodName={methodName} darkMode={darkMode}
            displayOrder={['Level 2 – Moderate', 'Level 3 – Considerable', 'Level 4 – High', 'Uncertainty']}
          />
        )}
      </section>

      <section className="flex flex-col gap-4 border-t pt-8 sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: 'var(--line)' }}>
        <div>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-strong)' }}>Want to try it yourself?</h3>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
            Open the Calculator with these sources pre-filled. You can edit the masses, add new hypotheses,
            or switch to PCR5/PCR6 to see how different fusion rules handle the same evidence.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/calculator?example=avalanche_hazard&method=dempster')}
          className="btn btn-primary shrink-0"
        >
          {t('exCalc.try')}
        </button>
      </section>
    </div>
  )
}

export default ExampleCalculator
