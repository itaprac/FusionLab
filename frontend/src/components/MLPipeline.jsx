import { useEffect, useRef, useState } from 'react'

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
  const [previewLoading, setPreviewLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const [uploadSummary, setUploadSummary] = useState(null)
  const [selectedFileName, setSelectedFileName] = useState('')
  const [pendingFile, setPendingFile] = useState(null)
  const [datasetPreview, setDatasetPreview] = useState(null)
  const [selectedTargetColumn, setSelectedTargetColumn] = useState('')
  const [selectedFeatureColumns, setSelectedFeatureColumns] = useState([])
  const [customDataset, setCustomDataset] = useState(null)

  const fileInputRef = useRef(null)
  const visibleDatasets = customDataset ? [...datasets, customDataset.dataset] : datasets

  const loadDatasets = async (preferredDatasetId = null) => {
    const response = await fetch('/api/ml/datasets')
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.detail || 'Failed to load datasets')
    }

    setDatasets(data.datasets)
    setSelectedDataset(currentSelection => {
      if (preferredDatasetId && data.datasets.some(dataset => dataset.id === preferredDatasetId)) {
        return preferredDatasetId
      }

      if (preferredDatasetId && customDataset?.dataset.id === preferredDatasetId) {
        return preferredDatasetId
      }

      if (currentSelection && data.datasets.some(dataset => dataset.id === currentSelection)) {
        return currentSelection
      }

      if (currentSelection && customDataset?.dataset.id === currentSelection) {
        return currentSelection
      }

      return data.datasets[0]?.id || ''
    })
  }

  useEffect(() => {
    loadDatasets().catch(err => setError(err.message))

    // Fetch models
    fetch('/api/ml/models')
      .then(async res => {
        const data = await res.json()
        if (!res.ok) {
          throw new Error(data.detail || 'Failed to load models')
        }
        return data
      })
      .then(data => {
        setModels(data.classifiers)
      })
      .catch(err => setError(err.message))

    // Fetch fusion methods
    fetch('/api/methods')
      .then(async res => {
        const data = await res.json()
        if (!res.ok) {
          throw new Error(data.detail || 'Failed to load methods')
        }
        return data
      })
      .then(data => {
        setMethods(data.methods)
        if (data.methods.length > 0) {
          setSelectedMethod(data.methods[0].id)
        }
      })
      .catch(err => setError(err.message))
  }, [])

  const toggleModel = (modelId) => {
    setSelectedModels(prev =>
      prev.includes(modelId)
        ? prev.filter(id => id !== modelId)
        : [...prev, modelId]
    )
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    setPendingFile(file)
    setSelectedFileName(file.name)
    setPreviewLoading(true)
    setUploadError(null)
    setUploadSummary(null)
    setDatasetPreview(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/ml/datasets/preview', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.detail || 'Dataset upload failed')
      }

      const defaultFeatureColumns = data.columns
        .map(column => column.name)
        .filter(columnName => columnName !== data.suggestedTargetColumn)

      setDatasetPreview(data)
      setSelectedTargetColumn(data.suggestedTargetColumn)
      setSelectedFeatureColumns(defaultFeatureColumns)
    } catch (err) {
      setUploadError(err.message)
      setPendingFile(null)
    } finally {
      setPreviewLoading(false)
      event.target.value = ''
    }
  }

  const handleTargetChange = (event) => {
    const nextTarget = event.target.value
    setSelectedTargetColumn(nextTarget)
    setSelectedFeatureColumns(
      (datasetPreview?.columns || [])
        .map(column => column.name)
        .filter(columnName => columnName !== nextTarget)
    )
  }

  const toggleFeatureColumn = (columnName) => {
    setSelectedFeatureColumns(prev =>
      prev.includes(columnName)
        ? prev.filter(name => name !== columnName)
        : [...prev, columnName]
    )
  }

  const importConfiguredDataset = async () => {
    if (!pendingFile || !datasetPreview) {
      setUploadError('Choose a CSV file first.')
      return
    }

    if (!selectedTargetColumn) {
      setUploadError('Select a target column before importing.')
      return
    }

    if (selectedFeatureColumns.length === 0) {
      setUploadError('Select at least one feature column.')
      return
    }

    setUploading(true)
    setUploadError(null)

    const formData = new FormData()
    formData.append('file', pendingFile)
    formData.append('target_column', selectedTargetColumn)
    formData.append('feature_columns', JSON.stringify(selectedFeatureColumns))

    try {
      const response = await fetch('/api/ml/datasets/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.detail || 'Dataset upload failed')
      }

      setUploadSummary(data)
      setError(null)
      setCustomDataset({
        dataset: data.dataset,
        file: pendingFile,
        targetColumn: selectedTargetColumn,
        featureColumns: selectedFeatureColumns
      })
      setSelectedDataset(data.dataset.id)
    } catch (err) {
      setUploadError(err.message)
    } finally {
      setUploading(false)
    }
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
      const isCustomDataset = customDataset?.dataset.id === selectedDataset
      let response

      if (isCustomDataset) {
        const formData = new FormData()
        formData.append('file', customDataset.file)
        formData.append('target_column', customDataset.targetColumn)
        formData.append('feature_columns', JSON.stringify(customDataset.featureColumns))
        formData.append('models', JSON.stringify(selectedModels))
        formData.append('fusion_method', selectedMethod)

        response = await fetch('/api/ml/run-upload', {
          method: 'POST',
          body: formData
        })
      } else {
        response = await fetch('/api/ml/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            datasetId: selectedDataset,
            models: selectedModels,
            fusionMethod: selectedMethod
          })
        })
      }

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

        <div className={`mb-4 overflow-hidden rounded-2xl border ${
          darkMode ? 'border-teal-900/70 bg-gradient-to-br from-teal-950/70 via-gray-950 to-gray-950' : 'border-teal-100 bg-gradient-to-br from-amber-50 via-white to-teal-50'
        }`}>
          <div className="p-5 md:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="max-w-2xl">
                <p className={`text-xs font-semibold uppercase tracking-[0.24em] ${
                  darkMode ? 'text-teal-300/80' : 'text-teal-700/80'
                }`}>
                  Custom Dataset
                </p>
                <h4 className={`mt-2 text-lg font-semibold ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Upload your own CSV and run the same fusion pipeline
                </h4>
                <p className={`mt-2 text-sm leading-6 ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Format: UTF-8 CSV, comma-separated, header row required. After upload you can choose which column is the target and which columns should be used as features. Numeric and categorical feature columns are both supported.
                </p>
              </div>

              <div className="flex w-full flex-col gap-3 md:w-auto md:min-w-72">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <button
                  type="button"
                  onClick={handleUploadClick}
                  disabled={previewLoading || uploading}
                  className={`rounded-2xl px-4 py-3 text-left transition-all ${
                    previewLoading || uploading
                      ? darkMode
                        ? 'cursor-not-allowed bg-gray-800 text-gray-500'
                        : 'cursor-not-allowed bg-gray-100 text-gray-400'
                      : darkMode
                        ? 'bg-teal-400 text-gray-950 shadow-[0_18px_40px_rgba(45,212,191,0.18)] hover:-translate-y-0.5'
                        : 'bg-teal-600 text-white shadow-[0_18px_40px_rgba(13,148,136,0.24)] hover:-translate-y-0.5'
                  }`}
                >
                  <span className="block text-sm font-semibold">
                    {previewLoading ? 'Inspecting columns...' : uploading ? 'Importing dataset...' : 'Choose CSV file'}
                  </span>
                  <span className={`mt-1 block text-xs ${
                    previewLoading || uploading
                      ? darkMode ? 'text-gray-500' : 'text-gray-400'
                      : darkMode ? 'text-gray-900/70' : 'text-white/75'
                  }`}>
                    {selectedFileName || 'Try the Iris CSV linked in the plan.'}
                  </span>
                </button>

                <div className={`rounded-2xl border px-4 py-3 text-sm ${
                  darkMode ? 'border-white/10 bg-white/5 text-gray-300' : 'border-white/70 bg-white/80 text-gray-600'
                }`}>
                  <div className="flex items-center justify-between gap-3">
                    <span>Session storage</span>
                    <span className={`rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${
                      darkMode ? 'bg-teal-400/10 text-teal-300' : 'bg-teal-100 text-teal-700'
                    }`}>
                      temporary
                    </span>
                  </div>
                  <p className={`mt-2 text-xs leading-5 ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Uploaded datasets stay only in this page session and disappear after refresh.
                  </p>
                </div>
              </div>
            </div>

            {uploadError && (
              <div className={`mt-4 rounded-xl border px-4 py-3 text-sm ${
                darkMode
                  ? 'border-red-900/70 bg-red-950/50 text-red-300'
                  : 'border-red-200 bg-red-50 text-red-700'
              }`}>
                {uploadError}
              </div>
            )}

            {datasetPreview && (
              <div className={`mt-4 rounded-2xl border p-4 md:p-5 ${
                darkMode ? 'border-white/10 bg-white/5' : 'border-white/70 bg-white/85'
              }`}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h5 className={`text-base font-semibold ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        Column mapping
                      </h5>
                      <span className={`rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                        darkMode ? 'bg-teal-400/10 text-teal-300' : 'bg-teal-100 text-teal-700'
                      }`}>
                        {datasetPreview.totalRows} rows detected
                      </span>
                    </div>
                    <p className={`mt-2 text-sm ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Pick the target column, then leave the useful feature columns checked. Columns marked as categorical will be encoded automatically during training.
                    </p>
                  </div>

                  <div className="w-full lg:w-64">
                    <label className={`mb-2 block text-xs font-semibold uppercase tracking-[0.2em] ${
                      darkMode ? 'text-teal-300/80' : 'text-teal-700/80'
                    }`}>
                      Target column
                    </label>
                    <select
                      value={selectedTargetColumn}
                      onChange={handleTargetChange}
                      className={`w-full rounded-xl border px-3 py-2.5 text-sm ${
                        darkMode
                          ? 'border-gray-700 bg-gray-950 text-gray-100'
                          : 'border-gray-200 bg-white text-gray-900'
                      }`}
                    >
                      {datasetPreview.columns.map(column => (
                        <option key={column.name} value={column.name}>
                          {column.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {datasetPreview.columns.map(column => {
                    const isTarget = column.name === selectedTargetColumn
                    const isSelectedFeature = selectedFeatureColumns.includes(column.name)

                    return (
                      <button
                        key={column.name}
                        type="button"
                        onClick={() => {
                          if (!isTarget) {
                            toggleFeatureColumn(column.name)
                          }
                        }}
                        className={`rounded-2xl border p-4 text-left transition-colors ${
                          isTarget
                            ? darkMode
                              ? 'border-amber-500/60 bg-amber-500/10'
                              : 'border-amber-300 bg-amber-50'
                            : isSelectedFeature
                              ? darkMode
                                ? 'border-teal-500/60 bg-teal-500/10'
                                : 'border-teal-300 bg-teal-50'
                              : darkMode
                                ? 'border-gray-800 bg-gray-950 hover:border-gray-700'
                                : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className={`font-medium ${
                              darkMode ? 'text-gray-100' : 'text-gray-900'
                            }`}>
                              {column.name}
                            </div>
                            <p className={`mt-2 text-xs uppercase tracking-[0.2em] ${
                              darkMode ? 'text-gray-500' : 'text-gray-400'
                            }`}>
                              {column.kind}
                            </p>
                          </div>
                          <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${
                            isTarget
                              ? darkMode ? 'bg-amber-400/10 text-amber-300' : 'bg-amber-100 text-amber-700'
                              : isSelectedFeature
                                ? darkMode ? 'bg-teal-400/10 text-teal-300' : 'bg-teal-100 text-teal-700'
                                : darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {isTarget ? 'target' : isSelectedFeature ? 'feature' : 'ignored'}
                          </span>
                        </div>
                        <p className={`mt-3 text-sm ${
                          darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {column.uniqueValues} unique values
                        </p>
                      </button>
                    )
                  })}
                </div>

                <div className="mt-4 overflow-x-auto rounded-2xl border">
                  <table className={`min-w-full text-sm ${
                    darkMode ? 'border-gray-800 bg-gray-950' : 'border-gray-200 bg-white'
                  }`}>
                    <thead>
                      <tr className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                        {datasetPreview.columns.map(column => (
                          <th key={column.name} className="border-b px-3 py-2 text-left font-semibold">
                            {column.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {datasetPreview.sampleRows.map((row, rowIndex) => (
                        <tr key={rowIndex} className={darkMode ? 'border-t border-gray-800' : 'border-t border-gray-200'}>
                          {datasetPreview.columns.map(column => (
                            <td key={`${rowIndex}-${column.name}`} className={`px-3 py-2 ${
                              darkMode ? 'text-gray-300' : 'text-gray-600'
                            }`}>
                              {row[column.name]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <p className={`text-sm ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {selectedFeatureColumns.length} feature columns selected.
                  </p>
                  <button
                    type="button"
                    onClick={importConfiguredDataset}
                    disabled={uploading}
                    className={`rounded-2xl px-4 py-3 text-sm font-semibold transition-all ${
                      uploading
                        ? darkMode
                          ? 'cursor-not-allowed bg-gray-800 text-gray-500'
                          : 'cursor-not-allowed bg-gray-100 text-gray-400'
                        : darkMode
                          ? 'bg-white text-gray-950 hover:-translate-y-0.5'
                          : 'bg-gray-900 text-white hover:-translate-y-0.5'
                    }`}
                  >
                    {uploading ? 'Importing...' : 'Import dataset with selected mapping'}
                  </button>
                </div>
              </div>
            )}

            {uploadSummary && (
              <div className={`mt-4 rounded-xl border px-4 py-3 ${
                darkMode
                  ? 'border-teal-800/80 bg-teal-950/40 text-teal-100'
                  : 'border-teal-200 bg-white/90 text-teal-900'
              }`}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold">{uploadSummary.dataset.name}</span>
                  <span className={`rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                    darkMode ? 'bg-teal-400/10 text-teal-300' : 'bg-teal-100 text-teal-700'
                  }`}>
                    Ready
                  </span>
                </div>
                <p className={`mt-2 text-sm ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {uploadSummary.rows} rows, {uploadSummary.features} features, {uploadSummary.classes.length} classes.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {visibleDatasets.map(dataset => (
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
                {dataset.id.startsWith('custom_') && (
                  <span className={`ml-auto rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${
                    darkMode ? 'bg-teal-400/10 text-teal-300' : 'bg-teal-100 text-teal-700'
                  }`}>
                    Uploaded
                  </span>
                )}
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
              Dataset: {visibleDatasets.find(d => d.id === selectedDataset)?.name || selectedDataset} • Fusion: {methods.find(m => m.id === selectedMethod)?.name || selectedMethod}
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
