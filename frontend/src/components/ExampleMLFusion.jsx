import { useEffect, useState } from 'react'

const EXAMPLE_CONFIG = {
  datasetId: 'digits',
  datasetName: 'Optical recognition of handwritten digits',
  models: ['svm', 'rf', 'logistic_regression'],
  modelNames: {
    svm: 'Support Vector Machine (SVM)',
    rf: 'Random Forest',
    logistic_regression: 'Logistic Regression',
  },
  fusionMethod: 'dempster',
  fusionMethodName: 'Dempster-Shafer Theory (DST)',
}

function ExampleMLFusion({ darkMode, onTryIt }) {
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      setLoading(true)
      setError(null)
      setResults(null)

      try {
        const response = await fetch('/api/ml/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            datasetId: EXAMPLE_CONFIG.datasetId,
            models: EXAMPLE_CONFIG.models,
            fusionMethod: EXAMPLE_CONFIG.fusionMethod,
          }),
        })

        const data = await response.json()
        if (!response.ok) throw new Error(data.detail || 'ML Fusion failed')
        if (cancelled) return
        setResults(data.results)
      } catch (e) {
        if (cancelled) return
        setError(e.message)
      } finally {
        if (cancelled) return
        setLoading(false)
      }
    }

    run()
    return () => { cancelled = true }
  }, [])

  const fmt = (value) => {
    if (value === null || typeof value === 'undefined' || Number.isNaN(Number(value))) return '-'
    return `${(Number(value) * 100).toFixed(1)}%`
  }

  const fmtDec = (value) => {
    if (value === null || typeof value === 'undefined' || Number.isNaN(Number(value))) return '-'
    return Number(value).toFixed(3)
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className={`text-3xl font-semibold tracking-tight mt-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Why fusing ML models can outperform individual classifiers
        </h2>

        <div className={`mt-4 max-w-4xl ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          <div className="text-base md:text-lg leading-relaxed space-y-3">
            <p>
              A single classifier may perform well on most of the data, but every model has blind spots — regions of the
              feature space where it is uncertain or makes systematic errors. By training multiple classifiers and fusing
              their probabilistic outputs through Dempster-Shafer Theory, we can combine their strengths while reducing
              individual weaknesses.
            </p>
            <p>
              The example below trains three different classifiers on the handwritten digits dataset and fuses their
              predictions to show how the combined result compares to each model individually.
            </p>
          </div>
        </div>

        <div className="mt-8 flex items-center gap-2">
          <svg
            className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <h2 className={`text-xl font-semibold tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Example: Handwritten digits with SVM, Random Forest, and Logistic Regression
          </h2>
        </div>

        <div className={`mt-3 max-w-4xl ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          <div className="text-base md:text-lg leading-relaxed space-y-3">
            <p>
              The digits dataset bundles small grayscale scans of handwritten digits (0–9). Each image is flattened into
              64 pixel intensities from an 8×8 grid—simple enough to run quickly, yet rich enough to compare how
              different learners behave on the same features.
            </p>
            <p>
              We combine three common choices: SVM (margin-based, strong with scaled inputs), Random Forest
              (ensemble of decision trees), and Logistic Regression (linear boundaries in feature space). Each outputs
              class probabilities; those distributions are turned into belief masses and fused with Dempster’s rule of
              combination.
            </p>
          </div>
        </div>

        <div className="mt-8">
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <svg
                className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Pipeline configuration
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`rounded-2xl border p-5 ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
              <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${darkMode ? 'text-teal-300/80' : 'text-teal-700/80'}`}>
                Dataset
              </p>
              <p className={`mt-2 font-medium ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                {EXAMPLE_CONFIG.datasetName}
              </p>
              <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                1,797 samples, 64 features (8×8 pixels), 10 classes
              </p>
            </div>

            <div className={`rounded-2xl border p-5 ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
              <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${darkMode ? 'text-teal-300/80' : 'text-teal-700/80'}`}>
                Models
              </p>
              <div className="mt-2 space-y-1">
                {EXAMPLE_CONFIG.models.map(id => (
                  <p key={id} className={`font-medium ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                    {EXAMPLE_CONFIG.modelNames[id]}
                  </p>
                ))}
              </div>
            </div>

            <div className={`rounded-2xl border p-5 ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
              <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${darkMode ? 'text-teal-300/80' : 'text-teal-700/80'}`}>
                Fusion method
              </p>
              <p className={`mt-2 font-medium ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                {EXAMPLE_CONFIG.fusionMethodName}
              </p>
              <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Probabilistic outputs treated as belief masses
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <h2 className={`text-xl font-semibold tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Results
          </h2>

          <div className={`mt-4 max-w-4xl ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <div className={`mt-3 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {loading && 'Training models and running fusion…'}
              {!loading && error && `Failed to compute results: ${error}`}
            </div>

            {!loading && results && (
              <>
                <div className="mb-4">
                  <div className="text-base leading-relaxed space-y-2">
                    <p>
                      The table below shows individual model metrics alongside the fused result.
                      Notice how fusion can match or exceed the best single model by combining
                      complementary information from all classifiers.
                    </p>
                  </div>
                </div>

                <div className={`rounded-2xl border overflow-hidden ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                          <th className="text-left font-semibold px-4 py-3">Model</th>
                          <th className="text-left font-semibold px-4 py-3">Accuracy</th>
                          <th className="text-left font-semibold px-4 py-3">Precision</th>
                          <th className="text-left font-semibold px-4 py-3">Recall</th>
                          <th className="text-left font-semibold px-4 py-3">F1</th>
                          <th className="text-left font-semibold px-4 py-3">ROC AUC</th>
                          <th className="text-left font-semibold px-4 py-3">Conflict</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.map((r, idx) => {
                          const isFusion = r.kind === 'fusion'
                          const modelName = isFusion
                            ? `Fusion (${EXAMPLE_CONFIG.fusionMethodName})`
                            : (EXAMPLE_CONFIG.modelNames[r.model_id] || r.model_id)

                          return (
                            <tr
                              key={`${r.kind}-${r.model_id ?? 'fusion'}-${idx}`}
                              className={`${darkMode ? 'border-t border-gray-800' : 'border-t border-gray-200'} ${
                                isFusion
                                  ? darkMode ? 'bg-teal-500/5' : 'bg-teal-50/60'
                                  : ''
                              }`}
                            >
                              <td className={`px-4 py-2.5 ${isFusion ? 'font-semibold' : ''} ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                                {modelName}
                              </td>
                              <td className={`px-4 py-2.5 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{fmt(r.accuracy)}</td>
                              <td className={`px-4 py-2.5 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{fmt(r.precision)}</td>
                              <td className={`px-4 py-2.5 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{fmt(r.recall)}</td>
                              <td className={`px-4 py-2.5 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{fmt(r.f1_score)}</td>
                              <td className={`px-4 py-2.5 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{fmt(r.roc_auc)}</td>
                              <td className={`px-4 py-2.5 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{fmtDec(r.conflict)}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className={`text-sm font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                  Want to try different models or datasets?
                </div>
                <div className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Open ML Fusion to pick your own configuration.
                </div>
              </div>
              <button
                type="button"
                onClick={onTryIt}
                disabled={typeof onTryIt !== 'function'}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  typeof onTryIt !== 'function'
                    ? (darkMode ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed')
                    : (darkMode ? 'bg-gray-200 hover:bg-gray-100 text-gray-900' : 'bg-gray-900 hover:bg-gray-800 text-white')
                }`}
              >
                Open ML Fusion
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExampleMLFusion
