import { useEffect, useRef, useState } from 'react'
import MethodSelector from './MethodSelector'

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
  const [sampleAnalysis, setSampleAnalysis] = useState(null)
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

  const fmtPct = (v) => {
    if (v === null || v === undefined || Number.isNaN(Number(v))) return '-'
    return `${(Number(v) * 100).toFixed(2)}%`
  }

  const fmtDec = (v) => {
    if (v === null || v === undefined || Number.isNaN(Number(v))) return '-'
    return Number(v).toFixed(2)
  }

  const loadDatasets = async (preferred = null) => {
    const res = await fetch('/api/ml/datasets')
    const data = await res.json()
    if (!res.ok) throw new Error(data.detail || 'Failed to load datasets')
    setDatasets(data.datasets)
    setSelectedDataset(cur => {
      if (preferred && data.datasets.some(d => d.id === preferred)) return preferred
      if (preferred && customDataset?.dataset.id === preferred) return preferred
      if (cur && data.datasets.some(d => d.id === cur)) return cur
      if (cur && customDataset?.dataset.id === cur) return cur
      return data.datasets[0]?.id || ''
    })
  }

  useEffect(() => {
    loadDatasets().catch(err => setError(err.message))
    fetch('/api/ml/models').then(async r => { const d = await r.json(); if (!r.ok) throw new Error(d.detail); return d }).then(d => setModels(d.classifiers)).catch(e => setError(e.message))
    fetch('/api/methods').then(async r => { const d = await r.json(); if (!r.ok) throw new Error(d.detail); return d }).then(d => { setMethods(d.methods); if (d.methods.length) setSelectedMethod(d.methods[0].id) }).catch(e => setError(e.message))
  }, [])

  const toggleModel = (id) => setSelectedModels(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setPendingFile(file)
    setSelectedFileName(file.name)
    setPreviewLoading(true)
    setUploadError(null)
    setUploadSummary(null)
    setDatasetPreview(null)
    const fd = new FormData(); fd.append('file', file)
    try {
      const r = await fetch('/api/ml/datasets/preview', { method: 'POST', body: fd })
      const d = await r.json(); if (!r.ok) throw new Error(d.detail || 'Preview failed')
      setDatasetPreview(d)
      setSelectedTargetColumn(d.suggestedTargetColumn)
      setSelectedFeatureColumns(d.columns.map(c => c.name).filter(n => n !== d.suggestedTargetColumn))
    } catch (e) { setUploadError(e.message); setPendingFile(null) }
    finally { setPreviewLoading(false); event.target.value = '' }
  }

  const handleTargetChange = (e) => {
    const t = e.target.value
    setSelectedTargetColumn(t)
    setSelectedFeatureColumns((datasetPreview?.columns || []).map(c => c.name).filter(n => n !== t))
  }

  const toggleFeatureColumn = (n) => setSelectedFeatureColumns(p => p.includes(n) ? p.filter(x => x !== n) : [...p, n])

  const importConfiguredDataset = async () => {
    if (!pendingFile || !datasetPreview) { setUploadError('Choose a CSV file first.'); return }
    if (!selectedTargetColumn) { setUploadError('Select a target column.'); return }
    if (!selectedFeatureColumns.length) { setUploadError('Select at least one feature column.'); return }
    setUploading(true); setUploadError(null)
    const fd = new FormData()
    fd.append('file', pendingFile); fd.append('target_column', selectedTargetColumn)
    fd.append('feature_columns', JSON.stringify(selectedFeatureColumns))
    try {
      const r = await fetch('/api/ml/datasets/upload', { method: 'POST', body: fd })
      const d = await r.json(); if (!r.ok) throw new Error(d.detail || 'Upload failed')
      setUploadSummary(d); setError(null)
      setCustomDataset({ dataset: d.dataset, file: pendingFile, targetColumn: selectedTargetColumn, featureColumns: selectedFeatureColumns })
      setSelectedDataset(d.dataset.id)
    } catch (e) { setUploadError(e.message) }
    finally { setUploading(false) }
  }

  const runFusion = async () => {
    if (selectedModels.length < 2) { setError('Select at least 2 models'); return }
    setError(null); setResults(null); setSampleAnalysis(null); setLoading(true)
    try {
      const isCustom = customDataset?.dataset.id === selectedDataset
      let r
      if (isCustom) {
        const fd = new FormData()
        fd.append('file', customDataset.file); fd.append('target_column', customDataset.targetColumn)
        fd.append('feature_columns', JSON.stringify(customDataset.featureColumns))
        fd.append('models', JSON.stringify(selectedModels)); fd.append('fusion_method', selectedMethod)
        r = await fetch('/api/ml/run-upload', { method: 'POST', body: fd })
      } else {
        r = await fetch('/api/ml/run', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ datasetId: selectedDataset, models: selectedModels, fusionMethod: selectedMethod }) })
      }
      const d = await r.json(); if (!r.ok) throw new Error(d.detail || 'ML Fusion failed')
      setResults(d.results)
      setSampleAnalysis(d.sample_analysis ?? null)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <p className="label" style={{ color: 'var(--accent)' }}>Model workflow</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em]" style={{ color: 'var(--text-strong)' }}>
          ML Fusion
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-7" style={{ color: 'var(--text)' }}>
          Compare classifiers on the same dataset, fuse their outputs, and inspect how the combined result behaves.
        </p>
      </div>

      {/* Step 1: Dataset */}
      <section className="border-t pt-6" style={{ borderColor: 'var(--line)' }}>
        <div className="flex items-center gap-2 mb-1">
          <span className="mono flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold" style={{ background: 'var(--accent-soft)', color: 'var(--accent-strong)' }}>1</span>
          <p className="label" style={{ margin: 0 }}>Dataset</p>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {visibleDatasets.map(ds => {
            const active = selectedDataset === ds.id
            return (
              <button
                key={ds.id}
                onClick={() => setSelectedDataset(ds.id)}
                className="option-chip"
                data-active={active}
              >
                <div
                  className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2"
                  style={{ borderColor: active ? 'var(--accent)' : 'var(--line-strong)' }}
                >
                  {active && <div className="h-2 w-2 rounded-full" style={{ background: 'var(--accent)' }} />}
                </div>
                <span className="text-left">
                  {ds.name}
                  {ds.id.startsWith('custom_') && (
                    <span className="ml-1 text-xs" style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(uploaded)</span>
                  )}
                </span>
              </button>
            )
          })}
        </div>

        {/* Upload */}
        <div className="mt-4 rounded-lg border p-4" style={{ borderColor: 'var(--line)', background: 'var(--bg-sunken)' }}>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-strong)' }}>Upload your own CSV</h3>
              <p className="mt-0.5 text-xs leading-5" style={{ color: 'var(--text-muted)' }}>
                UTF-8 with header row. Session only — disappears on refresh.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <input ref={fileInputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleFileChange} />
              <button onClick={() => fileInputRef.current?.click()} disabled={previewLoading || uploading} className="btn btn-secondary text-xs shrink-0">
                {previewLoading ? 'Inspecting\u2026' : uploading ? 'Importing\u2026' : 'Choose CSV file'}
              </button>
              {selectedFileName && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{selectedFileName}</span>}
            </div>
          </div>

          {uploadError && <p className="mt-2 text-xs" style={{ color: 'var(--danger)' }}>{uploadError}</p>}

          {uploadSummary && (
            <div className="mt-3 text-xs" style={{ color: 'var(--accent-strong)' }}>
              <span className="font-semibold">{uploadSummary.dataset.name}</span>{' '}
              <span style={{ color: 'var(--text-muted)' }}>{uploadSummary.rows} rows, {uploadSummary.features} features</span>
            </div>
          )}
        </div>

        {/* Dataset preview */}
        {datasetPreview && (
          <div className="mt-4 rounded-lg border p-5" style={{ borderColor: 'var(--line)', background: 'var(--bg-elevated)' }}>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h4 className="text-sm font-semibold" style={{ color: 'var(--text-strong)' }}>Column mapping</h4>
                <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>{datasetPreview.totalRows} rows detected</p>
              </div>
              <div className="w-full lg:w-48">
                <label className="label mb-1 block">Target column</label>
                <select value={selectedTargetColumn} onChange={handleTargetChange} className="input">
                  {datasetPreview.columns.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                </select>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-6">
              {datasetPreview.columns.map(col => {
                const isTarget = col.name === selectedTargetColumn
                const isFeat = selectedFeatureColumns.includes(col.name)
                return (
                  <button
                    key={col.name}
                    onClick={() => { if (!isTarget) toggleFeatureColumn(col.name) }}
                    className="option-chip justify-start text-xs"
                    data-active={isFeat}
                    style={isTarget ? { borderColor: 'var(--line-strong)', opacity: 0.6 } : {}}
                  >
                    <span className="font-medium" style={{ color: 'var(--text-strong)' }}>{col.name}</span>
                    <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      {isTarget ? 'target' : isFeat ? 'feature' : 'off'}
                    </span>
                  </button>
                )
              })}
            </div>

            <div className="mt-4 overflow-x-auto rounded-lg border" style={{ borderColor: 'var(--line)' }}>
              <table className="min-w-full text-xs" style={{ background: 'var(--bg-elevated)' }}>
                <thead>
                  <tr>
                    {datasetPreview.columns.map(c => (
                      <th key={c.name} className="border-b px-3 py-2 text-left font-semibold" style={{ borderColor: 'var(--line)', color: 'var(--text)' }}>{c.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {datasetPreview.sampleRows.map((row, ri) => (
                    <tr key={ri} className="border-t" style={{ borderColor: 'var(--line)' }}>
                      {datasetPreview.columns.map(c => (
                        <td key={`${ri}-${c.name}`} className="px-3 py-1.5" style={{ color: 'var(--text)' }}>{row[c.name]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{selectedFeatureColumns.length} features selected</p>
              <button onClick={importConfiguredDataset} disabled={uploading} className="btn btn-primary">
                {uploading ? 'Importing\u2026' : 'Import with selected mapping'}
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Step 2: Models */}
      <section className="border-t pt-6" style={{ borderColor: 'var(--line)' }}>
        <div className="flex items-center gap-2 mb-1">
          <span className="mono flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold" style={{ background: 'var(--accent-soft)', color: 'var(--accent-strong)' }}>2</span>
          <p className="label" style={{ margin: 0 }}>ML Models</p>
        </div>
        <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>Choose at least 2 models to train and fuse.</p>

        <div className="mt-3 flex flex-wrap gap-2">
          {models.map(m => {
            const sel = selectedModels.includes(m.id)
            return (
              <button
                key={m.id}
                onClick={() => toggleModel(m.id)}
                className="option-chip"
                data-active={sel}
              >
                <div
                  className="flex h-4 w-4 shrink-0 items-center justify-center rounded border-2"
                  style={{
                    borderColor: sel ? 'var(--accent)' : 'var(--line-strong)',
                    background: sel ? 'var(--accent)' : 'transparent',
                  }}
                >
                  {sel && (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                {m.name}
              </button>
            )
          })}
        </div>
        {selectedModels.length > 0 && (
          <p className="mt-2 text-xs font-semibold" style={{ color: 'var(--accent-strong)' }}>
            {selectedModels.length} model{selectedModels.length !== 1 ? 's' : ''} selected
          </p>
        )}
      </section>

      {/* Step 3: Fusion method */}
      <section className="border-t pt-6" style={{ borderColor: 'var(--line)' }}>
        <div className="flex items-center gap-2 mb-1">
          <span className="mono flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold" style={{ background: 'var(--accent-soft)', color: 'var(--accent-strong)' }}>3</span>
          <p className="label" style={{ margin: 0 }}>Fusion method</p>
        </div>
        <MethodSelector methods={methods} selected={selectedMethod} onChange={setSelectedMethod} />
      </section>

      {/* Run */}
      <section className="border-t pt-6" style={{ borderColor: 'var(--line)' }}>
        <div className="flex items-center gap-4">
          <button onClick={runFusion} disabled={loading || selectedModels.length < 2} className="btn btn-primary">
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Training & Fusing...
              </span>
            ) : 'Run ML Fusion Pipeline'}
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

      {/* Results */}
      {Array.isArray(results) && results.length > 0 && (() => {
        const fusionRow = results.find(r => r.kind === 'fusion')
        const individualRows = results.filter(r => r.kind !== 'fusion')
        const bestIndividual = individualRows.reduce((best, r) => {
          const acc = Number(r.accuracy) || 0
          return acc > (Number(best?.accuracy) || 0) ? r : best
        }, individualRows[0])
        const fusionAcc = fusionRow ? Number(fusionRow.accuracy) || 0 : 0
        const bestAcc = bestIndividual ? Number(bestIndividual.accuracy) || 0 : 0
        const fusionWins = fusionAcc >= bestAcc

        return (
          <section className="result-enter">
            <div
              className="overflow-hidden rounded-xl border mb-6"
              style={{ borderColor: 'var(--line)' }}
            >
              <div
                className="flex items-center gap-2 px-4 py-2.5"
                style={{ background: 'var(--accent-soft)', borderBottom: '1px solid var(--line)' }}
              >
                <svg className="h-4 w-4" style={{ color: 'var(--accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs font-bold tracking-wide uppercase" style={{ color: 'var(--accent-strong)' }}>Pipeline Result</span>
              </div>
              <div className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em]" style={{ color: 'var(--text-muted)' }}>
                    Fusion accuracy
                  </p>
                  <span className="mono text-2xl font-bold tracking-tight" style={{ color: 'var(--accent-strong)' }}>
                    {fmtPct(fusionRow?.accuracy)}
                  </span>
                </div>
                <div className="sm:text-right">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em]" style={{ color: 'var(--text-muted)' }}>
                    Best individual
                  </p>
                  <p className="mono mt-1 text-base font-semibold" style={{ color: 'var(--text-strong)' }}>
                    {fmtPct(bestIndividual?.accuracy)}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: fusionWins ? 'var(--accent-strong)' : 'var(--text-muted)' }}>
                    {fusionWins ? 'Fusion matches or beats individual models' : 'Individual model outperforms fusion'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 mb-4">
              <p className="label">Detailed comparison</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {visibleDatasets.find(d => d.id === selectedDataset)?.name || selectedDataset} · {methods.find(m => m.id === selectedMethod)?.name || selectedMethod}
              </p>
            </div>

            <div className="overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--line)' }}>
              <table className="w-full text-sm" style={{ background: 'var(--bg-elevated)' }}>
                <thead>
                  <tr style={{ color: 'var(--text-muted)', background: 'var(--bg-sunken)' }}>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em]">Model</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em]">Accuracy</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em]">Precision</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em]">Recall</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em]">F1</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em]">ROC AUC</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em]">Conflict</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, idx) => {
                    const isFusion = r.kind === 'fusion'
                    const name = isFusion
                      ? `Fusion (${methods.find(m => m.id === r.fusion_method)?.name || r.fusion_method})`
                      : (models.find(m => m.id === r.model_id)?.name || r.model_id)
                    return (
                      <tr
                        key={`${r.kind}-${r.model_id ?? 'fusion'}-${idx}`}
                        className="border-t"
                        style={{
                          borderColor: 'var(--line)',
                          background: isFusion ? 'var(--accent-soft)' : 'transparent',
                        }}
                      >
                        <td className="px-4 py-3" style={{ color: 'var(--text-strong)', fontWeight: isFusion ? 700 : 400 }}>
                          <div className="flex items-center gap-2">
                            {isFusion && <span className="inline-block h-2 w-2 rounded-full" style={{ background: 'var(--accent)' }} />}
                            {name}
                          </div>
                        </td>
                        <td className="px-4 py-3 mono" style={{ fontWeight: isFusion ? 700 : 400, color: isFusion ? 'var(--accent-strong)' : 'var(--text)' }}>{fmtPct(r.accuracy)}</td>
                        <td className="px-4 py-3 mono">{fmtPct(r.precision)}</td>
                        <td className="px-4 py-3 mono">{fmtPct(r.recall)}</td>
                        <td className="px-4 py-3 mono">{fmtPct(r.f1_score)}</td>
                        <td className="px-4 py-3 mono">{fmtPct(r.roc_auc)}</td>
                        <td className="px-4 py-3 mono">{fmtDec(r.conflict)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {sampleAnalysis && (() => {
              const bestName = models.find(m => m.id === sampleAnalysis.best_model_id)?.name || sampleAnalysis.best_model_id
              const stat = (label, value, hint) => (
                <div
                  key={label}
                  className="rounded-lg border px-3 py-2"
                  style={{ borderColor: 'var(--line)', background: 'var(--bg-elevated)' }}
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: 'var(--text-muted)' }}>{label}</p>
                  <p className="mono mt-0.5 text-lg font-bold" style={{ color: 'var(--text-strong)' }}>{value}</p>
                  {hint && <p className="mt-0.5 text-[10px] leading-4" style={{ color: 'var(--text-muted)' }}>{hint}</p>}
                </div>
              )
              const sampleTable = (title, subtitle, rows, total, truncated, borderAccent) => (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold" style={{ color: 'var(--text-strong)' }}>{title}</h4>
                  {subtitle && <p className="mt-1 text-xs leading-5" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>}
                  {rows.length === 0 ? (
                    <p className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>No samples in this category.</p>
                  ) : (
                    <>
                      <div className="mt-2 overflow-x-auto rounded-lg border" style={{ borderColor: 'var(--line)' }}>
                        <table className="w-full min-w-[640px] text-xs" style={{ background: 'var(--bg-elevated)' }}>
                          <thead>
                            <tr style={{ color: 'var(--text-muted)', background: 'var(--bg-sunken)' }}>
                              <th className="px-3 py-2 text-left font-semibold uppercase tracking-[0.08em]">Dataset row</th>
                              <th className="px-3 py-2 text-left font-semibold uppercase tracking-[0.08em]">Test idx</th>
                              <th className="px-3 py-2 text-left font-semibold uppercase tracking-[0.08em]">True</th>
                              <th className="px-3 py-2 text-left font-semibold uppercase tracking-[0.08em]">Fusion</th>
                              {selectedModels.map(mid => (
                                <th key={mid} className="px-3 py-2 text-left font-semibold uppercase tracking-[0.08em]">
                                  {models.find(m => m.id === mid)?.name || mid}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {rows.map((row, ri) => (
                              <tr
                                key={`${row.test_index}-${row.original_row_index}-${ri}`}
                                className="border-t"
                                style={{ borderColor: 'var(--line)' }}
                              >
                                <td className="px-3 py-2 mono" style={{ color: 'var(--text)' }}>{row.original_row_index}</td>
                                <td className="px-3 py-2 mono" style={{ color: 'var(--text)' }}>{row.test_index}</td>
                                <td className="px-3 py-2 mono" style={{ color: 'var(--text-strong)' }}>{row.y_true}</td>
                                <td
                                  className="px-3 py-2 mono font-semibold"
                                  style={{ color: borderAccent ? 'var(--accent-strong)' : 'var(--danger)' }}
                                >
                                  {row.y_fused}
                                </td>
                                {selectedModels.map(mid => (
                                  <td key={mid} className="px-3 py-2 mono" style={{ color: 'var(--text)' }}>
                                    {row.predictions[mid] ?? '—'}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {truncated && total > rows.length && (
                        <p className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                          Showing first {rows.length} of {total} samples.
                        </p>
                      )}
                    </>
                  )}
                </div>
              )
              return (
                <div
                  className="mt-8 overflow-hidden rounded-xl border"
                  style={{ borderColor: 'var(--line)' }}
                >
                  <div
                    className="flex items-center gap-2 px-4 py-2.5"
                    style={{ background: 'var(--bg-sunken)', borderBottom: '1px solid var(--line)' }}
                  >
                    <span className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--text-strong)' }}>
                      Sample-level analysis
                    </span>
                  </div>
                  <div className="space-y-2 p-4">
                    <p className="text-sm leading-6" style={{ color: 'var(--text-muted)' }}>
                      Test set:{' '}
                      <span className="mono font-semibold" style={{ color: 'var(--text-strong)' }}>{sampleAnalysis.test_set_size}</span>
                      {' '}samples. Baseline model (highest test accuracy):{' '}
                      <span className="font-semibold" style={{ color: 'var(--text-strong)' }}>{bestName}</span>.
                    </p>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                      {stat('Gain vs best', sampleAnalysis.gain_vs_best, 'Fusion correct, baseline wrong')}
                      {stat('Loss vs best', sampleAnalysis.loss_vs_best, 'Baseline correct, fusion wrong')}
                      {stat('Both correct', sampleAnalysis.tie_correct_vs_best, 'Fusion and baseline agree (correct)')}
                      {stat('Both wrong', sampleAnalysis.tie_wrong_vs_best, 'Fusion and baseline agree (wrong)')}
                      {stat('Gain vs majority', sampleAnalysis.gain_vs_majority, 'Fusion correct, majority vote wrong')}
                      {stat('Loss vs majority', sampleAnalysis.loss_vs_majority, 'Majority correct, fusion wrong')}
                      {stat('Rescue', sampleAnalysis.rescue_all_wrong, 'Fusion correct while every model wrong')}
                    </div>
                    {sampleTable(
                      `Where fusion beats the best single model (${bestName})`,
                      'Fusion predicted the true label; the baseline single model did not.',
                      sampleAnalysis.gains_vs_best,
                      sampleAnalysis.gains_vs_best_total,
                      sampleAnalysis.gains_vs_best_truncated,
                      true,
                    )}
                    {sampleTable(
                      `Where fusion is worse than the best single model (${bestName})`,
                      'The baseline single model predicted the true label; fusion did not.',
                      sampleAnalysis.losses_vs_best,
                      sampleAnalysis.losses_vs_best_total,
                      sampleAnalysis.losses_vs_best_truncated,
                      false,
                    )}
                  </div>
                </div>
              )
            })()}
          </section>
        )
      })()}
    </div>
  )
}

export default MLPipeline
