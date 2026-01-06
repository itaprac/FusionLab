import { useState, useEffect } from 'react'
import Header from './components/Header'
import TabNavigation from './components/TabNavigation'
import MLPipeline from './components/MLPipeline'
import Calculator from './components/Calculator'
import Docs from './components/Docs'

const TABS = [
  { id: 'ml-pipeline', label: 'ML Fusion' },
  { id: 'calculator', label: 'Calculator' }
]

function App() {
  const [activeTab, setActiveTab] = useState('calculator')
  const [currentPage, setCurrentPage] = useState('main') // 'main' or 'docs'
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true'
    }
    return false
  })

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('darkMode', darkMode)
  }, [darkMode])

  const toggleDarkMode = () => setDarkMode(!darkMode)

  // Docs page
  if (currentPage === 'docs') {
    return (
      <div className={`min-h-screen transition-colors ${
        darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 to-gray-100'
      }`}>
        <header className={`shadow-sm mb-8 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentPage('main')}
                  className={`p-2 rounded-lg transition-colors ${
                    darkMode
                      ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  title="Back to app"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </button>
                <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Docs
                </h1>
              </div>
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
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
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 pb-12">
          <div className={`rounded-xl shadow-sm p-6 transition-colors ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <Docs darkMode={darkMode} />
          </div>
        </main>
      </div>
    )
  }

  // Main app
  return (
    <div className={`min-h-screen transition-colors ${
      darkMode
        ? 'bg-gray-900'
        : 'bg-gradient-to-br from-gray-50 to-gray-100'
    }`}>
      <Header
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        onDocsClick={() => setCurrentPage('docs')}
      />

      <main className="max-w-6xl mx-auto px-4 pb-12">
        <div className={`rounded-xl shadow-sm p-6 transition-colors ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <TabNavigation
            tabs={TABS}
            activeTab={activeTab}
            onChange={setActiveTab}
            darkMode={darkMode}
          />

          {activeTab === 'ml-pipeline' && <MLPipeline darkMode={darkMode} />}
          {activeTab === 'calculator' && <Calculator darkMode={darkMode} />}
        </div>
      </main>
    </div>
  )
}

export default App
