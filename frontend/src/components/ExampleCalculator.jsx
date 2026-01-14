import { useEffect, useMemo, useState } from 'react'
import SourceCard from './SourceCard'
import ResultCard from './ResultCard'

function ExampleCalculator({ darkMode, onTryIt }) {
  const methodId = 'dempster'
  const methodName = 'Dempster-Shafer Theory (DST)'

  const sources = useMemo(() => ([
    {
      id: 1,
      name: 'Source 1 – Meteorological conditions',
      description:
        'Worsening weather conditions (pogarszająca się pogoda). Weather-related factors such as snowfall, wind, and temperature changes that influence snowpack stability.',
      hypotheses: [
        { name: 'Level 2 – Moderate', mass: '0.20' },
        { name: 'Level 3 – Considerable', mass: '0.30' },
        { name: 'Level 4 – High', mass: '0.35' },
        { name: 'Uncertainty', mass: '0.15' },
      ],
    },
    {
      id: 2,
      name: 'Source 2 – Field observations',
      description:
        'Terrain still looks stable (teren wygląda jeszcze stabilnie). On-site observations such as visible instability signs and recent avalanche activity (or the absence of it).',
      hypotheses: [
        { name: 'Level 2 – Moderate', mass: '0.40' },
        { name: 'Level 3 – Considerable', mass: '0.30' },
        { name: 'Level 4 – High', mass: '0.10' },
        { name: 'Uncertainty', mass: '0.20' },
      ],
    },
  ]), [])

  const requestSources = useMemo(() => (
    sources.map((s) => ({
      name: s.name,
      masses: Object.fromEntries(
        s.hypotheses.map(h => [h.name, parseFloat(h.mass)])
      ),
    }))
  ), [sources])

  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      setLoading(true)
      setError(null)
      setResult(null)

      try {
        const response = await fetch('/api/fusion', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fusion_method: methodId,
            sources: requestSources,
          }),
        })

        const data = await response.json()
        if (!response.ok) throw new Error(data.detail || 'Fusion failed')
        if (cancelled) return
        setResult(data.result)
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
  }, [methodId, requestSources])

  return (
    <div>
      <div className="mb-6">
        <h2 className={`text-3xl font-semibold tracking-tight mt-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Why using multiple sources improves decisions
        </h2>

        <div className={`mt-4 max-w-4xl ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          <div className="text-base md:text-lg leading-relaxed space-y-3">
            <p>
              In real-world situations, information rarely comes from a single fully reliable source. Across many domains, data can be incomplete,
              uncertain, or even conflicting—especially when conditions change or different perspectives are involved.
            </p>
            <p>
              Evidence fusion combines such inputs in a structured way, supporting decisions that better reflect the overall situation.
              The example below illustrates how this approach can be applied in practice.
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
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 19l6-9 4 6 2-3 6 6H3z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 10l1.5 2" />
          </svg>
          <h2 className={`text-xl font-semibold tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Example: Avalanche hazard assessment
          </h2>
        </div>

        <div className={`mt-3 max-w-4xl ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          <div className="text-base md:text-lg leading-relaxed space-y-3">
            <p>
              Assessing avalanche risk in mountainous areas is a critical task, as even small changes in conditions can significantly affect safety.
              In practice, the level of avalanche danger is expressed using a multi-level scale, where the final assessment must reflect both
              environmental conditions and observations made in the field.
            </p>
            <p>
              In this example, the data fusion calculator is used to estimate the current avalanche danger level using information from multiple sources.
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
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 5h10a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2z" />
              </svg>
              <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Sources of information
              </h3>
            </div>

            <p className={`text-base mt-2 max-w-4xl ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              The avalanche danger level is assessed using the five-level avalanche danger scale, where higher levels indicate increasing risk.
              Each source assigns belief masses to selected danger levels based on the information it provides.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sources.map((s, idx) => (
              <SourceCard
                key={s.id}
                source={s}
                index={idx + 1}
                canRemove={false}
                onRemove={() => {}}
                onUpdateName={() => {}}
                onAddHypothesis={() => {}}
                onRemoveHypothesis={() => {}}
                onUpdateHypothesis={() => {}}
                darkMode={darkMode}
                readOnly
                description={s.description}
              />
            ))}
          </div>
        </div>

        <div className="mt-10">
          <h2 className={`text-xl font-semibold tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Result
          </h2>

          <div className={`mt-4 max-w-4xl ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <div className="mb-4">
              <div className={`text-sm font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>

              </div>
              <div className={`mt-2 text-base leading-relaxed space-y-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <p>
                  The fused result indicates Level 3 – Considerable avalanche danger.
                </p>
                <p>
                  While the individual sources pointed toward different levels, data fusion resolves this uncertainty and highlights a risk level that requires increased caution.
                </p>
              </div>

              <div className={`mt-3 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {loading && 'Obliczanie fuzji…'}
                {!loading && error && `Nie udało się policzyć wyniku: ${error}`}
              </div>
            </div>

            {result && (
              <ResultCard
                result={result}
                methodId={methodId}
                methodName={methodName}
                darkMode={darkMode}
                displayOrder={['Level 2 – Moderate', 'Level 3 – Considerable', 'Level 4 – High', 'Uncertainty']}
              />
            )}

            <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className={`text-sm font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                  Want to try it by yourself?
                </div>
                <div className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Open the Fusion Calculator with these sources pre-filled.
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
                Open Fusion Calculator
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExampleCalculator
