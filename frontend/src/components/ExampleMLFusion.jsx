import { useEffect, useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'

const CFG = {
  datasetId: 'digits',
  datasetName: 'Optical recognition of handwritten digits',
  models: ['svm', 'rf', 'logistic_regression'],
  modelNames: { svm: 'Support Vector Machine', rf: 'Random Forest', logistic_regression: 'Logistic Regression' },
  fusionMethod: 'dempster',
  fusionMethodName: 'Dempster-Shafer Theory (DST)',
}

function ExampleMLFusion() {
  const { darkMode } = useOutletContext()
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      setLoading(true); setError(null); setResults(null)
      try {
        const r = await fetch('/api/ml/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            datasetId: CFG.datasetId,
            models: CFG.models.map(id => ({ id, params: {} })),
            fusionMethod: CFG.fusionMethod,
            useCrossValidation: false,
            cvFolds: 5,
          }),
        })
        const d = await r.json(); if (!r.ok) throw new Error(d.detail || 'ML Fusion failed')
        if (!cancelled) setResults(d.results)
      } catch (e) { if (!cancelled) setError(e.message) }
      finally { if (!cancelled) setLoading(false) }
    }
    run()
    return () => { cancelled = true }
  }, [])

  const fmt = (v) => { if (v == null || Number.isNaN(Number(v))) return '-'; return `${(Number(v) * 100).toFixed(1)}%` }
  const fmtDec = (v) => { if (v == null || Number.isNaN(Number(v))) return '-'; return Number(v).toFixed(3) }

  return (
    <div className="space-y-10">
      <div className="max-w-3xl">
        <p className="label">Guided ML example</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-[-0.03em]" style={{ color: 'var(--text-strong)' }}>
          Why fusing ML models can outperform individual classifiers
        </h1>
        <div className="mt-5 space-y-3 text-sm leading-7" style={{ color: 'var(--text)' }}>
          <p>
            Every classifier has blind spots. A Support Vector Machine may excel at separating
            classes with clear margins but struggle with overlapping distributions. A Random Forest
            handles noisy features well but can overfit to certain patterns. Logistic Regression
            provides well-calibrated probabilities but assumes linear decision boundaries.
          </p>
          <p>
            By training multiple models on the same dataset and fusing their probabilistic outputs
            using <strong style={{ color: 'var(--text-strong)' }}>Dempster-Shafer Theory</strong>,
            we treat each classifier's class probabilities as belief masses and combine them.
            The fusion process weighs each model's confidence and resolves disagreements, often
            producing predictions that are more robust than any individual model alone.
          </p>
        </div>
      </div>

      <section className="border-t pt-8" style={{ borderColor: 'var(--line)' }}>
        <h2 className="text-base font-semibold" style={{ color: 'var(--text-strong)' }}>Pipeline configuration</h2>
        <p className="mt-2 max-w-2xl text-sm leading-7" style={{ color: 'var(--text)' }}>
          We use the classic Digits dataset (a simplified version of MNIST) with three diverse classifiers.
          Each model is trained independently on the same train/test split, then their test-set
          probability outputs are fused sample-by-sample using the Dempster combination rule.
        </p>
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-lg border p-4" style={{ borderColor: 'var(--line)', background: 'var(--bg-elevated)' }}>
            <p className="label">Dataset</p>
            <p className="mt-1 text-sm font-medium" style={{ color: 'var(--text-strong)' }}>{CFG.datasetName}</p>
            <p className="mt-1 text-xs leading-5" style={{ color: 'var(--text-muted)' }}>
              1,797 samples of 8×8 pixel images, 64 features (pixel intensities), 10 classes (digits 0–9).
            </p>
          </div>
          <div className="rounded-lg border p-4" style={{ borderColor: 'var(--line)', background: 'var(--bg-elevated)' }}>
            <p className="label">Models</p>
            <div className="mt-1 space-y-1">
              {CFG.models.map(id => (
                <p key={id} className="text-sm font-medium" style={{ color: 'var(--text-strong)' }}>{CFG.modelNames[id]}</p>
              ))}
            </div>
            <p className="mt-2 text-xs leading-5" style={{ color: 'var(--text-muted)' }}>
              Three architecturally different classifiers to maximise diversity.
            </p>
          </div>
          <div className="rounded-lg border p-4" style={{ borderColor: 'var(--line)', background: 'var(--bg-elevated)' }}>
            <p className="label">Fusion method</p>
            <p className="mt-1 text-sm font-medium" style={{ color: 'var(--text-strong)' }}>{CFG.fusionMethodName}</p>
            <p className="mt-1 text-xs leading-5" style={{ color: 'var(--text-muted)' }}>
              Classifier probabilities are treated as belief masses and combined via Dempster's rule with normalisation.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t pt-8" style={{ borderColor: 'var(--line)' }}>
        <h2 className="text-base font-semibold" style={{ color: 'var(--text-strong)' }}>Results</h2>

        {loading && <p className="mt-3 text-sm" style={{ color: 'var(--text-muted)' }}>Training models and running fusion…</p>}
        {error && <p className="mt-3 text-sm" style={{ color: 'var(--danger)' }}>Failed: {error}</p>}

        {!loading && results && (() => {
          const fusionRow = results.find(r => r.kind === 'fusion')
          const individualRows = results.filter(r => r.kind !== 'fusion')
          const bestIndividual = individualRows.reduce((best, r) => {
            const acc = Number(r.accuracy) || 0
            return acc > (Number(best?.accuracy) || 0) ? r : best
          }, individualRows[0])
          const fusionAcc = fusionRow ? Number(fusionRow.accuracy) || 0 : 0
          const bestAcc = bestIndividual ? Number(bestIndividual.accuracy) || 0 : 0
          const fusionWins = fusionAcc >= bestAcc

          return (
            <>
              <div
                className="result-enter mt-5 overflow-hidden rounded-xl border"
                style={{ borderColor: 'var(--line)' }}
              >
                <div
                  className="flex items-center gap-2 px-4 py-2.5"
                  style={{ background: 'var(--accent-soft)', borderBottom: '1px solid var(--line)' }}
                >
                  <svg className="h-4 w-4" style={{ color: 'var(--accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xs font-bold tracking-wide uppercase" style={{ color: 'var(--accent-strong)' }}>Pipeline Result</span>
                </div>
                <div className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em]" style={{ color: 'var(--text-muted)' }}>
                      Fusion accuracy
                    </p>
                    <span className="mono text-2xl font-bold tracking-tight" style={{ color: 'var(--accent-strong)' }}>
                      {fmt(fusionRow?.accuracy)}
                    </span>
                  </div>
                  <div className="sm:text-right">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em]" style={{ color: 'var(--text-muted)' }}>
                      Best individual
                    </p>
                    <p className="mono mt-1 text-base font-semibold" style={{ color: 'var(--text-strong)' }}>
                      {fmt(bestIndividual?.accuracy)}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: fusionWins ? 'var(--accent-strong)' : 'var(--text-muted)' }}>
                      {fusionWins ? 'Fusion matches or beats individual models' : 'Individual model outperforms fusion'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 max-w-2xl space-y-3 text-sm leading-7" style={{ color: 'var(--text)' }}>
                <p>
                  The table below shows each model's test-set metrics alongside the fused result.
                  Precision, recall, and F1 are weighted averages across classes. Notice how fusion
                  can match or exceed the best single model — it leverages the complementary strengths
                  of each classifier rather than relying on any one of them.
                </p>
                <p>
                  The <strong style={{ color: 'var(--text-strong)' }}>conflict</strong> column
                  shows the average pairwise conflict between models' probability distributions
                  for each test sample. Low conflict means the models broadly agreed; higher values
                  indicate samples where models disagreed significantly.
                </p>
              </div>

              <div className="mt-5 overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--line)' }}>
                <table className="w-full text-sm" style={{ background: 'var(--bg-elevated)' }}>
                  <thead>
                    <tr style={{ color: 'var(--text-muted)', background: 'var(--bg-sunken)' }}>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em]">Model</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em]">Accuracy</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em]">Weighted precision</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em]">Weighted recall</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em]">Weighted F1</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em]">ROC AUC</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em]">Conflict</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r, idx) => {
                      const isFusion = r.kind === 'fusion'
                      const name = isFusion ? `Fusion (${CFG.fusionMethodName})` : (CFG.modelNames[r.model_id] || r.model_id)
                      return (
                        <tr
                          key={`${r.kind}-${r.model_id ?? 'fusion'}-${idx}`}
                          className="border-t"
                          style={{ borderColor: 'var(--line)', background: isFusion ? 'var(--accent-soft)' : 'transparent' }}
                        >
                          <td className="px-4 py-3" style={{ color: 'var(--text-strong)', fontWeight: isFusion ? 700 : 400 }}>
                            <div className="flex items-center gap-2">
                              {isFusion && <span className="inline-block h-2 w-2 rounded-full" style={{ background: 'var(--accent)' }} />}
                              {name}
                            </div>
                          </td>
                          <td className="px-4 py-3 mono" style={{ fontWeight: isFusion ? 700 : 400, color: isFusion ? 'var(--accent-strong)' : 'var(--text)' }}>{fmt(r.accuracy)}</td>
                          <td className="px-4 py-3 mono">{fmt(r.precision)}</td>
                          <td className="px-4 py-3 mono">{fmt(r.recall)}</td>
                          <td className="px-4 py-3 mono">{fmt(r.f1_score)}</td>
                          <td className="px-4 py-3 mono">{fmt(r.roc_auc)}</td>
                          <td className="px-4 py-3 mono">{fmtDec(r.conflict)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )
        })()}
      </section>

      <section className="flex flex-col gap-4 border-t pt-8 sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: 'var(--line)' }}>
        <div>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-strong)' }}>Want to try different models or datasets?</h3>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
            Open the ML Fusion pipeline to pick your own classifiers, upload a custom CSV dataset,
            and compare Dempster-Shafer against PCR5 or PCR6.
          </p>
        </div>
        <button type="button" onClick={() => navigate('/ml')} className="btn btn-primary shrink-0">
          {t('exML.try')}
        </button>
      </section>
    </div>
  )
}

export default ExampleMLFusion
