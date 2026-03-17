const capabilityPanels = [
  {
    eyebrow: 'Manual workflow',
    title: 'Fusion Calculator',
    description:
      'Enter belief masses by hand, switch between Dempster-Shafer and PCR5, and inspect fused masses alongside conflict.',
    action: 'Open calculator',
    accent: 'teal',
    target: 'calculator',
  },
  {
    eyebrow: 'Model-driven workflow',
    title: 'ML Fusion Pipeline',
    description:
      'Select or upload a dataset, combine model outputs with a fusion method, and compare the resulting decision path.',
    action: 'Explore ML pipeline',
    accent: 'amber',
    target: 'ml',
  },
  {
    eyebrow: 'Guided learning',
    title: 'Examples',
    description:
      'Start from curated scenarios such as avalanche hazard assessment and see how evidence fusion behaves in practice.',
    action: 'Open examples',
    accent: 'slate',
    target: 'examples',
  },
]

const whyFusionPoints = [
  {
    title: 'Handle disagreement explicitly',
    text: 'Fusion reveals where sources conflict instead of collapsing disagreement into a single opaque score.',
  },
  {
    title: 'Work with uncertainty, not against it',
    text: 'Belief masses make it possible to model partial confidence, ambiguity, and incomplete evidence.',
  },
  {
    title: 'Compare reasoning paths',
    text: 'Dempster-Shafer and PCR5 let you inspect how different fusion assumptions affect the final outcome.',
  },
]

const useCases = [
  {
    title: 'Hazard assessment',
    text: 'Combine field observations, forecasts, and expert judgement when safety decisions must account for uncertainty.',
  },
  {
    title: 'Conflicting sensor or expert inputs',
    text: 'Inspect how strongly disagreeing sources contribute to conflict before choosing a course of action.',
  },
  {
    title: 'Model ensemble decision support',
    text: 'Fuse classifier outputs into a more interpretable decision process than a single-model prediction alone.',
  },
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
    <div className="landing-shell py-6 sm:py-10 lg:py-12">
      <section className="grid gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] lg:items-start">
        <div className="max-w-3xl">
          <div className="chip mb-5 w-fit">Fusion Lab · Evidence Fusion Workbench</div>
          <h1 className={`display-title max-w-4xl ${darkMode ? 'text-slate-50' : 'text-slate-900'}`}>
            Turn uncertain evidence into defensible decisions.
          </h1>
          <p className={`mt-6 max-w-2xl text-base leading-8 sm:text-lg ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            Fusion Lab helps you combine uncertain, incomplete, or conflicting evidence
            using Dempster-Shafer and PCR5 methods, then explore the outcome through
            interactive examples and an ML fusion workflow.
          </p>

          <div className="mt-6 flex flex-wrap gap-2.5">
            {['Evidence fusion', 'DST & PCR5', 'Interactive examples', 'ML workflow'].map((item) => (
              <span key={item} className="editorial-tag">
                {item}
              </span>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <button type="button" className="btn btn-primary px-5 py-3" onClick={handleScrollToCapabilities}>
              See platform capabilities
            </button>
            <button type="button" className="btn btn-secondary px-5 py-3" onClick={onOpenCalculator}>
              Open Fusion Calculator
            </button>
            <button type="button" className="btn btn-link px-0 py-2" onClick={onOpenMLPipeline}>
              Explore ML Fusion
            </button>
          </div>
        </div>

        <div
          aria-hidden="true"
          className={[
            'editorial-visual relative overflow-hidden rounded-[2rem] border p-6 sm:p-8',
            darkMode
              ? 'border-slate-800 bg-[linear-gradient(180deg,rgba(17,24,39,0.92),rgba(8,15,25,0.98))]'
              : 'border-[rgba(15,23,42,0.08)] bg-[linear-gradient(180deg,rgba(251,252,251,0.96),rgba(240,245,244,0.98))]',
          ].join(' ')}
        >
          <div className="pointer-events-none absolute inset-x-8 top-6 flex items-center justify-between text-[0.65rem] uppercase tracking-[0.26em] text-slate-500/85 dark:text-slate-400/80">
            <span>Source A</span>
            <span>Source B</span>
            <span>Source C</span>
          </div>

          <div className="relative mt-8 h-[340px] sm:h-[380px]">
            <div className="absolute left-[2%] top-[18%] h-24 w-24 rounded-full border border-teal-500/30 bg-teal-500/14 blur-[0.2px]" />
            <div className="absolute right-[12%] top-[14%] h-28 w-28 rounded-full border border-amber-500/30 bg-amber-400/14 blur-[0.2px]" />
            <div className="absolute left-[28%] bottom-[20%] h-28 w-28 rounded-full border border-slate-400/30 bg-slate-400/12 blur-[0.2px]" />

            <svg viewBox="0 0 480 360" className="absolute inset-0 h-full w-full">
              <defs>
                <linearGradient id="fusionPath" x1="0%" x2="100%" y1="0%" y2="100%">
                  <stop offset="0%" stopColor={darkMode ? '#5eead4' : '#0f766e'} stopOpacity="0.72" />
                  <stop offset="100%" stopColor={darkMode ? '#fbbf24' : '#b45309'} stopOpacity="0.5" />
                </linearGradient>
              </defs>

              <path
                d="M94 106 C174 146, 212 148, 246 182"
                fill="none"
                opacity="0.9"
                stroke="url(#fusionPath)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray="6 8"
              />
              <path
                d="M372 104 C326 144, 292 152, 246 182"
                fill="none"
                opacity="0.85"
                stroke="url(#fusionPath)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray="6 8"
              />
              <path
                d="M174 290 C212 252, 222 222, 246 182"
                fill="none"
                opacity="0.78"
                stroke="url(#fusionPath)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray="6 8"
              />

              <circle cx="96" cy="104" r="42" fill={darkMode ? 'rgba(20,184,166,0.14)' : 'rgba(13,148,136,0.11)'} stroke={darkMode ? 'rgba(94,234,212,0.46)' : 'rgba(15,118,110,0.26)'} />
              <circle cx="372" cy="104" r="48" fill={darkMode ? 'rgba(251,191,36,0.12)' : 'rgba(245,158,11,0.1)'} stroke={darkMode ? 'rgba(252,211,77,0.42)' : 'rgba(180,83,9,0.22)'} />
              <circle cx="172" cy="290" r="48" fill={darkMode ? 'rgba(148,163,184,0.12)' : 'rgba(148,163,184,0.1)'} stroke={darkMode ? 'rgba(203,213,225,0.34)' : 'rgba(100,116,139,0.24)'} />
              <circle cx="246" cy="182" r="72" fill={darkMode ? 'rgba(15,23,42,0.72)' : 'rgba(255,252,244,0.92)'} stroke={darkMode ? 'rgba(226,232,240,0.18)' : 'rgba(15,23,42,0.12)'} />
              <circle cx="246" cy="182" r="44" fill={darkMode ? 'rgba(20,184,166,0.14)' : 'rgba(13,148,136,0.12)'} stroke={darkMode ? 'rgba(94,234,212,0.28)' : 'rgba(15,118,110,0.18)'} />

              <text x="79" y="109" fill={darkMode ? '#ccfbf1' : '#134e4a'} fontSize="13" fontWeight="600">
                Belief
              </text>
              <text x="352" y="109" fill={darkMode ? '#fde68a' : '#92400e'} fontSize="13" fontWeight="600">
                Signal
              </text>
              <text x="150" y="295" fill={darkMode ? '#e2e8f0' : '#475569'} fontSize="13" fontWeight="600">
                Expert
              </text>
              <text x="215" y="176" fill={darkMode ? '#f8fafc' : '#0f172a'} fontSize="15" fontWeight="700">
                PCR5 / DST
              </text>
              <text x="222" y="198" fill={darkMode ? '#94a3b8' : '#64748b'} fontSize="11.5" fontWeight="500">
                Fused result
              </text>
            </svg>

            <div className={`absolute left-3 top-16 rounded-2xl border px-4 py-3 text-sm shadow-sm ${
              darkMode ? 'border-teal-500/20 bg-slate-900/80 text-slate-200' : 'border-teal-900/10 bg-white/90 text-slate-700'
            }`}>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Source A</p>
              <p className="mt-1 font-medium">Belief masses</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Human input or model output</p>
            </div>

            <div className={`absolute right-2 top-20 rounded-2xl border px-4 py-3 text-sm shadow-sm ${
              darkMode ? 'border-amber-400/20 bg-slate-900/80 text-slate-200' : 'border-amber-900/10 bg-white/90 text-slate-700'
            }`}>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Method</p>
              <p className="mt-1 font-medium">PCR5 or Dempster</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Inspect conflict behavior</p>
            </div>

            <div className={`absolute bottom-4 left-10 max-w-[16rem] rounded-2xl border px-4 py-3 text-sm shadow-sm ${
              darkMode ? 'border-slate-700/80 bg-slate-900/86 text-slate-200' : 'border-slate-900/10 bg-white/92 text-slate-700'
            }`}>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Result</p>
              <p className="mt-1 font-medium">A single environment for evidence, conflict, and method comparison.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="platform-capabilities" className="editorial-section">
        <div className="max-w-2xl">
          <p className="editorial-kicker">Platform capabilities</p>
          <h2 className={`editorial-heading ${darkMode ? 'text-slate-50' : 'text-slate-900'}`}>
            What the app lets you do
          </h2>
          <p className={`editorial-copy mt-4 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            Move from explanation to execution without leaving the interface. Each path
            is designed to make the methods understandable, testable, and easy to present.
          </p>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <div className="grid gap-4">
            {capabilityPanels.slice(0, 2).map((panel) => (
              <article
                key={panel.title}
                className={[
                  'editorial-panel',
                  panel.accent === 'amber' ? 'editorial-panel-amber' : 'editorial-panel-teal',
                ].join(' ')}
              >
                <div>
                  <p className="editorial-kicker">{panel.eyebrow}</p>
                  <h3 className={`mt-3 text-2xl font-semibold tracking-tight ${darkMode ? 'text-slate-50' : 'text-slate-900'}`}>
                    {panel.title}
                  </h3>
                  <p className={`mt-3 max-w-xl text-sm leading-7 sm:text-[0.98rem] ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    {panel.description}
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-link mt-6 w-fit px-0 py-0"
                  onClick={() => handleTargetOpen(panel.target)}
                >
                  {panel.action}
                </button>
              </article>
            ))}
          </div>

          <article className="editorial-panel editorial-panel-slate justify-between">
            <div>
              <p className="editorial-kicker">{capabilityPanels[2].eyebrow}</p>
              <h3 className={`mt-3 text-2xl font-semibold tracking-tight ${darkMode ? 'text-slate-50' : 'text-slate-900'}`}>
                {capabilityPanels[2].title}
              </h3>
              <p className={`mt-3 text-sm leading-7 sm:text-[0.98rem] ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                {capabilityPanels[2].description}
              </p>

              <div className={`mt-8 rounded-2xl border px-4 py-4 ${
                darkMode ? 'border-slate-800 bg-slate-950/55 text-slate-300' : 'border-slate-200 bg-white/70 text-slate-700'
              }`}>
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Featured scenario</p>
                <p className="mt-2 text-base font-medium text-slate-900 dark:text-slate-100">
                  Avalanche hazard assessment
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  A guided entry point for explaining how multiple sources converge on a decision under uncertainty.
                </p>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-link mt-6 w-fit px-0 py-0"
              onClick={() => handleTargetOpen(capabilityPanels[2].target)}
            >
              {capabilityPanels[2].action}
            </button>
          </article>
        </div>
      </section>

      <section className="editorial-section grid gap-10 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] xl:items-start">
        <div className="max-w-xl">
          <p className="editorial-kicker">Why it matters</p>
          <h2 className={`editorial-heading ${darkMode ? 'text-slate-50' : 'text-slate-900'}`}>
            Why combine evidence instead of trusting a single source?
          </h2>
        </div>

        <div className="space-y-8">
          {whyFusionPoints.map((point) => (
            <div key={point.title} className="border-b border-slate-200/80 pb-7 last:border-b-0 dark:border-slate-800/90">
              <h3 className={`text-xl font-semibold tracking-tight ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                {point.title}
              </h3>
              <p className={`mt-3 max-w-2xl text-sm leading-7 sm:text-[0.98rem] ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                {point.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="editorial-section grid gap-5 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <div className="max-w-lg">
          <p className="editorial-kicker">Methods at a glance</p>
          <h2 className={`editorial-heading ${darkMode ? 'text-slate-50' : 'text-slate-900'}`}>
            Compare how the methods behave in the same workspace.
          </h2>
          <p className={`editorial-copy mt-4 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            Fusion Lab lets you compare these methods in the same environment, using either
            manually entered belief masses or ML-based inputs.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <article className="editorial-panel editorial-panel-teal">
            <p className="editorial-kicker">Dempster-Shafer</p>
            <ul className={`mt-5 space-y-3 text-sm leading-7 sm:text-[0.98rem] ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              <li>Good for combining compatible evidence.</li>
              <li>Highlights combined belief under moderate conflict.</li>
            </ul>
          </article>

          <article className="editorial-panel editorial-panel-amber">
            <p className="editorial-kicker">PCR5</p>
            <ul className={`mt-5 space-y-3 text-sm leading-7 sm:text-[0.98rem] ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              <li>Useful when sources strongly disagree.</li>
              <li>Redistributes conflict more cautiously.</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="editorial-section">
        <div className="max-w-2xl">
          <p className="editorial-kicker">Example-driven use cases</p>
          <h2 className={`editorial-heading ${darkMode ? 'text-slate-50' : 'text-slate-900'}`}>
            Designed for practical explanation as much as calculation.
          </h2>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {useCases.map((useCase) => (
            <article key={useCase.title} className="editorial-panel editorial-panel-slate min-h-[220px]">
              <p className="editorial-kicker">{useCase.title}</p>
              <p className={`mt-4 text-sm leading-7 sm:text-[0.98rem] ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                {useCase.text}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className={`editorial-section rounded-[2rem] border px-6 py-8 sm:px-8 sm:py-10 ${
        darkMode
          ? 'border-slate-800 bg-[linear-gradient(180deg,rgba(15,23,42,0.84),rgba(15,23,42,0.94))]'
          : 'border-slate-200 bg-[linear-gradient(180deg,rgba(252,250,247,0.98),rgba(244,247,246,0.98))]'
      }`}>
        <div className="max-w-2xl">
          <p className="editorial-kicker">Overview hub</p>
          <h2 className={`editorial-heading ${darkMode ? 'text-slate-50' : 'text-slate-900'}`}>
            Choose the best entry point for your presentation.
          </h2>
          <p className={`editorial-copy mt-4 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            Start with the module that best fits your audience, then move deeper into the
            workflow once the context is clear.
          </p>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          <button type="button" className="hub-choice" onClick={onOpenCalculator}>
            <span className="hub-choice-label">Start with the calculator</span>
            <span className="hub-choice-copy">Best for showing manual evidence entry, fusion methods, and conflict output.</span>
          </button>
          <button type="button" className="hub-choice" onClick={onOpenMLPipeline}>
            <span className="hub-choice-label">Try the ML pipeline</span>
            <span className="hub-choice-copy">Best for demonstrating model-based inputs and a richer end-to-end workflow.</span>
          </button>
          <button type="button" className="hub-choice" onClick={onOpenExamples}>
            <span className="hub-choice-label">Learn from examples</span>
            <span className="hub-choice-copy">Best for walking someone through a ready-made scenario without setup overhead.</span>
          </button>
        </div>
      </section>
    </div>
  )
}

export default Landing
