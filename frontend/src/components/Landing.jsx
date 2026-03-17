import { useEffect } from 'react'

const reasons = [
  {
    title: 'Explain fusion clearly',
    description: 'Show how multiple sources contribute to one final result instead of presenting the method as a black box.',
  },
  {
    title: 'Compare methods in one place',
    description: 'Use the same interface to demonstrate both Dempster-Shafer Theory and DSmT.',
  },
  {
    title: 'Present real examples',
    description: 'Move from a simple overview to ready-made scenarios, manual inputs, or an ML-based workflow.',
  },
]

const modules = [
  {
    title: 'Fusion Calculator',
    description: 'Manually define sources, choose a method, and inspect the fused output.',
    action: 'Open calculator',
    target: 'calculator',
  },
  {
    title: 'Examples',
    description: 'Start from a guided scenario to explain the method quickly and clearly.',
    action: 'Open examples',
    target: 'examples',
  },
  {
    title: 'ML Fusion',
    description: 'Show how model outputs can also be combined through the same fusion workflow.',
    action: 'Open ML fusion',
    target: 'ml',
  },
]

const workflowSteps = [
  {
    number: '01',
    title: 'Add sources',
    description: 'Start from two or more inputs that contain uncertainty, disagreement, or partial confidence.',
  },
  {
    number: '02',
    title: 'Choose a fusion method',
    description: 'Compare DST and DSmT depending on how you want to handle conflict between sources.',
  },
  {
    number: '03',
    title: 'Calculate the result',
    description: 'Combine all evidence into one fused output using the selected method.',
  },
  {
    number: '04',
    title: 'Inspect the outcome',
    description: 'Present the final belief distribution, conflict, and interpretation in a clear way.',
  },
]

function Landing({
  darkMode,
  onToggleDarkMode,
  onOpenCalculator,
  onOpenMLPipeline,
  onOpenExamples,
}) {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const elements = Array.from(document.querySelectorAll('[data-reveal]'))

    if (prefersReducedMotion) {
      elements.forEach((element) => element.classList.add('is-visible'))
      return undefined
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      {
        threshold: 0.16,
        rootMargin: '0px 0px -8% 0px',
      }
    )

    elements.forEach((element) => observer.observe(element))

    return () => observer.disconnect()
  }, [])

  const handleTargetOpen = (target) => {
    if (target === 'calculator') onOpenCalculator()
    if (target === 'ml') onOpenMLPipeline()
    if (target === 'examples') onOpenExamples()
  }

  return (
    <div className="landing-page min-h-screen">
      <header className={`motion-intro motion-delay-1 border-b ${darkMode ? 'border-slate-800 bg-slate-950/95' : 'border-slate-200 bg-white/95'}`}>
        <div className="app-container flex items-center justify-between gap-4 py-5">
          <div>
            <div className={`text-lg font-semibold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              Fusion Lab
            </div>
            <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Evidence fusion for uncertain data
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onToggleDarkMode}
              className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${
                darkMode
                  ? 'border-slate-700 bg-slate-900 text-slate-100 hover:border-slate-600 hover:bg-slate-800'
                  : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {darkMode ? (
                <svg className="mr-2 inline-block h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="mr-2 inline-block h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
              {darkMode ? 'Light mode' : 'Dark mode'}
            </button>

            <button
              type="button"
              onClick={onOpenCalculator}
              className="btn btn-primary rounded-xl px-4 py-2.5"
            >
              Open app
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="app-container grid gap-10 py-12 sm:py-16 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] lg:items-center">
          <div className="max-w-3xl">
            <p className={`motion-intro motion-delay-2 text-sm font-medium uppercase tracking-[0.18em] ${darkMode ? 'text-teal-300' : 'text-teal-700'}`}>
              Full landing page
            </p>

            <h1 className={`motion-intro motion-delay-3 mt-4 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl ${
              darkMode ? 'text-white' : 'text-slate-900'
            }`}>
              Present evidence fusion like a complete product.
            </h1>

            <div className={`motion-intro motion-delay-4 mt-6 max-w-2xl space-y-4 text-base leading-8 sm:text-lg ${
              darkMode ? 'text-slate-300' : 'text-slate-700'
            }`}>
              <p>
                Fusion Lab helps explain how uncertain or conflicting sources can be combined
                into one fused result using Dempster-Shafer Theory and DSmT.
              </p>
              <p>
                Instead of showing only formulas or raw inputs, the app lets you present the
                full workflow — from sources, through method selection, to the final outcome.
              </p>
            </div>

            <div className="motion-intro motion-delay-5 mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                onClick={onOpenCalculator}
                className="btn btn-primary min-h-[48px] rounded-xl px-5 transition-transform duration-300 hover:-translate-y-0.5"
              >
                Open Fusion Calculator
              </button>
              <button
                type="button"
                onClick={onOpenExamples}
                className={`btn min-h-[48px] rounded-xl border px-5 transition-transform duration-300 hover:-translate-y-0.5 ${
                  darkMode
                    ? 'border-slate-700 bg-slate-900 text-slate-100 hover:border-slate-600 hover:bg-slate-800'
                    : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                Open Examples
              </button>
              <button
                type="button"
                onClick={onOpenMLPipeline}
                className={`btn min-h-[48px] rounded-xl border px-5 transition-transform duration-300 hover:-translate-y-0.5 ${
                  darkMode
                    ? 'border-slate-700 bg-slate-900 text-slate-100 hover:border-slate-600 hover:bg-slate-800'
                    : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                Open ML Fusion
              </button>
            </div>
          </div>

          <div className={`motion-intro motion-delay-4 rounded-[2rem] border p-6 sm:p-7 ${
            darkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'
          }`}>
            <div className="mb-5">
              <p className={`text-sm font-medium uppercase tracking-[0.16em] ${
                darkMode ? 'text-slate-400' : 'text-slate-500'
              }`}>
                Application flow
              </p>
              <h2 className={`mt-2 text-2xl font-semibold tracking-tight ${
                darkMode ? 'text-white' : 'text-slate-900'
              }`}>
                From uncertain sources to one fused result
              </h2>
            </div>

            <div className="space-y-2.5">
              {workflowSteps.map((step, index) => (
                <div key={step.number}>
                    <div className={`rounded-2xl border p-4 transition-transform duration-300 hover:-translate-y-0.5 ${
                      darkMode ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50/60'
                    }`}>
                    <div className="flex items-start gap-4">
                      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-semibold ${
                        darkMode ? 'bg-teal-500/10 text-teal-300' : 'bg-teal-50 text-teal-700'
                      }`}>
                        {step.number}
                      </div>
                      <div>
                        <h3 className={`text-base font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                          {step.title}
                        </h3>
                        <p className={`mt-1 text-sm leading-6 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {index < workflowSteps.length - 1 && (
                    <div className="flex justify-center py-1">
                      <div className={`h-4 w-px ${darkMode ? 'bg-slate-700' : 'bg-slate-300'}`} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="app-container py-2 sm:py-4">
          <div className="grid gap-4 lg:grid-cols-3">
            {reasons.map((reason, index) => (
              <article
                key={reason.title}
                data-reveal
                style={{ '--reveal-delay': `${index * 90}ms` }}
                className={`reveal-on-scroll rounded-2xl border p-6 ${
                  darkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'
                }`}
              >
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  {reason.title}
                </h3>
                <p className={`mt-3 text-sm leading-7 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  {reason.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="app-container py-10 sm:py-14">
          <div data-reveal className="reveal-on-scroll mb-6 max-w-2xl">
            <p className={`text-sm font-medium uppercase tracking-[0.16em] ${
              darkMode ? 'text-slate-400' : 'text-slate-500'
            }`}>
              Explore the platform
            </p>
            <h2 className={`mt-2 text-3xl font-semibold tracking-tight ${
              darkMode ? 'text-white' : 'text-slate-900'
            }`}>
              Choose the path that fits your presentation best.
            </h2>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {modules.map((module, index) => (
              <article
                key={module.title}
                data-reveal
                style={{ '--reveal-delay': `${index * 110}ms` }}
                className={`reveal-on-scroll rounded-2xl border p-6 ${
                  darkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'
                }`}
              >
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  {module.title}
                </h3>
                <p className={`mt-3 text-sm leading-7 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  {module.description}
                </p>
                <button
                  type="button"
                  onClick={() => handleTargetOpen(module.target)}
                  className={`mt-5 inline-flex items-center rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-300 hover:-translate-y-0.5 ${
                    darkMode
                      ? 'border-slate-700 text-slate-100 hover:border-slate-600 hover:bg-slate-800'
                      : 'border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {module.action}
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="app-container pb-14 sm:pb-20">
          <div data-reveal className={`reveal-on-scroll rounded-[2rem] border px-6 py-8 sm:px-8 sm:py-10 ${
            darkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'
          }`}>
            <div className="max-w-3xl">
              <h2 className={`text-2xl font-semibold tracking-tight sm:text-3xl ${
                darkMode ? 'text-white' : 'text-slate-900'
              }`}>
                Ready to show how fusion works?
              </h2>
              <p className={`mt-3 text-base leading-7 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Start with the calculator for the clearest demo, or use examples and ML fusion
                when you want to present a broader workflow.
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                onClick={onOpenCalculator}
                className="btn btn-primary min-h-[48px] rounded-xl px-5 transition-transform duration-300 hover:-translate-y-0.5"
              >
                Start with calculator
              </button>
              <button
                type="button"
                onClick={onOpenExamples}
                className={`btn min-h-[48px] rounded-xl border px-5 transition-transform duration-300 hover:-translate-y-0.5 ${
                  darkMode
                    ? 'border-slate-700 bg-slate-900 text-slate-100 hover:border-slate-600 hover:bg-slate-800'
                    : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                View examples
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default Landing
