import { useCallback, useEffect, useRef, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Home from './components/Home'
import MLPipeline from './components/MLPipeline'
import Calculator from './components/Calculator'
import Examples from './components/Examples'
import ExampleCalculator from './components/ExampleCalculator'
import ExampleMLFusion from './components/ExampleMLFusion'
import Poster1 from './components/posters/Poster1'
import Poster2 from './components/posters/Poster2'
import Poster3 from './components/posters/Poster3'
import Poster4 from './components/posters/Poster4'
import Poster5 from './components/posters/Poster5'
import Poster6 from './components/posters/Poster6'
import Poster7 from './components/posters/Poster7'
import Poster8 from './components/posters/Poster8'
import Poster9 from './components/posters/Poster9'
import Poster10 from './components/posters/Poster10'

function MainApp() {
  const [activeView, setActiveView] = useState('home')
  const [calculatorPreset, setCalculatorPreset] = useState(null)
  const mainRef = useRef(null)
  const navigating = useRef(false)
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
    const el = mainRef.current
    if (!el) return
    el.animate(
      [
        { opacity: 0, transform: 'translateY(24px)' },
        { opacity: 1, transform: 'translateY(0)' },
      ],
      { duration: 700, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'forwards' }
    )
  }, [])

  const navigate = useCallback((nextView) => {
    if (nextView === activeView || navigating.current) return
    navigating.current = true

    const el = mainRef.current
    if (!el) {
      setActiveView(nextView)
      navigating.current = false
      return
    }

    const fadeOut = el.animate(
      [
        { opacity: 1, transform: 'translateY(0)' },
        { opacity: 0, transform: 'translateY(-12px)' },
      ],
      { duration: 250, easing: 'ease-in', fill: 'forwards' }
    )

    fadeOut.onfinish = () => {
      setActiveView(nextView)
      window.scrollTo({ top: 0, behavior: 'instant' })

      requestAnimationFrame(() => {
        el.animate(
          [
            { opacity: 0, transform: 'translateY(24px)' },
            { opacity: 1, transform: 'translateY(0)' },
          ],
          { duration: 600, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'forwards' }
        )
        navigating.current = false
      })
    }
  }, [activeView])

  const testAvalancheExample = () => {
    setCalculatorPreset({ exampleId: 'avalanche_hazard', methodId: 'dempster' })
    navigate('calculator')
  }

  const isHome = activeView === 'home'

  return (
    <div className="min-h-screen">
      <Header
        activeView={activeView}
        onNavigate={navigate}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(v => !v)}
      />

      <main ref={mainRef} className={isHome ? '' : 'content-shell'}>
        {isHome && (
          <Home
            onOpenCalculator={() => navigate('calculator')}
            onOpenMLPipeline={() => navigate('mlfusion')}
            onOpenExamples={() => navigate('examples')}
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
            onOpenCalculator={() => navigate('examples_calculator')}
            onOpenMLFusion={() => navigate('examples_mlfusion')}
          />
        )}
        {activeView === 'examples_calculator' && (
          <ExampleCalculator darkMode={darkMode} onTryIt={testAvalancheExample} />
        )}
        {activeView === 'examples_mlfusion' && (
          <ExampleMLFusion darkMode={darkMode} onTryIt={() => navigate('mlfusion')} />
        )}
      </main>
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainApp />} />
      <Route path="/1" element={<Poster1 />} />
      <Route path="/2" element={<Poster2 />} />
      <Route path="/3" element={<Poster3 />} />
      <Route path="/4" element={<Poster4 />} />
      <Route path="/5" element={<Poster5 />} />
      <Route path="/6" element={<Poster6 />} />
      <Route path="/7" element={<Poster7 />} />
      <Route path="/8" element={<Poster8 />} />
      <Route path="/9" element={<Poster9 />} />
      <Route path="/10" element={<Poster10 />} />
    </Routes>
  )
}

export default App
