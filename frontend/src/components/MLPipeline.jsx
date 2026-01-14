import { useState, useEffect } from 'react'

function MLPipeline({ darkMode }) {
  const [datasets, setDatasets] = useState([])
  const [models, setModels] = useState([])
  const [methods, setMethods] = useState([])

  const [selectedDataset, setSelectedDataset] = useState('')
  const [selectedModels, setSelectedModels] = useState([])
  const [selectedMethod, setSelectedMethod] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [results, setResults] = useState(null)

  useEffect(() => {
    // Fetch datasets
    fetch('/api/ml/datasets')
      .then(res => res.json())
      .then(data => {
        setDatasets(data.datasets)
        if (data.datasets.length > 0) {
          setSelectedDataset(data.datasets[0].id)
        }
      })
      .catch(() => setError('Failed to load datasets'))

    // Fetch models
    fetch('/api/ml/models')
      .then(res => res.json())
      .then(data => {
        setModels(data.classifiers)
      })
      .catch(() => setError('Failed to load models'))

    // Fetch fusion methods
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

  const toggleModel = (modelId) => {
    setSelectedModels(prev =>
      prev.includes(modelId)
        ? prev.filter(id => id !== modelId)
        : [...prev, modelId]
    )
  }

  const runFusion = async () => {
    if (selectedModels.length < 2) {
      setError('Please select at least 2 models for fusion')
      return
    }

    setError(null)
    setResults(null)
    setLoading(true)

    try {
      const response = await fetch('/api/ml/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          datasetId: selectedDataset,
          models: selectedModels,
          fusionMethod: selectedMethod
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'ML Fusion failed')
      }

      setResults(data.results)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Dataset Selection */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
            darkMode ? 'bg-teal-900/40 text-teal-300' : 'bg-teal-100 text-teal-700'
          }`}>1</div>
          <h3 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Select Dataset</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {datasets.map(dataset => (
            <button
              key={dataset.id}
              onClick={() => setSelectedDataset(dataset.id)}
              className={`text-left p-4 rounded-xl border transition-colors ${
                selectedDataset === dataset.id
                  ? darkMode
                    ? 'border-teal-500/70 bg-teal-500/10'
                    : 'border-teal-500 bg-teal-50'
                  : darkMode
                    ? 'border-gray-700 hover:border-gray-600 bg-gray-900'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                  selectedDataset === dataset.id
                    ? 'border-teal-500'
                    : darkMode
                      ? 'border-gray-500'
                      : 'border-gray-300'
                }`}>
                  {selectedDataset === dataset.id && (
                    <div className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                  )}
                </div>
                <div className={`font-medium ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                  {dataset.name}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Models Selection */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
            darkMode ? 'bg-teal-900/40 text-teal-300' : 'bg-teal-100 text-teal-700'
          }`}>2</div>
          <h3 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Select ML Models (min. 2)</h3>
        </div>
        <p className={`text-sm mb-4 ml-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Select multiple models to train and fuse their predictions.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {models.map(model => (
            <button
              key={model.id}
              onClick={() => toggleModel(model.id)}
              className={`text-left p-4 rounded-xl border transition-colors ${
                selectedModels.includes(model.id)
                  ? darkMode
                    ? 'border-teal-500/70 bg-teal-500/10'
                    : 'border-teal-500 bg-teal-50'
                  : darkMode
                    ? 'border-gray-700 hover:border-gray-600 bg-gray-900'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${
                  selectedModels.includes(model.id)
                    ? 'border-teal-500 bg-teal-500'
                    : darkMode
                      ? 'border-gray-500'
                      : 'border-gray-300'
                }`}>
                  {selectedModels.includes(model.id) && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div className={`font-medium ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                  {model.name}
                </div>
              </div>
            </button>
          ))}
        </div>
        {selectedModels.length > 0 && (
          <p className={`text-sm mt-3 ml-8 ${darkMode ? 'text-teal-400' : 'text-teal-600'}`}>
            {selectedModels.length} model{selectedModels.length !== 1 ? 's' : ''} selected
          </p>
        )}
      </div>

      {/* Fusion Method Selection */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
            darkMode ? 'bg-teal-900/40 text-teal-300' : 'bg-teal-100 text-teal-700'
          }`}>3</div>
          <h3 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Select Fusion Method</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {methods.map(method => (
            <button
              key={method.id}
              onClick={() => setSelectedMethod(method.id)}
              className={`text-left p-4 rounded-xl border transition-colors ${
                selectedMethod === method.id
                  ? darkMode
                    ? 'border-teal-500/70 bg-teal-500/10'
                    : 'border-teal-500 bg-teal-50'
                  : darkMode
                    ? 'border-gray-700 hover:border-gray-600 bg-gray-900'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  selectedMethod === method.id
                    ? 'border-teal-500'
                    : darkMode
                      ? 'border-gray-500'
                      : 'border-gray-300'
                }`}>
                  {selectedMethod === method.id && (
                    <div className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                  )}
                </div>
                <div>
                  <div className={`font-medium ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                    {method.name}
                  </div>
                  <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {method.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Run Button */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
            darkMode ? 'bg-teal-900/40 text-teal-300' : 'bg-teal-100 text-teal-700'
          }`}>4</div>
          <h3 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Run ML Fusion</h3>
        </div>
        <button
          onClick={runFusion}
          disabled={loading || selectedModels.length < 2}
          className={`w-full py-3.5 text-base rounded-xl font-medium shadow-sm hover:shadow transition-all ${
            loading || selectedModels.length < 2
              ? darkMode
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'btn btn-primary'
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Training & Fusing...
            </span>
          ) : (
            'Run ML Fusion Pipeline'
          )}
        </button>
      </div>

      {/* Error Display */}
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

      {/* Results Display (simple) */}
      {Array.isArray(results) && results.length > 0 && (
        <div className={`rounded-2xl border overflow-hidden ${
          darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
        }`}>
          <div className={`px-6 py-4 border-b ${
            darkMode ? 'border-gray-800' : 'border-gray-200'
          }`}>
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Results
            </h3>
            <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Dataset: {datasets.find(d => d.id === selectedDataset)?.name || selectedDataset} • Fusion: {methods.find(m => m.id === selectedMethod)?.name || selectedMethod}
            </p>
          </div>

          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                    <th className="text-left font-semibold pb-2">Model</th>
                    <th className="text-left font-semibold pb-2">Accuracy</th>
                    <th className="text-left font-semibold pb-2">Conflict</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, idx) => {
                    const isFusion = r.kind === 'fusion'
                    const modelName = isFusion
                      ? `Fusion (${methods.find(m => m.id === r.fusion_method)?.name || r.fusion_method})`
                      : (models.find(m => m.id === r.model_id)?.name || r.model_id || 'Model')

                    const accText = `${(r.accuracy * 100).toFixed(2)}%`
                    const conflictText = r.conflict === null || typeof r.conflict === 'undefined'
                      ? '-'
                      : `${Number(r.conflict).toFixed(2)}`

                    return (
                      <tr
                        key={`${r.kind}-${r.model_id ?? 'fusion'}-${idx}`}
                        className={darkMode ? 'border-t border-gray-800' : 'border-t border-gray-200'}
                      >
                        <td className={`py-2 ${darkMode ? 'text-gray-100' : 'text-gray-900'} ${isFusion ? 'font-semibold' : ''}`}>
                          {modelName}
                        </td>
                        <td className={`py-2 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                          {accText}
                        </td>
                        <td className={`py-2 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                          {conflictText}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MLPipeline
