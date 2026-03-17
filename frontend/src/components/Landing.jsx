const capabilityPanels = [
  {
    title: 'Fusion Calculator',
    description: 'Enter belief masses, compare DST and PCR5, and inspect fused output with conflict.',
    action: 'Open calculator',
    target: 'calculator',
  },
  {
    title: 'ML Fusion Pipeline',
    description: 'Run a dataset-driven workflow that combines model outputs with evidence fusion.',
    action: 'Open ML fusion',
    target: 'ml',
  },
  {
    title: 'Examples',
    description: 'Use guided scenarios such as avalanche hazard assessment to present the workflow quickly.',
    action: 'Open examples',
    target: 'examples',
  },
]

const whyFusionPoints = [
  'It makes disagreement visible instead of hiding it.',
  'It works well with uncertainty and incomplete evidence.',
  'It lets you compare DST and PCR5 in one place.',
]

function Landing({ darkMode, onOpenCalculator, onOpenMLPipeline, onOpenExamples }) {
  const handleScrollToCapabilities = () => {
    const prefersReducedMotion = typeof window !== 'undefined'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches

    document.getElementById('platform-capabilities')?.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'start',
    })
  }

  const handleTargetOpen = (target) => {
    if (target === 'calculator') onOpenCalculator()
    if (target === 'ml') onOpenMLPipeline()
    if (target === 'examples') onOpenExamples()
  }

  return (
    <div className="landing-shell py-4 sm:py-8 lg:py-10">
      <section className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:items-center">
        <div className="max-w-3xl">
          <p className={`landing-eyebrow ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Fusion Lab · Evidence fusion workbench
          </p>

          <h1 className={`display-title mt-4 max-w-4xl ${darkMode ? 'text-slate-50' : 'text-slate-900'}`}>
            Turn uncertain evidence into clear, defensible outcomes.
          </h1>

          <p className={`mt-5 max-w-2xl text-base leading-7 sm:text-lg ${
            darkMode ? 'text-slate-300' : 'text-slate-700'
          }`}>
            Fusion Lab combines uncertain, incomplete, or conflicting evidence with
            Dempster-Shafer and PCR5 methods, then lets you present the result through
            examples, manual calculation, or an ML workflow.
          </p>

          <div className="mt-7 flex flex-wrap gap-2.5">
            {['DST & PCR5', 'Interactive examples', 'ML workflow'].map((item) => (
              <span key={item} className="editorial-tag">
                {item}
              </span>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3 md:flex-row md:flex-wrap">
            <button type="button" className="btn btn-hero-primary" onClick={handleScrollToCapabilities}>
              See capabilities
            </button>
            <button type="button" className="btn btn-hero-secondary" onClick={onOpenCalculator}>
              Open Fusion Calculator
            </button>
            <button type="button" className="btn btn-hero-secondary" onClick={onOpenMLPipeline}>
              Open ML Fusion
            </button>
          </div>
        </div>

        <div className={`fusion-figure ${darkMode ? 'fusion-figure-dark' : 'fusion-figure-light'}`} aria-hidden="true">
          <div className="fusion-figure-labels">
            <span>Source A</span>
            <span>Source B</span>
            <span>Source C</span>
          </div>

          <div className="fusion-figure-stage">
            <div className="fusion-source fusion-source-a">
              <strong>Belief</strong>
            </div>
            <div className="fusion-source fusion-source-b">
              <strong>Signal</strong>
            </div>
            <div className="fusion-source fusion-source-c">
              <strong>Expert</strong>
            </div>

            <div className="fusion-core">
              <span className="fusion-core-method">DST / PCR5</span>
              <span className="fusion-core-result">Fused result</span>
            </div>

            <svg viewBox="0 0 420 280" className="fusion-lines">
              <path d="M90 92 C140 118, 170 128, 208 140" />
              <path d="M328 92 C286 118, 250 128, 208 140" />
              <path d="M150 230 C176 205, 190 176, 208 140" />
            </svg>
          </div>

          <p className={`fusion-caption ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            One place to compare evidence, conflict, and fusion behavior.
          </p>
        </div>
      </section>

      <section id="platform-capabilities" className="editorial-section">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="landing-eyebrow text-slate-500 dark:text-slate-400">Capabilities</p>
            <h2 className={`editorial-heading mt-3 ${darkMode ? 'text-slate-50' : 'text-slate-900'}`}>
              A shorter overview of what you can present.
            </h2>
          </div>
          <button type="button" className="btn btn-hero-secondary w-fit" onClick={onOpenExamples}>
            Open examples
          </button>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {capabilityPanels.map((panel) => (
            <article key={panel.title} className="editorial-panel editorial-panel-slate">
              <h3 className={`text-xl font-semibold tracking-tight ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                {panel.title}
              </h3>
              <p className={`mt-3 text-sm leading-7 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                {panel.description}
              </p>
              <button
                type="button"
                className="btn btn-card mt-6"
                onClick={() => handleTargetOpen(panel.target)}
              >
                {panel.action}
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="editorial-section grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
        <article className="editorial-panel editorial-panel-slate">
          <p className="landing-eyebrow text-slate-500 dark:text-slate-400">Why fusion</p>
          <h2 className={`editorial-heading mt-3 ${darkMode ? 'text-slate-50' : 'text-slate-900'}`}>
            Why it matters
          </h2>
          <ul className={`mt-5 space-y-3 text-sm leading-7 sm:text-base ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            {whyFusionPoints.map((point) => (
              <li key={point} className="flex items-start gap-3">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-teal-600 dark:bg-teal-400" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="editorial-panel editorial-panel-teal">
          <p className="landing-eyebrow text-slate-500 dark:text-slate-400">Methods</p>
          <h2 className={`editorial-heading mt-3 ${darkMode ? 'text-slate-50' : 'text-slate-900'}`}>
            DST and PCR5, side by side.
          </h2>
          <div className={`mt-5 space-y-4 text-sm leading-7 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            <p><strong className={darkMode ? 'text-slate-100' : 'text-slate-900'}>Dempster-Shafer:</strong> useful when evidence is fairly compatible.</p>
            <p><strong className={darkMode ? 'text-slate-100' : 'text-slate-900'}>PCR5:</strong> useful when sources disagree more strongly.</p>
          </div>
        </article>
      </section>
    </div>
  )
}

export default Landing
