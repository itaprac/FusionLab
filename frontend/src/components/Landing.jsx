const modules = [
  {
    title: 'Fusion Calculator',
    description: 'Enter belief masses manually, compare methods, and inspect the fused result.',
    action: 'Open calculator',
    target: 'calculator',
  },
  {
    title: 'ML Fusion',
    description: 'Use a dataset-driven workflow to combine model outputs with evidence fusion.',
    action: 'Open ML fusion',
    target: 'ml',
  },
  {
    title: 'Examples',
    description: 'Start from a ready-made scenario to explain the app quickly and clearly.',
    action: 'Open examples',
    target: 'examples',
  },
]

const reasons = [
  'Combine uncertain or conflicting sources in one place.',
  'Compare DST and PCR5 without changing tools.',
  'Use manual inputs, examples, or an ML workflow depending on the presentation.',
]

function Landing({ darkMode, onOpenCalculator, onOpenMLPipeline, onOpenExamples }) {
  const handleTargetOpen = (target) => {
    if (target === 'calculator') onOpenCalculator()
    if (target === 'ml') onOpenMLPipeline()
    if (target === 'examples') onOpenExamples()
  }

  return (
    <div className="py-6 sm:py-8">
      <section className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
        <div className="max-w-3xl">
          <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Fusion Lab
          </p>

          <h2 className={`mt-3 text-3xl font-semibold tracking-tight sm:text-4xl ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            A simple way to present evidence fusion.
          </h2>

          <p className={`mt-4 max-w-2xl text-base leading-7 sm:text-lg ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Fusion Lab shows how multiple uncertain sources can be combined into one fused
            result using Dempster-Shafer Theory and PCR5. You can present it through manual
            inputs, guided examples, or an ML-based workflow.
          </p>

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
              onClick={onOpenMLPipeline}
              className={`btn min-h-[46px] rounded-xl border px-4 ${
                darkMode
                  ? 'border-gray-700 bg-gray-900 text-gray-100 hover:border-gray-600 hover:bg-gray-800'
                  : 'border-gray-200 bg-white text-gray-800 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              Open ML Fusion
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
          </div>
        </div>

        <div className={`rounded-[28px] border p-6 sm:p-8 ${
          darkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'
        }`}>
          <div className={`mb-5 flex justify-between text-sm ${
            darkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            <span>Source A</span>
            <span>Source B</span>
            <span>Source C</span>
          </div>

          <div className="landing-venn">
            <div className={`landing-venn-circle landing-venn-a ${darkMode ? 'landing-venn-dark' : ''}`}>
              <span>Belief</span>
            </div>
            <div className={`landing-venn-circle landing-venn-b ${darkMode ? 'landing-venn-dark' : ''}`}>
              <span>Signal</span>
            </div>
            <div className={`landing-venn-circle landing-venn-c ${darkMode ? 'landing-venn-dark' : ''}`}>
              <span>Expert</span>
            </div>

            <div className={`landing-venn-center ${darkMode ? 'landing-venn-dark' : ''}`}>
              <strong>Fusion</strong>
              <span>DST / PCR5</span>
            </div>
          </div>

          <p className={`mt-4 text-base leading-7 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            The overlap shows the main idea: different sources combine into a single fused result.
          </p>
        </div>
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

      <section className={`mt-10 rounded-2xl border p-6 ${
        darkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'
      }`}>
        <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Why use Fusion Lab
        </h3>
        <ul className={`mt-4 space-y-3 text-sm leading-6 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          {reasons.map((reason) => (
            <li key={reason} className="flex items-start gap-3">
              <span className={`mt-2 h-1.5 w-1.5 rounded-full ${darkMode ? 'bg-teal-400' : 'bg-teal-600'}`} />
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

export default Landing
