const modules = [
  {
    title: 'Fusion Calculator',
    description: 'Manually enter sources, choose a method, and inspect the fused result.',
    action: 'Open calculator',
    target: 'calculator',
  },
  {
    title: 'Examples',
    description: 'Start from a ready-made scenario and explain the idea without extra setup.',
    action: 'Open examples',
    target: 'examples',
  },
  {
    title: 'ML Fusion',
    description: 'Show how model outputs can also be combined through the same fusion logic.',
    action: 'Open ML fusion',
    target: 'ml',
  },
]

function VennDiagram({ darkMode }) {
  const stroke = darkMode ? 'rgba(148, 163, 184, 0.45)' : 'rgba(148, 163, 184, 0.6)'
  const fillLeft = darkMode ? 'rgba(20, 184, 166, 0.10)' : 'rgba(20, 184, 166, 0.10)'
  const fillRight = darkMode ? 'rgba(59, 130, 246, 0.08)' : 'rgba(59, 130, 246, 0.08)'
  const fillCenter = darkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(15, 23, 42, 0.03)'
  const text = darkMode ? '#E5E7EB' : '#0F172A'
  const muted = darkMode ? '#94A3B8' : '#64748B'

  return (
    <svg viewBox="0 0 420 260" className="h-full w-full" aria-hidden="true">
      <text x="126" y="34" textAnchor="middle" fontSize="16" fontWeight="500" fill={muted}>
        Source 1
      </text>
      <text x="294" y="34" textAnchor="middle" fontSize="16" fontWeight="500" fill={muted}>
        Source 2
      </text>

      <circle cx="155" cy="122" r="84" fill={fillLeft} stroke={stroke} strokeWidth="2" />
      <circle cx="265" cy="122" r="84" fill={fillRight} stroke={stroke} strokeWidth="2" />
      <circle cx="210" cy="122" r="58" fill={fillCenter} stroke={stroke} strokeWidth="1.5" />

      <text x="155" y="126" textAnchor="middle" fontSize="18" fontWeight="600" fill={text}>
        Source 1
      </text>
      <text x="265" y="126" textAnchor="middle" fontSize="18" fontWeight="600" fill={text}>
        Source 2
      </text>

      <text x="210" y="114" textAnchor="middle" fontSize="19" fontWeight="700" fill={text}>
        Fusion
      </text>
      <text x="210" y="138" textAnchor="middle" fontSize="13" fontWeight="500" fill={muted}>
        shared result
      </text>
    </svg>
  )
}

function Landing({ darkMode, onOpenCalculator, onOpenMLPipeline, onOpenExamples }) {
  const handleTargetOpen = (target) => {
    if (target === 'calculator') onOpenCalculator()
    if (target === 'ml') onOpenMLPipeline()
    if (target === 'examples') onOpenExamples()
  }

  return (
    <div className="py-6 sm:py-8">
      <section className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_460px] lg:items-center">
        <div className="max-w-3xl">
          <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Fusion Lab
          </p>

          <h2 className={`mt-3 text-3xl font-semibold tracking-tight sm:text-4xl ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Present how evidence fusion works in a clear way.
          </h2>

          <div className={`mt-4 max-w-2xl space-y-3 text-base leading-7 sm:text-lg ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            <p>
              Fusion Lab shows how different sources can be combined into one fused result
              using Dempster-Shafer Theory and PCR5.
            </p>
            <p>
              It works well for demos, explanations, and presentations where you want to
              show both the idea of fusion and the final outcome.
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              onClick={onOpenCalculator}
              className="btn btn-primary min-h-[46px] rounded-xl px-4"
            >
              Open Fusion Calculator
            </button>
            <button
              type="button"
              onClick={onOpenExamples}
              className={`btn min-h-[46px] rounded-xl border px-4 ${
                darkMode
                  ? 'border-gray-700 bg-gray-900 text-gray-100 hover:border-gray-600 hover:bg-gray-800'
                  : 'border-gray-200 bg-white text-gray-800 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              Open Examples
            </button>
            <button
              type="button"
              onClick={onOpenMLPipeline}
              className={`btn min-h-[46px] rounded-xl border px-4 ${
                darkMode
                  ? 'border-gray-700 bg-gray-900 text-gray-100 hover:border-gray-600 hover:bg-gray-800'
                  : 'border-gray-200 bg-white text-gray-800 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              Open ML Fusion
            </button>
          </div>
        </div>

        <div className={`rounded-[28px] border p-6 sm:p-8 ${
          darkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'
        }`}>
          <div className="mx-auto max-w-[420px]">
            <div className="h-[260px]">
              <VennDiagram darkMode={darkMode} />
            </div>
            <p className={`mt-4 text-base leading-7 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              The diagram shows the core idea: two sources overlap and create one fused result.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <article className={`rounded-2xl border p-6 ${
          darkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'
        }`}>
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Why use this?
          </h3>
          <div className={`mt-4 space-y-3 text-sm leading-7 sm:text-base ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            <p>
              In real situations, information rarely comes from one fully reliable source.
              Different inputs may point in different directions or contain uncertainty.
            </p>
            <p>
              Fusion Lab helps explain how those inputs can be combined into one clearer
              result, which makes it useful for both understanding and presenting the method.
            </p>
          </div>
        </article>

        <article className={`rounded-2xl border p-6 ${
          darkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'
        }`}>
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            What you can show
          </h3>
          <ul className={`mt-4 space-y-3 text-sm leading-6 ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            <li className="flex items-start gap-3">
              <span className={`mt-2 h-1.5 w-1.5 rounded-full ${darkMode ? 'bg-teal-400' : 'bg-teal-600'}`} />
              <span>How multiple sources contribute to one result.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className={`mt-2 h-1.5 w-1.5 rounded-full ${darkMode ? 'bg-teal-400' : 'bg-teal-600'}`} />
              <span>The difference between DST and PCR5.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className={`mt-2 h-1.5 w-1.5 rounded-full ${darkMode ? 'bg-teal-400' : 'bg-teal-600'}`} />
              <span>Examples, manual inputs, and ML-based workflows.</span>
            </li>
          </ul>
        </article>
      </section>

      <section className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {modules.map((module) => (
          <article
            key={module.title}
            className={`rounded-2xl border p-5 ${
              darkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'
            }`}
          >
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {module.title}
            </h3>
            <p className={`mt-2 text-sm leading-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {module.description}
            </p>
            <button
              type="button"
              onClick={() => handleTargetOpen(module.target)}
              className={`mt-4 inline-flex items-center rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${
                darkMode
                  ? 'border-gray-700 text-gray-100 hover:border-gray-600 hover:bg-gray-800'
                  : 'border-gray-200 text-gray-800 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              {module.action}
            </button>
          </article>
        ))}
      </section>
    </div>
  )
}

export default Landing
