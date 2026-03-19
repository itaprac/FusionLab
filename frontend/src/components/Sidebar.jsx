import { useEffect, useState } from 'react'

function Sidebar({
  darkMode,
  activeView,
  onNavigate,
  isOpen,
  onToggleDarkMode,
}) {
  const isExamplesView = String(activeView || '').startsWith('examples')
  const [examplesExpanded, setExamplesExpanded] = useState(isExamplesView)

  useEffect(() => {
    if (isExamplesView) setExamplesExpanded(true)
  }, [isExamplesView])

  const buttonBase = (isActive) => [
    'w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
    isActive
      ? (darkMode ? 'bg-teal-500/10 text-teal-200 border border-teal-500/30' : 'bg-teal-50 text-teal-800 border border-teal-200')
      : (darkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-50'),
  ].join(' ')

  const expanderBase = (isActive) => [
    'w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
    isActive
      ? (darkMode ? 'bg-teal-500/10 text-teal-200 border border-teal-500/30' : 'bg-teal-50 text-teal-800 border border-teal-200')
      : (darkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-50'),
  ].join(' ')

  return (
    <aside
      className={[
        'h-screen sticky top-0 transition-all duration-200',
        isOpen ? 'w-64' : 'w-0',
        isOpen ? '' : 'overflow-hidden pointer-events-none',
        isOpen ? 'border-r' : 'border-r-0',
        darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200',
      ].join(' ')}
      aria-hidden={!isOpen}
    >
      <div className="h-full flex flex-col">
        <div className={`px-4 py-4 border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              darkMode ? 'bg-gray-800 text-teal-300' : 'bg-gray-100 text-teal-600'
            }`}>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <circle cx="9" cy="12" r="5" />
                <circle cx="15" cy="12" r="5" />
              </svg>
            </div>
            <div>
              <div className={`text-sm font-semibold truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Fusion Lab
              </div>
              <div className={`text-xs truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Navigation
              </div>
            </div>
          </div>
        </div>

        <nav className="p-2">
          <button
            onClick={() => onNavigate('home')}
            className={buttonBase(activeView === 'home')}
          >
            Home
          </button>

          <button
            onClick={() => onNavigate('mlfusion')}
            className={buttonBase(activeView === 'mlfusion')}
          >
            ML Fusion
          </button>

          <button
            onClick={() => onNavigate('calculator')}
            className={buttonBase(activeView === 'calculator')}
          >
            Fusion Calculator
          </button>

          <button
            onClick={() => {
              onNavigate('examples')
              setExamplesExpanded(v => (isExamplesView ? !v : true))
            }}
            className={expanderBase(isExamplesView)}
          >
            <span className="flex items-center justify-between gap-3">
              <span>Examples</span>
              <svg
                className={[
                  'w-4 h-4 transition-transform',
                  examplesExpanded ? 'rotate-180' : 'rotate-0',
                ].join(' ')}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </button>

          {examplesExpanded && (
            <div className="mt-1 pl-3 space-y-1">
              <button
                onClick={() => onNavigate('examples_calculator')}
                className={buttonBase(activeView === 'examples_calculator')}
              >
                Fusion Calculator
              </button>
              <button
                onClick={() => onNavigate('examples_mlfusion')}
                className={buttonBase(activeView === 'examples_mlfusion')}
              >
                ML Fusion
              </button>
            </div>
          )}
        </nav>

        <div className={`mt-auto p-4 border-t ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
          <button
            onClick={onToggleDarkMode}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              darkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-50'
            }`}
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
            <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
