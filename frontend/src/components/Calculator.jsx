import { useState, useEffect } from 'react'
import MethodSelector from './MethodSelector'
import SourceCard from './SourceCard'
import ResultCard from './ResultCard'

function Calculator({ darkMode }) {
  const [methods, setMethods] = useState([])
  const [selectedMethod, setSelectedMethod] = useState('')
  const [sources, setSources] = useState([
    { id: 1, name: 'Source 1', hypotheses: [{ name: '', mass: '' }] },
    { id: 2, name: 'Source 2', hypotheses: [{ name: '', mass: '' }] }
  ])
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/methods')
      .then(res => res.json())
      .then(data => {
        setMethods(data.methods)
        if (data.methods.length > 0) {
          setSelectedMethod(data.methods[0].id)
        }
      })
      .catch(() => setError('Failed to load methods'))
  }, [])

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
    setLoading(true)

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
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Method Selection */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold">1</div>
          <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Select Fusion Method</h3>
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
          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold">2</div>
          <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Define Sources & Belief Masses</h3>
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
          className={`w-full border-2 border-dashed font-medium py-3 px-4 rounded-lg transition-colors ${
            darkMode
              ? 'border-gray-600 hover:border-blue-500 hover:bg-blue-900/20 text-gray-400 hover:text-blue-400'
              : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50 text-gray-500 hover:text-blue-600'
          }`}
        >
          + Add Another Source
        </button>
      </div>

      {/* Calculate */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold">3</div>
          <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Calculate Fusion</h3>
        </div>
        <button
          onClick={calculate}
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-blue-400 disabled:to-indigo-400 text-white font-medium py-4 px-4 rounded-lg transition-all shadow-md hover:shadow-lg"
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

      {result && <ResultCard result={result} method={selectedMethod} darkMode={darkMode} />}
    </div>
  )
}

export default Calculator
