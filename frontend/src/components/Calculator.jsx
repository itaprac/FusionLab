import { useState, useEffect } from 'react'
import { useOutletContext, useSearchParams } from 'react-router-dom'
import MethodSelector from './MethodSelector'
import SourceCard from './SourceCard'
import ResultCard from './ResultCard'
import { useLanguage } from '../contexts/LanguageContext'

function Calculator() {
  const { darkMode } = useOutletContext()
  const { t } = useLanguage()
  const [searchParams, setSearchParams] = useSearchParams()

  const [methods, setMethods] = useState([])
  const [selectedMethod, setSelectedMethod] = useState('')
  const [sources, setSources] = useState([
    { id: 1, name: 'Source 1', hypotheses: [{ name: '', mass: '' }] },
    { id: 2, name: 'Source 2', hypotheses: [{ name: '', mass: '' }] },
  ])
  const [result, setResult] = useState(null)
  const [resultMeta, setResultMeta] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [examples, setExamples] = useState([])
  const [selectedExample, setSelectedExample] = useState('')
  const [exampleSelectionMode, setExampleSelectionMode] = useState('manual')

  const getDefaultExampleId = (methodId) => {
    if (methodId === 'dempster') return 'dst_low_conflict'
    if (methodId === 'pcr5') return 'pcr5_high_conflict'
    return ''
  }

  const getMethodForExampleId = (exampleId) => {
    if (!exampleId) return ''
    if (exampleId.startsWith('dst_')) return 'dempster'
    if (exampleId.startsWith('pcr5_')) return 'pcr5'
    return ''
  }

  useEffect(() => {
    fetch('/api/methods')
      .then(res => res.json())
      .then(data => {
        setMethods(data.methods)
        if (data.methods.length > 0) setSelectedMethod(data.methods[0].id)
      })
      .catch(() => setError(t('calc.error.methods')))

    fetch('/api/examples')
      .then(res => res.json())
      .then(data => setExamples(data.examples))
      .catch(() => console.error('examples load failed'))
  }, [t])

  useEffect(() => {
    const ex = searchParams.get('example')
    const meth = searchParams.get('method')
    if (!ex && !meth) return
    if (!examples.length || !methods.length) return

    if (meth && methods.some(m => m.id === meth)) setSelectedMethod(meth)
    if (ex && examples.some(e => e.id === ex)) {
      setExampleSelectionMode('manual')
      const example = examples.find(e => e.id === ex)
      if (example) {
        const inferredMethod = getMethodForExampleId(ex)
        if (inferredMethod && methods.some(m => m.id === inferredMethod)) setSelectedMethod(inferredMethod)
        setSelectedExample(ex)
        setResult(null)
        setResultMeta(null)
        setError(null)
        setSources(example.sources.map((src, idx) => ({
          id: idx + 1,
          name: src.name,
          hypotheses: Object.entries(src.masses).map(([name, mass]) => ({ name, mass: mass.toString() })),
        })))
      }
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, examples, methods, setSearchParams])

  useEffect(() => {
    if (exampleSelectionMode !== 'auto' || !selectedMethod || !examples?.length) return
    const defaultExampleId = getDefaultExampleId(selectedMethod)
    if (!defaultExampleId || !examples.some(e => e.id === defaultExampleId)) return
    if (selectedExample === defaultExampleId) return
    loadExample(defaultExampleId)
  }, [exampleSelectionMode, selectedMethod, examples])

  const loadExample = (exampleId) => {
    if (!exampleId) { setSelectedExample(''); return }
    const example = examples.find(e => e.id === exampleId)
    if (!example) return
    const inferredMethod = getMethodForExampleId(exampleId)
    if (inferredMethod && methods.some(m => m.id === inferredMethod)) setSelectedMethod(inferredMethod)
    setSelectedExample(exampleId)
    setResult(null)
    setResultMeta(null)
    setError(null)
    setSources(example.sources.map((src, idx) => ({
      id: idx + 1,
      name: src.name,
      hypotheses: Object.entries(src.masses).map(([name, mass]) => ({ name, mass: mass.toString() })),
    })))
  }

  const addSource = () => {
    const newId = Math.max(...sources.map(s => s.id)) + 1
    setSources([...sources, { id: newId, name: `Source ${newId}`, hypotheses: [{ name: '', mass: '' }] }])
  }

  const removeSource = (id) => {
    if (sources.length <= 2) return
    setSources(sources.filter(s => s.id !== id))
  }

  const updateSource = (id, updates) => {
    setSources(sources.map(s => s.id === id ? { ...s, ...updates } : s))
  }

  const addHypothesis = (sourceId) => {
    setSources(sources.map(s => s.id === sourceId ? { ...s, hypotheses: [...s.hypotheses, { name: '', mass: '' }] } : s))
  }

  const removeHypothesis = (sourceId, index) => {
    setSources(sources.map(s => {
      if (s.id === sourceId && s.hypotheses.length > 1) return { ...s, hypotheses: s.hypotheses.filter((_, i) => i !== index) }
      return s
    }))
  }

  const updateHypothesis = (sourceId, index, updates) => {
    setSources(sources.map(s => {
      if (s.id === sourceId) {
        const h = [...s.hypotheses]
        h[index] = { ...h[index], ...updates }
        return { ...s, hypotheses: h }
      }
      return s
    }))
  }

  const calculate = async () => {
    setError(null)
    setResult(null)
    setResultMeta(null)
    setLoading(true)
    const meta = methods.find(m => m.id === selectedMethod)
    const reqSources = sources.map(s => ({
      name: s.name,
      masses: Object.fromEntries(s.hypotheses.filter(h => h.name && h.mass).map(h => [h.name, parseFloat(h.mass)])),
    }))
    try {
      const res = await fetch('/api/fusion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fusion_method: selectedMethod, sources: reqSources }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Fusion failed')
      setResult(data.result)
      setResultMeta({ id: selectedMethod, name: meta?.name })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="label" style={{ color: 'var(--accent)' }}>{t('calc.badge')}</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em]" style={{ color: 'var(--text-strong)' }}>
          {t('calc.title')}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-7" style={{ color: 'var(--text)' }}>{t('calc.intro')}</p>
      </div>

      {examples.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-strong)' }}>{t('calc.examples')}</h2>
          <select
            value={selectedExample}
            onChange={(e) => {
              const value = e.target.value
              if (!value) { setExampleSelectionMode('auto'); setSelectedExample(''); return }
              setExampleSelectionMode('manual')
              loadExample(value)
            }}
            className="input mt-2 w-full md:w-auto md:min-w-[20rem]"
          >
            <option value="">{t('calc.examples.placeholder')}</option>
            {examples.map(ex => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
          </select>
        </section>
      )}

      <section className="border-t pt-6" style={{ borderColor: 'var(--line)' }}>
        <div className="flex items-center gap-2 mb-1">
          <span className="mono flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold" style={{ background: 'var(--accent-soft)', color: 'var(--accent-strong)' }}>1</span>
          <p className="label" style={{ margin: 0 }}>{t('calc.step1')}</p>
        </div>
        <MethodSelector methods={methods} selected={selectedMethod} onChange={setSelectedMethod} />
      </section>

      <section className="border-t pt-6" style={{ borderColor: 'var(--line)' }}>
        <div className="flex items-center gap-2 mb-1">
          <span className="mono flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold" style={{ background: 'var(--accent-soft)', color: 'var(--accent-strong)' }}>2</span>
          <p className="label" style={{ margin: 0 }}>{t('calc.step2')}</p>
        </div>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>{t('calc.step2.hint')}</p>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sources.map((source, idx) => (
            <SourceCard
              key={source.id}
              source={source}
              index={idx + 1}
              canRemove={sources.length > 2}
              onRemove={() => removeSource(source.id)}
              onUpdateName={(name) => updateSource(source.id, { name })}
              onAddHypothesis={() => addHypothesis(source.id)}
              onRemoveHypothesis={(index) => removeHypothesis(source.id, index)}
              onUpdateHypothesis={(index, updates) => updateHypothesis(source.id, index, updates)}
              darkMode={darkMode}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={addSource}
          className="mt-3 flex items-center gap-1.5 text-sm font-semibold transition-colors"
          style={{ color: 'var(--accent-strong)' }}
        >
          {t('calc.addSource')}
        </button>
      </section>

      <section className="border-t pt-6" style={{ borderColor: 'var(--line)' }}>
        <div className="flex items-center gap-4">
          <button type="button" onClick={calculate} disabled={loading} className="btn btn-primary">
            {loading ? t('calc.calculating') : t('calc.calcBtn')}
          </button>
          {error && (
            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--danger)' }}>
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}
        </div>
      </section>

      {result && (
        <ResultCard result={result} methodId={resultMeta?.id} methodName={resultMeta?.name} darkMode={darkMode} />
      )}
    </div>
  )
}

export default Calculator
