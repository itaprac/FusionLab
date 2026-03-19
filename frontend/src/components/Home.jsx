const MODULES = [
  {
    title: 'ML Fusion',
    description: 'Train or pick classifiers on built-in datasets, then fuse their outputs.',
    hint: 'Best when you want to show fusion on real model scores.',
    onOpen: 'ml',
    icon: 'ml',
  },
  {
    title: 'Fusion Calculator',
    description: 'Enter BBA masses yourself, switch methods, and inspect conflict and results.',
    hint: 'Best for precise demos and teaching the mechanics.',
    onOpen: 'calculator',
    icon: 'calc',
  },
  {
    title: 'Examples',
    description: 'Step through ready-made calculator and ML scenarios.',
    hint: 'Fastest path if you are new to the workspace.',
    onOpen: 'examples',
    icon: 'examples',
  },
]

const FLOW_STEPS = [
  { n: 1, title: 'Sources', caption: 'Evidence or classifier scores' },
  { n: 2, title: 'Method', caption: 'DST, PCR5, or PCR6' },
  { n: 3, title: 'Fuse', caption: 'Run combination rule' },
  { n: 4, title: 'Read', caption: 'Beliefs & conflict' },
]

const METHOD_BLURBS = [
  {
    abbr: 'DST',
    name: 'Dempster–Shafer',
    text: 'Normalises conflict into the fused masses. Strong when sources mostly agree.',
  },
  {
    abbr: 'DSmT',
    name: 'PCR5 / PCR6',
    text: 'Sends conflict back across focal elements. Useful under strong disagreement.',
  },
]

function ModuleIcon({ name, darkMode }) {
  const stroke = darkMode ? 'currentColor' : 'currentColor'
  const cls = `w-9 h-9 shrink-0 ${darkMode ? 'text-teal-400' : 'text-teal-600'}`

  if (name === 'ml') {
    return (
      <svg className={cls} fill="none" stroke={stroke} viewBox="0 0 24 24" aria-hidden>
        <path strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18M7 16l4-4 4 4 6-7" />
      </svg>
    )
  }
  if (name === 'calc') {
    return (
      <svg className={cls} fill="none" stroke={stroke} viewBox="0 0 24 24" aria-hidden>
        <path strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" d="M9 7h6M9 11h6M9 15h4M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" />
      </svg>
    )
  }
  return (
    <svg className={cls} fill="none" stroke={stroke} viewBox="0 0 24 24" aria-hidden>
      <path strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  )
}

function Home({ darkMode, onOpenCalculator, onOpenMLPipeline, onOpenExamples }) {
  const openers = {
    calculator: onOpenCalculator,
    ml: onOpenMLPipeline,
    examples: onOpenExamples,
  }

  return (
    <div>
      <div className="mb-8 max-w-2xl">
        <h2 className={`text-xl font-semibold tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Home
        </h2>
        <p className={`text-base mt-2 leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Combine uncertain sources with <span className={darkMode ? 'text-gray-300' : 'text-gray-800'}>DST</span> or{' '}
          <span className={darkMode ? 'text-gray-300' : 'text-gray-800'}>DSmT</span> (PCR5/PCR6). Conflict is normalised in DST;
          in DSmT it is redistributed — try both and compare.
        </p>
        <p className={`text-sm mt-2 leading-relaxed ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
          Open a module below or from the sidebar — same destinations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
        <div className="lg:col-span-7 space-y-4">
          <h3 className={`text-base font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            Modules
          </h3>
          <div className="flex flex-col gap-4">
            {MODULES.map((mod) => (
              <button
                key={mod.title}
                type="button"
                onClick={openers[mod.onOpen]}
                className={`text-left w-full rounded-2xl border p-5 sm:p-6 transition-colors group ${
                  darkMode
                    ? 'border-gray-700 hover:border-teal-500/45 bg-gray-900 hover:bg-gray-900'
                    : 'border-gray-200 hover:border-teal-400 bg-white hover:bg-white'
                }`}
              >
                <div className="flex gap-5">
                  <div
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${
                      darkMode ? 'bg-gray-800/90' : 'bg-teal-50'
                    }`}
                  >
                    <ModuleIcon name={mod.icon} darkMode={darkMode} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className={`text-base font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                        {mod.title}
                      </span>
                      <span
                        className={`text-base font-medium whitespace-nowrap ${
                          darkMode ? 'text-teal-400 group-hover:text-teal-300' : 'text-teal-700 group-hover:text-teal-800'
                        }`}
                      >
                        Open →
                      </span>
                    </div>
                    <p className={`text-base mt-2 leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {mod.description}
                    </p>
                    <p className={`text-sm mt-2.5 leading-snug ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      <span className="font-medium text-teal-600 dark:text-teal-400">Tip:</span> {mod.hint}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 space-y-8">
          <div>
            <h3 className={`text-base font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
              Typical fusion pipeline
            </h3>
            <p className={`text-sm mt-1.5 leading-relaxed ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              Same mental model in calculator and ML fusion — only the source of masses changes.
            </p>
            <div
              className={`mt-5 rounded-2xl border p-5 sm:p-6 ${
                darkMode ? 'border-gray-700 bg-gray-900/60' : 'border-gray-200 bg-gray-50/90'
              }`}
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 sm:gap-6">
                {FLOW_STEPS.map((step) => (
                  <div key={step.n} className="flex flex-col items-center text-center">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full text-base font-bold ${
                        darkMode ? 'bg-teal-500/20 text-teal-300' : 'bg-teal-100 text-teal-800'
                      }`}
                    >
                      {step.n}
                    </div>
                    <div className={`mt-2.5 text-sm font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                      {step.title}
                    </div>
                    <div className={`mt-1 text-xs sm:text-sm leading-snug max-w-[10rem] ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      {step.caption}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h3 className={`text-base font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
              Methods at a glance
            </h3>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {METHOD_BLURBS.map((row) => (
                <div
                  key={row.abbr}
                  className={`rounded-2xl border p-5 ${
                    darkMode ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="chip">{row.abbr}</span>
                    <span className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {row.name}
                    </span>
                  </div>
                  <p className={`text-base mt-3 leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {row.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div
            className={`rounded-2xl border p-5 sm:p-6 ${
              darkMode ? 'border-teal-900/50 bg-teal-950/25' : 'border-teal-200 bg-teal-50/80'
            }`}
          >
            <div className={`text-base font-semibold ${darkMode ? 'text-teal-200' : 'text-teal-900'}`}>
              Not sure where to start?
            </div>
            <p className={`text-sm mt-2 leading-relaxed ${darkMode ? 'text-teal-100/85' : 'text-teal-950/85'}`}>
              Start with Examples, then use the calculator or ML Fusion with your own inputs.
            </p>
            <button
              type="button"
              onClick={onOpenExamples}
              className="mt-4 text-base font-medium text-teal-600 hover:text-teal-500 dark:text-teal-400 dark:hover:text-teal-300"
            >
              Go to Examples →
            </button>
          </div>
        </div>
      </div>

      <div className={`mt-12 pt-7 border-t flex flex-wrap items-center gap-3 ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
        <span className="chip">DST</span>
        <span className="chip">DSmT</span>
        <span className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
          Available wherever you pick a fusion method (calculator &amp; ML pipeline).
        </span>
      </div>
    </div>
  )
}

export default Home
