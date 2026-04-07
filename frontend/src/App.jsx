import { useEffect, useRef, useState } from 'react'
import { Routes, Route, Outlet, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Home from './components/Home'
import MLPipeline from './components/MLPipeline'
import Calculator from './components/Calculator'
import Examples from './components/Examples'
import ExampleCalculator from './components/ExampleCalculator'
import ExampleMLFusion from './components/ExampleMLFusion'
import Docs from './components/Docs'

function AppLayout() {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('darkMode') === 'true'
    return false
  })
  const location = useLocation()
  const mainRef = useRef(null)
  const prevPath = useRef(location.pathname)

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
    localStorage.setItem('darkMode', darkMode)
  }, [darkMode])

  useEffect(() => {
    if (prevPath.current === location.pathname) return
    prevPath.current = location.pathname
    window.scrollTo({ top: 0, behavior: 'instant' })
    const el = mainRef.current
    if (!el) return
    el.animate(
      [
        { opacity: 0, transform: 'translateY(20px)' },
        { opacity: 1, transform: 'translateY(0)' },
      ],
      { duration: 500, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'forwards' }
    )
  }, [location.pathname])

  const isHome = location.pathname === '/'

  return (
    <div className="min-h-screen">
      <Header darkMode={darkMode} onToggleDarkMode={() => setDarkMode(v => !v)} />
      <main ref={mainRef} className={isHome ? '' : 'content-shell'}>
        <Outlet context={{ darkMode }} />
      </main>
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/calculator" element={<Calculator />} />
        <Route path="/ml" element={<MLPipeline />} />
        <Route path="/examples" element={<Examples />} />
        <Route path="/examples/calculator" element={<ExampleCalculator />} />
        <Route path="/examples/ml" element={<ExampleMLFusion />} />
        <Route path="/docs" element={<Docs />} />
      </Route>
    </Routes>
  )
}

export default App
