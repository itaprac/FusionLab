import { useState, useEffect } from 'react'
import MethodSelector from './MethodSelector'
import SourceCard from './SourceCard'
import ResultCard from './ResultCard'

function Calculator({ darkMode, preset, onPresetApplied }) {
  const [methods, setMethods] = useState([])
  const [selectedMethod, setSelectedMethod] = useState('')
  const [sources, setSources] = useState([
    { id: 1, name: 'Source 1', hypotheses: [{ name: '', mass: '' }] },
    { id: 2, name: 'Source 2', hypotheses: [{ name: '', mass: '' }] }
  ])
  const [result, setResult] = useState(null)
  const [resultMeta, setResultMeta] = useState(null) // { id, name } captured at fusion time
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [examples, setExamples] = useState([])
  const [selectedExample, setSelectedExample] = useState('')
  const [exampleSelectionMode, setExampleSelectionMode] = useState('manual') // 'auto' | 'manual'

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
    // Fetch methods
    fetch('/api/methods')
      .then(res => res.json())
      .then(data => {
        setMethods(data.methods)
        if (data.methods.length > 0) {
          setSelectedMethod(data.methods[0].id)
        }
      })
      .catch(() => setError('Failed to load methods'))

    // Fetch examples
    fetch('/api/examples')
      .then(res => res.json())
      .then(data => {
        setExamples(data.examples)
      })
      .catch(() => console.error('Failed to load examples'))
  }, [])

  useEffect(() => {
    if (!preset) return

    const { exampleId, methodId } = preset

    if (methodId && methods.some(m => m.id === methodId)) {
      setSelectedMethod(methodId)
    }

    if (exampleId && examples.some(e => e.id === exampleId)) {
      setExampleSelectionMode('manual')
      loadExample(exampleId)
      if (typeof onPresetApplied === 'function') onPresetApplied()
    }
  }, [preset, examples, methods])

  useEffect(() => {
    if (exampleSelectionMode !== 'auto') return
    if (!selectedMethod) return
    if (!examples || examples.length === 0) return

    const defaultExampleId = getDefaultExampleId(selectedMethod)
    if (!defaultExampleId) return
    if (!examples.some(e => e.id === defaultExampleId)) return
    if (selectedExample === defaultExampleId) return

    loadExample(defaultExampleId)
  }, [exampleSelectionMode, selectedMethod, examples])

  const loadExample = (exampleId) => {
    if (!exampleId) {
      setSelectedExample('')
      return
    }

    const example = examples.find(e => e.id === exampleId)
    if (!example) return

    const inferredMethod = getMethodForExampleId(exampleId)
    if (inferredMethod && methods.some(m => m.id === inferredMethod)) {
      setSelectedMethod(inferredMethod)
    }

    setSelectedExample(exampleId)
    setResult(null)
    setResultMeta(null)
    setError(null)

    // Convert example sources to calculator format
    const newSources = example.sources.map((src, idx) => ({
      id: idx + 1,
      name: src.name,
      hypotheses: Object.entries(src.masses).map(([name, mass]) => ({
        name,
        mass: mass.toString()
      }))
    }))

    setSources(newSources)
  }

  const addSource = () => {
    const newId = Math.max(...sources.map(s => s.id)) + 1
    setSources([...sources, {
      id: newId,
      name: `Source ${newId}`,
      hypotheses: [{ name: '', mass: '' }]
    }])
  }

  const removeSource = (id) => {
    if (sources.length <= 2) return
    setSources(sources.filter(s => s.id !== id))
  }

  const updateSource = (id, updates) => {
    setSources(sources.map(s => s.id === id ? { ...s, ...updates } : s))
  }

  const addHypothesis = (sourceId) => {
    setSources(sources.map(s => {
      if (s.id === sourceId) {
        return { ...s, hypotheses: [...s.hypotheses, { name: '', mass: '' }] }
      }
      return s
    }))
  }

  const removeHypothesis = (sourceId, index) => {
    setSources(sources.map(s => {
      if (s.id === sourceId && s.hypotheses.length > 1) {
        return { ...s, hypotheses: s.hypotheses.filter((_, i) => i !== index) }
      }
      return s
    }))
  }

  const updateHypothesis = (sourceId, index, updates) => {
    setSources(sources.map(s => {
      if (s.id === sourceId) {
        const newHypotheses = [...s.hypotheses]
        newHypotheses[index] = { ...newHypotheses[index], ...updates }
        return { ...s, hypotheses: newHypotheses }
      }
      return s
    }))
  }

  const calculate = async () => {
    setError(null)
    setResult(null)
    setResultMeta(null)
    setLoading(true)

    const selectedMethodMeta = methods.find(m => m.id === selectedMethod)
    const selectedMethodName = selectedMethodMeta?.name

    const requestSources = sources.map(s => ({
      name: s.name,
      masses: Object.fromEntries(
        s.hypotheses
          .filter(h => h.name && h.mass)
          .map(h => [h.name, parseFloat(h.mass)])
      )
    }))

    try {
      const response = await fetch('/api/fusion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fusion_method: selectedMethod,
          sources: requestSources
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Fusion failed')
      }

      setResult(data.result)
      setResultMeta({ id: selectedMethod, name: selectedMethodName })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Load Example */}
      {examples.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
              darkMode ? 'bg-purple-900/40 text-purple-300' : 'bg-purple-100 text-purple-700'
            }`}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <h3 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Load Example (Optional)</h3>
          </div>
          <select
            value={selectedExample}
            onChange={(e) => {
              const value = e.target.value
              if (!value) {
                setExampleSelectionMode('auto')
                setSelectedExample('')
                return
              }
              setExampleSelectionMode('manual')
              loadExample(value)
            }}
            className={`w-full md:w-auto min-w-[300px] px-4 py-2.5 rounded-xl border text-sm transition-colors ${
              darkMode
                ? 'bg-gray-900 border-gray-700 text-gray-100 focus:border-purple-500'
                : 'bg-white border-gray-200 text-gray-800 focus:border-purple-500'
            } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
          >
            <option value="">-- Select an example to load --</option>
            {examples.map(example => (
              <option key={example.id} value={example.id}>
                {example.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Method Selection */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
            darkMode ? 'bg-teal-900/40 text-teal-300' : 'bg-teal-100 text-teal-700'
          }`}>1</div>
          <h3 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Select Fusion Method</h3>
        </div>
        <MethodSelector
          methods={methods}
          selected={selectedMethod}
          onChange={setSelectedMethod}
          darkMode={darkMode}
        />
      </div>

      {/* Sources */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
            darkMode ? 'bg-teal-900/40 text-teal-300' : 'bg-teal-100 text-teal-700'
          }`}>2</div>
          <h3 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Define Sources & Belief Masses</h3>
        </div>
        <p className={`text-sm mb-4 ml-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Add hypotheses (e.g., A, B, C) and assign mass values (0-1) for each source.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
          onClick={addSource}
          className={`w-full rounded-xl border border-dashed px-4 py-3 text-sm font-medium transition-colors ${
            darkMode
              ? 'border-gray-700 hover:border-teal-700/70 hover:bg-teal-900/10 text-gray-300'
              : 'border-gray-300 hover:border-teal-400 hover:bg-teal-50 text-gray-700'
          }`}
        >
          + Add Another Source
        </button>
      </div>

      {/* Calculate */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
            darkMode ? 'bg-teal-900/40 text-teal-300' : 'bg-teal-100 text-teal-700'
          }`}>3</div>
          <h3 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Calculate Fusion</h3>
        </div>
        <button
          onClick={calculate}
          disabled={loading}
          className="btn btn-primary w-full py-3.5 text-base shadow-sm hover:shadow"
        >
          {loading ? 'Calculating...' : 'Calculate Fusion'}
        </button>
      </div>

      {error && (
        <div className={`px-4 py-3 rounded-lg mb-6 ${
          darkMode
            ? 'bg-red-900/30 border border-red-800 text-red-400'
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        </div>
      )}

      {result && (
        <ResultCard
          result={result}
          methodId={resultMeta?.id}
          methodName={resultMeta?.name}
          darkMode={darkMode}
        />
      )}
    </div>
  )
}

export default Calculator
