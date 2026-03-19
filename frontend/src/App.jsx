import { useEffect, useState } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Home from './components/Home'
import MLPipeline from './components/MLPipeline'
import Calculator from './components/Calculator'
import Examples from './components/Examples'
import ExampleCalculator from './components/ExampleCalculator'
import ExampleMLFusion from './components/ExampleMLFusion'

function App() {
  const [activeView, setActiveView] = useState('home')
  const [calculatorPreset, setCalculatorPreset] = useState(null) // { exampleId, methodId }
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const v = localStorage.getItem('sidebarOpen')
      if (v === 'true') return true
      if (v === 'false') return false
    }
    return true
  })
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

  useEffect(() => {
    localStorage.setItem('sidebarOpen', sidebarOpen)
  }, [sidebarOpen])

  const toggleDarkMode = () => setDarkMode(!darkMode)
  const toggleSidebar = () => setSidebarOpen(v => !v)

  const testAvalancheExample = () => {
    setCalculatorPreset({ exampleId: 'avalanche_hazard', methodId: 'dempster' })
    setActiveView('calculator')
  }

  return (
    <div className="min-h-screen transition-colors flex">
      <Sidebar
        darkMode={darkMode}
        activeView={activeView}
        onNavigate={setActiveView}
        isOpen={sidebarOpen}
        onToggleDarkMode={toggleDarkMode}
      />

      <div className="flex-1 min-w-0">
        <Header
          darkMode={darkMode}
          onToggleSidebar={toggleSidebar}
          sidebarOpen={sidebarOpen}
          onHome={() => setActiveView('home')}
        />

        <main className="pb-12">
          <div className="app-container">
            <div className="app-surface p-6">
              {activeView === 'home' && (
                <Home
                  darkMode={darkMode}
                  onOpenCalculator={() => setActiveView('calculator')}
                  onOpenMLPipeline={() => setActiveView('mlfusion')}
                  onOpenExamples={() => setActiveView('examples')}
                />
              )}
              {activeView === 'calculator' && (
                <Calculator
                  darkMode={darkMode}
                  preset={calculatorPreset}
                  onPresetApplied={() => setCalculatorPreset(null)}
                />
              )}
              {activeView === 'mlfusion' && <MLPipeline darkMode={darkMode} />}

              {activeView === 'examples' && (
                <Examples
                  darkMode={darkMode}
                  onOpenCalculator={() => setActiveView('examples_calculator')}
                  onOpenMLFusion={() => setActiveView('examples_mlfusion')}
                />
              )}
              {activeView === 'examples_calculator' && (
                <ExampleCalculator darkMode={darkMode} onTryIt={testAvalancheExample} />
              )}
              {activeView === 'examples_mlfusion' && (
                <ExampleMLFusion darkMode={darkMode} onTryIt={() => setActiveView('mlfusion')} />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default App
