import { useEffect, useRef, useState } from 'react'
import MethodSelector from './MethodSelector'
import CodeExportModal from './CodeExportModal'
import ExperimentHistoryPanel from './ExperimentHistoryPanel'
import { useLanguage } from '../contexts/LanguageContext'

const ML_HISTORY_KEY = 'fusionLab.mlHistory'
const ML_HISTORY_LIMIT = 10

function readMLHistory() {
  if (typeof window === 'undefined') return []
  try {
    const parsed = JSON.parse(localStorage.getItem(ML_HISTORY_KEY) || '[]')
    return Array.isArray(parsed) ? parsed.slice(0, ML_HISTORY_LIMIT) : []
  } catch {
    return []
  }
}

function defaultsFromSchema(schema) {
  const o = {}
  for (const f of schema || []) o[f.key] = f.default
  return o
}

async function readJsonResponse(response, fallbackMessage) {
  const text = await response.text()
  if (!text) return {}
  try {
    return JSON.parse(text)
  } catch {
    if (!response.ok) throw new Error(text || fallbackMessage)
    throw new Error(fallbackMessage)
  }
}

function responseErrorMessage(data, fallbackMessage) {
  const detail = data?.detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    return detail.map((item) => (typeof item === 'string' ? item : item?.msg || JSON.stringify(item))).join(' ')
  }
  return fallbackMessage
}

function MethodParamInput({ spec, values, onChange }) {
  const compact = 'input max-w-[6.5rem] py-1.5 px-2 text-xs'
  const compactWide = 'input max-w-[9rem] py-1.5 px-2 text-xs'
  if (spec.kind === 'select') {
    return (
      <select
        value={values[spec.key] ?? spec.default}
        onChange={(e) => onChange({ ...values, [spec.key]: e.target.value })}
        className={compactWide}
      >
        {(spec.options || []).map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    )
  }
  return (
    <input
      type="number"
      value={values[spec.key] ?? spec.default}
      onChange={(e) => {
        const v = e.target.value === '' ? spec.default : parseFloat(e.target.value)
        onChange({ ...values, [spec.key]: Number.isNaN(v) ? spec.default : v })
      }}
      min={spec.min}
      max={spec.max}
      step={spec.step ?? 'any'}
      className={compact}
    />
  )
}

function ModelParamFields({ schema, values, onChange }) {
  if (!schema?.length) return null
  return (
    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
      {schema.map((spec) => (
        <label key={spec.key} className="inline-flex flex-col gap-0.5">
          <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{spec.label}</span>
          <MethodParamInput spec={spec} values={values} onChange={onChange} />
        </label>
      ))}
    </div>
  )
}

function confusionMatrixStats(matrix) {
  const n = matrix.length
  let total = 0
  let correct = 0
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < matrix[i].length; j++) {
      const v = Number(matrix[i][j]) || 0
      total += v
      if (i === j) correct += v
    }
  }
  const wrong = total - correct
  const acc = total > 0 ? correct / total : 0
  return { total, correct, wrong, acc }
}

function ConfusionHeatmap({ matrix, labels, t }) {
  if (!matrix?.length || !labels?.length) return null
  const flat = matrix.flat()
  const maxVal = Math.max(...flat, 1)
  const stats = confusionMatrixStats(matrix)

  const fmtInt = (v) => new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(v)
  const fmtPct = (v) => `${(v * 100).toFixed(2)}%`

  const statRow = (label, value, valueStyle) => (
    <div className="flex items-baseline justify-between gap-3 border-b py-2.5 last:border-b-0" style={{ borderColor: 'var(--line)' }}>
      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span className="mono text-sm font-semibold tabular-nums" style={{ color: valueStyle?.color ?? 'var(--text-strong)' }}>{value}</span>
    </div>
  )

  return (
    <div className="mt-8 grid gap-4 border-t pt-8 lg:grid-cols-2" style={{ borderColor: 'var(--line)' }}>
      <div className="overflow-hidden rounded-xl border" style={{ borderColor: 'var(--line)', background: 'var(--bg-elevated)' }}>
        <div
          className="flex items-center gap-2 border-b px-4 py-2.5"
          style={{ background: 'var(--accent-soft)', borderColor: 'var(--line)' }}
        >
          <svg className="h-4 w-4 shrink-0" style={{ color: 'var(--accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          <span className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--accent-strong)' }}>{t('ml.cm.title')}</span>
        </div>
        <p className="border-b px-4 py-2 text-[11px] leading-snug" style={{ borderColor: 'var(--line)', color: 'var(--text-muted)' }}>
          {t('ml.cm.caption')}
        </p>
        <div className="overflow-x-auto p-3 sm:p-4">
          <table className="w-full min-w-[12rem] border-collapse text-sm" role="grid" aria-label={t('ml.cm.title')}>
            <thead>
              <tr style={{ color: 'var(--text-muted)', background: 'var(--bg-sunken)' }}>
                <th
                  className="w-8 min-w-[2rem] border-b border-r px-1 py-2"
                  style={{ borderColor: 'var(--line)' }}
                  aria-hidden="true"
                />
                {labels.map((c) => (
                  <th
                    key={c}
                    scope="col"
                    className="border-b px-2 py-2 text-center text-[11px] font-semibold"
                    style={{ borderColor: 'var(--line)' }}
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.map((row, ri) => (
                <tr key={ri}>
                  <th
                    scope="row"
                    className="border-b border-r px-2 py-2 text-left text-[11px] font-semibold"
                    style={{ borderColor: 'var(--line)', color: 'var(--text-strong)', background: 'var(--bg-sunken)' }}
                  >
                    {labels[ri]}
                  </th>
                  {row.map((cell, ci) => {
                    const isDiag = ri === ci
                    const c = Number(cell) || 0
                    const intensity = maxVal > 0 ? c / maxVal : 0
                    const fill = c === 0
                      ? 'var(--bg-sunken)'
                      : `color-mix(in oklab, var(--accent) ${Math.round(intensity * 32)}%, var(--bg-elevated))`
                    return (
                      <td
                        key={ci}
                        className="border-b px-2 py-1.5 text-center font-mono text-xs tabular-nums"
                        style={{
                          borderColor: 'var(--line)',
                          background: fill,
                          color: 'var(--text-strong)',
                          boxShadow: isDiag && c > 0 ? 'inset 0 0 0 1px var(--accent-strong)' : undefined,
                        }}
                        title={`${t('ml.cm.actual')} ${labels[ri]} · ${t('ml.cm.pred')} ${labels[ci]} → ${c}`}
                      >
                        {c}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="border-t px-4 py-2 text-[10px]" style={{ borderColor: 'var(--line)', color: 'var(--text-muted)' }}>
          {t('ml.cm.footer')}
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border" style={{ borderColor: 'var(--line)', background: 'var(--bg-elevated)' }}>
        <div
          className="flex items-center gap-2 border-b px-4 py-2.5"
          style={{ background: 'var(--bg-sunken)', borderColor: 'var(--line)' }}
        >
          <span className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--text-strong)' }}>{t('ml.cm.summaryTitle')}</span>
        </div>
        <div className="px-4 pb-4 pt-3">
          <p className="mb-3 text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{t('ml.cm.summaryIntro')}</p>
          <div className="rounded-lg border px-3" style={{ borderColor: 'var(--line)', background: 'var(--bg-sunken)' }}>
            {statRow(t('ml.cm.samplesTotal'), fmtInt(stats.total))}
            {statRow(t('ml.cm.correct'), fmtInt(stats.correct))}
            {statRow(t('ml.cm.errors'), fmtInt(stats.wrong), stats.wrong > 0 ? { color: 'var(--danger)' } : undefined)}
            {statRow(t('ml.cm.accFromCm'), fmtPct(stats.acc), { color: 'var(--accent-strong)' })}
          </div>
        </div>
      </div>
    </div>
  )
}

function MLPipeline() {
  const { t } = useLanguage()
  const [datasets, setDatasets] = useState([])
  const [models, setModels] = useState([])
  const [methods, setMethods] = useState([])
  const [selectedDataset, setSelectedDataset] = useState('')
  const [selectedModels, setSelectedModels] = useState([])
  const [modelParams, setModelParams] = useState({})
  const [selectedMethod, setSelectedMethod] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [results, setResults] = useState(null)
  const [resultContext, setResultContext] = useState(null)
  const [sampleAnalysis, setSampleAnalysis] = useState(null)
  const [evaluationMode, setEvaluationMode] = useState('holdout')
  const [classLabels, setClassLabels] = useState([])
  const [confusionMatrixFusion, setConfusionMatrixFusion] = useState(null)
  const [history, setHistory] = useState(readMLHistory)
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState(null)
  const [searchData, setSearchData] = useState(null)
  const [searchProgress, setSearchProgress] = useState(null)
  const [useCV, setUseCV] = useState(false)
  const [cvFolds, setCvFolds] = useState(5)
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
  const [exportLoading, setExportLoading] = useState(false)
  const [exportError, setExportError] = useState(null)
  const [exportedCode, setExportedCode] = useState('')
  const [exportFilename, setExportFilename] = useState('')
  const [exportDatasetKind, setExportDatasetKind] = useState('builtin')
  const [exportOpen, setExportOpen] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)

  const fileInputRef = useRef(null)
  const fusionResultsRef = useRef(null)
  const shouldScrollToFusionResultsRef = useRef(false)
  const fusionControlsRef = useRef(null)
  const shouldScrollToFusionControlsRef = useRef(false)
  const visibleDatasets = customDataset ? [...datasets, customDataset.dataset] : datasets

  const getDatasetLabel = (id) => visibleDatasets.find((d) => d.id === id)?.name || id
  const getMethodLabel = (id) => methods.find((m) => m.id === id)?.name || id
  const getModelLabel = (id) => models.find((m) => m.id === id)?.name || id

  const fmtPct = (v) => {
    if (v === null || v === undefined || Number.isNaN(Number(v))) return '-'
    return `${(Number(v) * 100).toFixed(2)}%`
  }

  const fmtDec = (v) => {
    if (v === null || v === undefined || Number.isNaN(Number(v))) return '-'
    return Number(v).toFixed(2)
  }

  const formatHistoryDate = (value) => {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ''
    return date.toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })
  }

  const persistHistory = (nextHistory) => {
    setHistory(nextHistory)
    if (typeof window === 'undefined') return
    localStorage.setItem(ML_HISTORY_KEY, JSON.stringify(nextHistory))
  }

  const saveExperiment = (data, payloadModels, context) => {
    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
      datasetId: selectedDataset,
      datasetName: context.datasetName,
      fusionMethod: selectedMethod,
      fusionMethodName: context.fusionMethodName,
      models: payloadModels.map((model) => ({
        ...model,
        name: getModelLabel(model.id),
      })),
      useCV,
      cvFolds,
      results: data.results,
      sampleAnalysis: data.sample_analysis ?? null,
      evaluationMode: data.evaluationMode || 'holdout',
      classLabels: data.classLabels || [],
      confusionMatrixFusion: data.confusionMatrixFusion ?? null,
    }
    persistHistory([entry, ...history].slice(0, ML_HISTORY_LIMIT))
  }

  const loadExperiment = (entry) => {
    const loadedModels = Array.isArray(entry.models) ? entry.models : []
    setSelectedDataset(entry.datasetId)
    setSelectedModels(loadedModels.map((model) => model.id))
    setModelParams(Object.fromEntries(loadedModels.map((model) => [model.id, model.params || {}])))
    setSelectedMethod(entry.fusionMethod)
    setUseCV(Boolean(entry.useCV))
    setCvFolds(entry.cvFolds || 5)
    setResults(entry.results || [])
    setSampleAnalysis(entry.sampleAnalysis ?? null)
    setEvaluationMode(entry.evaluationMode || 'holdout')
    setClassLabels(entry.classLabels || [])
    setConfusionMatrixFusion(entry.confusionMatrixFusion ?? null)
    setResultContext({
      datasetName: entry.datasetName || entry.datasetId,
      fusionMethodName: entry.fusionMethodName || entry.fusionMethod,
      modelNames: loadedModels.map((model) => model.name || model.id),
    })
    setError(null)
    setSearchError(null)
    setSearchData(null)
    resetExportState()
    shouldScrollToFusionResultsRef.current = true
  }

  const removeExperiment = (id) => {
    persistHistory(history.filter((entry) => entry.id !== id))
  }

  const getHistorySummary = (entry) => {
    const fusionRow = (entry.results || []).find((row) => row.kind === 'fusion')
    const accuracy = fusionRow ? fmtPct(fusionRow.accuracy) : t('ml.history.noResult')
    const modelCount = entry.models?.length || 0
    return `${accuracy} · ${modelCount} ${t('ml.history.models')}`
  }

  const loadDatasets = async (preferred = null) => {
    const res = await fetch('/api/ml/datasets')
    const data = await res.json()
    if (!res.ok) throw new Error(data.detail || 'Failed to load datasets')
    setDatasets(data.datasets)
    setSelectedDataset((cur) => {
      if (preferred && data.datasets.some((d) => d.id === preferred)) return preferred
      if (preferred && customDataset?.dataset.id === preferred) return preferred
      if (cur && data.datasets.some((d) => d.id === cur)) return cur
      if (cur && customDataset?.dataset.id === cur) return cur
      return data.datasets[0]?.id || ''
    })
  }

  useEffect(() => {
    loadDatasets().catch((err) => setError(err.message))
    fetch('/api/ml/models')
      .then(async (r) => {
        const d = await r.json()
        if (!r.ok) throw new Error(d.detail)
        return d
      })
      .then((d) => setModels(d.classifiers))
      .catch((e) => setError(e.message))
    fetch('/api/methods')
      .then(async (r) => {
        const d = await r.json()
        if (!r.ok) throw new Error(d.detail)
        return d
      })
      .then((d) => {
        setMethods(d.methods)
        if (d.methods.length) setSelectedMethod(d.methods[0].id)
      })
      .catch((e) => setError(e.message))
  }, [])

  useEffect(() => {
    if (!shouldScrollToFusionResultsRef.current || loading) return
    if (!results || !Array.isArray(results) || results.length === 0) return
    shouldScrollToFusionResultsRef.current = false
    const frame = requestAnimationFrame(() => {
      fusionResultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
    return () => cancelAnimationFrame(frame)
  }, [loading, results])

  useEffect(() => {
    if (!shouldScrollToFusionControlsRef.current) return
    shouldScrollToFusionControlsRef.current = false
    const frame = requestAnimationFrame(() => {
      fusionControlsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
    return () => cancelAnimationFrame(frame)
  }, [selectedModels, selectedMethod])

  const toggleModel = (id) => {
    setSelectedModels((prev) => {
      if (prev.includes(id)) {
        setModelParams((mp) => {
          const n = { ...mp }
          delete n[id]
          return n
        })
        return prev.filter((x) => x !== id)
      }
      const m = models.find((x) => x.id === id)
      const defaults = defaultsFromSchema(m?.param_schema)
      setModelParams((mp) => ({ ...mp, [id]: defaults }))
      return [...prev, id]
    })
  }

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setPendingFile(file)
    setSelectedFileName(file.name)
    setPreviewLoading(true)
    setUploadError(null)
    setUploadSummary(null)
    setDatasetPreview(null)
    const fd = new FormData()
    fd.append('file', file)
    try {
      const r = await fetch('/api/ml/datasets/preview', { method: 'POST', body: fd })
      const d = await r.json()
      if (!r.ok) throw new Error(d.detail || 'Preview failed')
      setDatasetPreview(d)
      setSelectedTargetColumn(d.suggestedTargetColumn)
      setSelectedFeatureColumns(d.columns.map((c) => c.name).filter((n) => n !== d.suggestedTargetColumn))
    } catch (e) {
      setUploadError(e.message)
      setPendingFile(null)
    } finally {
      setPreviewLoading(false)
      event.target.value = ''
    }
  }

  const handleTargetChange = (e) => {
    const col = e.target.value
    setSelectedTargetColumn(col)
    setSelectedFeatureColumns((datasetPreview?.columns || []).map((c) => c.name).filter((n) => n !== col))
  }

  const toggleFeatureColumn = (n) =>
    setSelectedFeatureColumns((p) => (p.includes(n) ? p.filter((x) => x !== n) : [...p, n]))

  const resetExportState = () => {
    setExportError(null)
    setExportedCode('')
    setExportFilename('')
    setExportDatasetKind('builtin')
    setExportOpen(false)
    setCopySuccess(false)
  }

  const importConfiguredDataset = async () => {
    if (!pendingFile || !datasetPreview) {
      setUploadError('Choose a CSV file first.')
      return
    }
    if (!selectedTargetColumn) {
      setUploadError('Select a target column.')
      return
    }
    if (!selectedFeatureColumns.length) {
      setUploadError('Select at least one feature column.')
      return
    }
    setUploading(true)
    setUploadError(null)
    const fd = new FormData()
    fd.append('file', pendingFile)
    fd.append('target_column', selectedTargetColumn)
    fd.append('feature_columns', JSON.stringify(selectedFeatureColumns))
    try {
      const r = await fetch('/api/ml/datasets/upload', { method: 'POST', body: fd })
      const d = await r.json()
      if (!r.ok) throw new Error(d.detail || 'Upload failed')
      setUploadSummary(d)
      setError(null)
      setCustomDataset({
        dataset: d.dataset,
        file: pendingFile,
        targetColumn: selectedTargetColumn,
        featureColumns: selectedFeatureColumns,
      })
      setSelectedDataset(d.dataset.id)
    } catch (e) {
      setUploadError(e.message)
    } finally {
      setUploading(false)
    }
  }

  const runFusion = async () => {
    if (selectedModels.length < 2) {
      setError(t('ml.err.models2'))
      return
    }
    setError(null)
    setResults(null)
    setResultContext(null)
    setSampleAnalysis(null)
    setClassLabels([])
    setConfusionMatrixFusion(null)
    resetExportState()
    setLoading(true)
    try {
      const payloadModels = selectedModels.map((id) => ({ id, params: modelParams[id] || {} }))
      const isCustom = customDataset?.dataset.id === selectedDataset
      let r
      if (isCustom) {
        const fd = new FormData()
        fd.append('file', customDataset.file)
        fd.append('target_column', customDataset.targetColumn)
        fd.append('feature_columns', JSON.stringify(customDataset.featureColumns))
        fd.append('models', JSON.stringify(payloadModels))
        fd.append('fusion_method', selectedMethod)
        fd.append('use_cross_validation', useCV ? 'true' : 'false')
        fd.append('cv_folds', String(cvFolds))
        r = await fetch('/api/ml/run-upload', { method: 'POST', body: fd })
      } else {
        r = await fetch('/api/ml/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            datasetId: selectedDataset,
            models: payloadModels,
            fusionMethod: selectedMethod,
            useCrossValidation: useCV,
            cvFolds,
          }),
        })
      }
      const d = await readJsonResponse(r, t('ml.err.generic'))
      if (!r.ok) throw new Error(responseErrorMessage(d, t('ml.err.generic')))
      const nextContext = {
        datasetName: getDatasetLabel(selectedDataset),
        fusionMethodName: getMethodLabel(selectedMethod),
        modelNames: selectedModels.map(getModelLabel),
      }
      shouldScrollToFusionResultsRef.current = true
      setResults(d.results)
      setResultContext(nextContext)
      setSampleAnalysis(d.sample_analysis ?? null)
      setEvaluationMode(d.evaluationMode || 'holdout')
      setClassLabels(d.classLabels || [])
      setConfusionMatrixFusion(d.confusionMatrixFusion ?? null)
      saveExperiment(d, payloadModels, nextContext)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const runSearch = async () => {
    if (selectedModels.length < 2) {
      setSearchError(t('ml.err.models2'))
      return
    }
    setSearchError(null)
    setSearchData(null)
    setError(null)
    setResults(null)
    setResultContext(null)
    setSampleAnalysis(null)
    setClassLabels([])
    setConfusionMatrixFusion(null)
    resetExportState()
    setSearchProgress({ phase: 'training' })
    setSearchLoading(true)
    try {
      const payloadModels = selectedModels.map((id) => ({ id, params: modelParams[id] || {} }))
      const isCustom = customDataset?.dataset.id === selectedDataset
      let r
      if (isCustom) {
        const fd = new FormData()
        fd.append('file', customDataset.file)
        fd.append('target_column', customDataset.targetColumn)
        fd.append('feature_columns', JSON.stringify(customDataset.featureColumns))
        fd.append('models', JSON.stringify(payloadModels))
        fd.append('use_cross_validation', useCV ? 'true' : 'false')
        fd.append('cv_folds', String(cvFolds))
        r = await fetch('/api/ml/search-upload-stream', { method: 'POST', body: fd })
      } else {
        r = await fetch('/api/ml/search-stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            datasetId: selectedDataset,
            models: payloadModels,
            useCrossValidation: useCV,
            cvFolds,
          }),
        })
      }
      if (!r.ok) {
        const text = await r.text()
        let msg = t('ml.err.generic')
        try {
          const d = JSON.parse(text)
          const detail = d.detail
          msg =
            typeof detail === 'string'
              ? detail
              : Array.isArray(detail)
                ? detail.map((x) => (typeof x === 'string' ? x : x?.msg || JSON.stringify(x))).join(' ')
                : msg
        } catch {
          if (text) msg = text
        }
        throw new Error(msg)
      }
      const reader = r.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let finalData = null
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''
        for (const line of lines) {
          if (!line.trim()) continue
          let obj
          try {
            obj = JSON.parse(line)
          } catch {
            continue
          }
          if (obj.type === 'phase') {
            setSearchProgress({ phase: obj.phase })
          }
          if (obj.type === 'progress') {
            setSearchProgress({
              phase: obj.phase || 'combinations',
              done: obj.done,
              total: obj.total,
            })
          }
          if (obj.type === 'complete') {
            finalData = obj.data
          }
          if (obj.type === 'error') {
            throw new Error(obj.detail || t('ml.search.err'))
          }
        }
      }
      if (buffer.trim()) {
        try {
          const obj = JSON.parse(buffer)
          if (obj.type === 'complete') finalData = obj.data
          if (obj.type === 'error') throw new Error(obj.detail || t('ml.search.err'))
        } catch (e) {
          if (e instanceof SyntaxError) {
            /* ignore truncated trailing chunk */
          } else {
            throw e
          }
        }
      }
      if (!finalData) throw new Error(t('ml.search.err'))
      setSearchData(finalData)
    } catch (e) {
      setSearchError(e.message)
    } finally {
      setSearchLoading(false)
      setSearchProgress(null)
    }
  }

  const applyBestSearch = () => {
    if (!searchData?.best) return
    const { model_ids: bestIds, fusion_method: bestMethod } = searchData.best
    shouldScrollToFusionControlsRef.current = true
    setSelectedModels(bestIds)
    setSelectedMethod(bestMethod)
    setModelParams((prev) => {
      const next = {}
      for (const id of bestIds) {
        if (prev[id]) next[id] = prev[id]
        else {
          const m = models.find((x) => x.id === id)
          next[id] = defaultsFromSchema(m?.param_schema)
        }
      }
      return next
    })
  }

  const exportCode = async () => {
    if (!results?.length || selectedModels.length < 2) return
    setExportLoading(true)
    setExportError(null)
    setCopySuccess(false)
    setExportOpen(true)
    try {
      const payloadModels = selectedModels.map((id) => ({ id, params: modelParams[id] || {} }))
      const isCustom = customDataset?.dataset.id === selectedDataset
      let r
      if (isCustom) {
        const fd = new FormData()
        fd.append('file', customDataset.file)
        fd.append('target_column', customDataset.targetColumn)
        fd.append('feature_columns', JSON.stringify(customDataset.featureColumns))
        fd.append('models', JSON.stringify(payloadModels))
        fd.append('fusion_method', selectedMethod)
        fd.append('use_cross_validation', useCV ? 'true' : 'false')
        fd.append('cv_folds', String(cvFolds))
        r = await fetch('/api/ml/export-code-upload', { method: 'POST', body: fd })
      } else {
        r = await fetch('/api/ml/export-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            datasetId: selectedDataset,
            models: payloadModels,
            fusionMethod: selectedMethod,
            useCrossValidation: useCV,
            cvFolds,
          }),
        })
      }
      const d = await readJsonResponse(r, t('ml.err.generic'))
      if (!r.ok) throw new Error(responseErrorMessage(d, t('ml.err.generic')))
      setExportedCode(d.code || '')
      setExportFilename(d.filename || '')
      setExportDatasetKind(d.datasetKind || (isCustom ? 'uploaded' : 'builtin'))
    } catch (e) {
      setExportError(e.message)
    } finally {
      setExportLoading(false)
    }
  }

  const copyExportCode = async () => {
    if (!exportedCode) return
    try {
      await navigator.clipboard.writeText(exportedCode)
      setCopySuccess(true)
    } catch {
      setExportError(t('ml.export.copyError'))
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="label" style={{ color: 'var(--accent)' }}>{t('ml.badge')}</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em]" style={{ color: 'var(--text-strong)' }}>{t('ml.title')}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-7" style={{ color: 'var(--text)' }}>{t('ml.intro')}</p>
      </div>

      <ExperimentHistoryPanel
        title={t('ml.history.title')}
        count={history.length}
        limit={ML_HISTORY_LIMIT}
        emptyText={t('ml.history.empty')}
        entries={history}
        loadLabel={t('ml.history.load')}
        deleteLabel={t('ml.history.delete')}
        onLoad={loadExperiment}
        onDelete={removeExperiment}
        getTitle={(entry) => entry.datasetName || entry.datasetId}
        getMeta={(entry) => `${formatHistoryDate(entry.createdAt)} · ${entry.fusionMethodName || entry.fusionMethod}`}
        getSummary={getHistorySummary}
      />

      <section className="border-t pt-6" style={{ borderColor: 'var(--line)' }}>
        <div className="flex items-center gap-2 mb-1">
          <span className="mono flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold" style={{ background: 'var(--accent-soft)', color: 'var(--accent-strong)' }}>1</span>
          <p className="label" style={{ margin: 0 }}>{t('ml.step1')}</p>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {visibleDatasets.map((ds) => {
            const active = selectedDataset === ds.id
            return (
              <button
                key={ds.id}
                type="button"
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
                    <span className="ml-1 text-xs" style={{ color: 'var(--text-muted)', fontWeight: 400 }}>{t('ml.uploaded')}</span>
                  )}
                </span>
              </button>
            )
          })}
        </div>

        <div className="mt-4 rounded-lg border p-4" style={{ borderColor: 'var(--line)', background: 'var(--bg-sunken)' }}>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-strong)' }}>{t('ml.upload.title')}</h3>
              <p className="mt-0.5 text-xs leading-5" style={{ color: 'var(--text-muted)' }}>{t('ml.upload.hint')}</p>
            </div>
            <div className="flex items-center gap-3">
              <input ref={fileInputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleFileChange} />
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={previewLoading || uploading} className="btn btn-secondary text-xs shrink-0">
                {previewLoading ? t('ml.upload.inspecting') : uploading ? t('ml.upload.importing') : t('ml.upload.choose')}
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

        {datasetPreview && (
          <div className="mt-4 rounded-lg border p-5" style={{ borderColor: 'var(--line)', background: 'var(--bg-elevated)' }}>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h4 className="text-sm font-semibold" style={{ color: 'var(--text-strong)' }}>{t('ml.mapping.title')}</h4>
                <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>{datasetPreview.totalRows} {t('ml.mapping.rows')}</p>
              </div>
              <div className="w-full lg:w-48">
                <label className="label mb-1 block">{t('ml.target')}</label>
                <select value={selectedTargetColumn} onChange={handleTargetChange} className="input">
                  {datasetPreview.columns.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
                </select>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-6">
              {datasetPreview.columns.map((col) => {
                const isTarget = col.name === selectedTargetColumn
                const isFeat = selectedFeatureColumns.includes(col.name)
                return (
                  <button
                    key={col.name}
                    type="button"
                    onClick={() => { if (!isTarget) toggleFeatureColumn(col.name) }}
                    className="option-chip justify-start text-xs"
                    data-active={isFeat}
                    style={isTarget ? { borderColor: 'var(--line-strong)', opacity: 0.6 } : {}}
                  >
                    <span className="font-medium" style={{ color: 'var(--text-strong)' }}>{col.name}</span>
                    <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      {isTarget ? t('ml.col.target') : isFeat ? t('ml.col.feature') : t('ml.col.off')}
                    </span>
                  </button>
                )
              })}
            </div>

            <div className="mt-4 overflow-x-auto rounded-lg border" style={{ borderColor: 'var(--line)' }}>
              <table className="min-w-full text-xs" style={{ background: 'var(--bg-elevated)' }}>
                <thead>
                  <tr>
                    {datasetPreview.columns.map((c) => (
                      <th key={c.name} className="border-b px-3 py-2 text-left font-semibold" style={{ borderColor: 'var(--line)', color: 'var(--text)' }}>{c.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {datasetPreview.sampleRows.map((row, ri) => (
                    <tr key={ri} className="border-t" style={{ borderColor: 'var(--line)' }}>
                      {datasetPreview.columns.map((c) => (
                        <td key={`${ri}-${c.name}`} className="px-3 py-1.5" style={{ color: 'var(--text)' }}>{row[c.name]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{selectedFeatureColumns.length} {t('ml.featuresSelected')}</p>
              <button type="button" onClick={importConfiguredDataset} disabled={uploading} className="btn btn-primary">
                {uploading ? t('ml.upload.importing') : t('ml.importBtn')}
              </button>
            </div>
          </div>
        )}
      </section>

      <section
        ref={fusionControlsRef}
        className="border-t pt-6 scroll-mt-24"
        style={{ borderColor: 'var(--line)' }}
        tabIndex={-1}
        aria-label={t('ml.step2')}
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="mono flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold" style={{ background: 'var(--accent-soft)', color: 'var(--accent-strong)' }}>2</span>
          <p className="label" style={{ margin: 0 }}>{t('ml.step2')}</p>
        </div>
        <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>{t('ml.models.hint')}</p>

        <div className="mt-3 flex flex-wrap gap-2">
          {models.map((m) => {
            const sel = selectedModels.includes(m.id)
            return (
              <button
                key={m.id}
                type="button"
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
            {selectedModels.length} {t('ml.models.selected')}
          </p>
        )}

        {selectedModels.length > 0 && (
          <div
            className="mt-4 max-w-xl space-y-3 rounded-lg border p-3"
            style={{ borderColor: 'var(--line)', background: 'var(--bg-sunken)' }}
          >
            <p className="text-xs font-semibold" style={{ color: 'var(--text-strong)' }}>{t('ml.params.title')}</p>
            {selectedModels.map((mid) => {
              const m = models.find((x) => x.id === mid)
              return (
                <div key={mid} className="border-t pt-3 first:border-t-0 first:pt-0" style={{ borderColor: 'var(--line)' }}>
                  <p className="mb-1.5 text-[11px] font-semibold leading-tight" style={{ color: 'var(--accent-strong)' }}>{m?.name || mid}</p>
                  <ModelParamFields
                    schema={m?.param_schema}
                    values={modelParams[mid] || {}}
                    onChange={(next) => setModelParams((p) => ({ ...p, [mid]: next }))}
                  />
                </div>
              )
            })}
          </div>
        )}
      </section>

      <section className="border-t pt-6" style={{ borderColor: 'var(--line)' }}>
        <div className="flex items-center gap-2 mb-1">
          <span className="mono flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold" style={{ background: 'var(--accent-soft)', color: 'var(--accent-strong)' }}>3</span>
          <p className="label" style={{ margin: 0 }}>{t('ml.step3')}</p>
        </div>
        <MethodSelector methods={methods} selected={selectedMethod} onChange={setSelectedMethod} context="ml" />
      </section>

      <section className="border-t pt-6" style={{ borderColor: 'var(--line)' }}>
        <div className="flex items-center gap-2 mb-1">
          <span className="mono flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold" style={{ background: 'var(--accent-soft)', color: 'var(--accent-strong)' }}>4</span>
          <p className="label" style={{ margin: 0 }}>{t('ml.step4.cv')}</p>
        </div>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="flex cursor-pointer items-center gap-2 text-sm" style={{ color: 'var(--text)' }}>
            <input type="checkbox" checked={useCV} onChange={(e) => setUseCV(e.target.checked)} className="rounded border" style={{ borderColor: 'var(--line-strong)' }} />
            {t('ml.cv.label')}
          </label>
          {useCV && (
            <label className="flex items-center gap-2 text-sm">
              <span style={{ color: 'var(--text-muted)' }}>{t('ml.cv.folds')}</span>
              <input
                type="number"
                min={2}
                max={15}
                value={cvFolds}
                onChange={(e) => setCvFolds(Math.max(2, Math.min(15, parseInt(e.target.value, 10) || 5)))}
                className="input w-20 py-1"
              />
            </label>
          )}
        </div>
      </section>

      <section className="border-t pt-6" style={{ borderColor: 'var(--line)' }}>
        <p className="mb-3 text-xs leading-relaxed max-w-2xl" style={{ color: 'var(--text-muted)' }}>{t('ml.search.hint')}</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <button type="button" onClick={runFusion} disabled={loading || searchLoading || selectedModels.length < 2} className="btn btn-primary">
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {t('ml.running')}
              </span>
            ) : t('ml.run')}
          </button>
          <button
            type="button"
            onClick={runSearch}
            disabled={loading || searchLoading || selectedModels.length < 2}
            className="btn btn-secondary"
          >
            {searchLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {t('ml.searching')}
              </span>
            ) : t('ml.searchBtn')}
          </button>
          {error && (
            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--danger)' }}>
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}
          {searchError && (
            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--danger)' }}>
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {searchError}
            </div>
          )}
        </div>
        {searchLoading && searchProgress && (
          <div
            className="mt-4 w-full max-w-lg rounded-lg border px-4 py-3"
            style={{ borderColor: 'var(--line)', background: 'var(--bg-sunken)' }}
          >
            {searchProgress.phase === 'training' && (
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{t('ml.search.phaseTraining')}</p>
            )}
            {searchProgress.phase === 'combinations' && searchProgress.total != null && (
              <>
                <p className="text-xs font-semibold" style={{ color: 'var(--text-strong)' }}>{t('ml.search.phaseCombinations')}</p>
                <p className="mt-1.5 text-xs mono tabular-nums" style={{ color: 'var(--text-muted)' }}>
                  {searchProgress.done} / {searchProgress.total}
                  {' · '}
                  {Math.max(0, searchProgress.total - searchProgress.done)} {t('ml.search.left')}
                </p>
                <progress
                  className="mt-2 h-2 w-full rounded overflow-hidden"
                  value={searchProgress.done}
                  max={Math.max(1, searchProgress.total)}
                  style={{ accentColor: 'var(--accent)' }}
                />
              </>
            )}
          </div>
        )}
      </section>

      {searchData && (
        <section className="result-enter border-t pt-8" style={{ borderColor: 'var(--line)' }}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-strong)' }}>{t('ml.search.title')}</h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {t('ml.search.evaluated')}: <span className="mono font-semibold" style={{ color: 'var(--text-strong)' }}>{searchData.total_combinations_evaluated}</span>
              {' · '}
              {t('ml.evalMode')}{' '}
              <strong style={{ color: 'var(--text-strong)' }}>
                {searchData.evaluationMode === 'cv_oof' ? t('ml.eval.cv') : t('ml.eval.holdout')}
              </strong>
            </p>
          </div>

          <div className="mt-4 rounded-xl border p-4" style={{ borderColor: 'var(--line)', background: 'var(--accent-soft)' }}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: 'var(--accent-strong)' }}>{t('ml.search.best')}</p>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('ml.search.models')}</p>
                <p className="mt-0.5 text-sm font-medium" style={{ color: 'var(--text-strong)' }}>
                  {searchData.best.model_ids.map((id) => models.find((m) => m.id === id)?.name || id).join(' + ')}
                </p>
                <p className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>{t('ml.search.method')}</p>
                <p className="mt-0.5 text-sm font-medium" style={{ color: 'var(--text-strong)' }}>
                  {methods.find((m) => m.id === searchData.best.fusion_method)?.name || searchData.best.fusion_method}
                </p>
              </div>
              <div className="flex flex-wrap items-end gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em]" style={{ color: 'var(--text-muted)' }}>{t('ml.table.acc')}</p>
                  <p className="mono text-xl font-bold" style={{ color: 'var(--accent-strong)' }}>{fmtPct(searchData.best.accuracy)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em]" style={{ color: 'var(--text-muted)' }}>{t('ml.table.f1')}</p>
                  <p className="mono text-xl font-bold" style={{ color: 'var(--text-strong)' }}>{fmtPct(searchData.best.f1_score)}</p>
                </div>
                <button type="button" onClick={applyBestSearch} className="btn btn-primary text-sm">
                  {t('ml.search.apply')}
                </button>
              </div>
            </div>
          </div>

          <h3 className="mt-6 text-xs font-semibold uppercase tracking-[0.1em]" style={{ color: 'var(--text-muted)' }}>{t('ml.search.top')}</h3>
          <div className="mt-2 overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--line)' }}>
            <table className="w-full min-w-[640px] text-sm" style={{ background: 'var(--bg-elevated)' }}>
              <thead>
                <tr style={{ color: 'var(--text-muted)', background: 'var(--bg-sunken)' }}>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.08em]">{t('ml.search.rank')}</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.08em]">{t('ml.search.models')}</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.08em]">{t('ml.search.method')}</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.08em]">{t('ml.table.acc')}</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.08em]">{t('ml.table.f1')}</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.08em]">{t('ml.table.auc')}</th>
                </tr>
              </thead>
              <tbody>
                {searchData.ranking.map((row, i) => (
                  <tr key={`${row.fusion_method}-${row.model_ids.join('+')}-${i}`} className="border-t" style={{ borderColor: 'var(--line)' }}>
                    <td className="px-3 py-2 mono text-xs" style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                    <td className="px-3 py-2 text-xs" style={{ color: 'var(--text-strong)' }}>
                      {row.model_ids.map((id) => models.find((m) => m.id === id)?.name || id).join(' + ')}
                    </td>
                    <td className="px-3 py-2 text-xs" style={{ color: 'var(--text)' }}>
                      {methods.find((m) => m.id === row.fusion_method)?.name || row.fusion_method}
                    </td>
                    <td className="px-3 py-2 mono text-xs">{fmtPct(row.accuracy)}</td>
                    <td className="px-3 py-2 mono text-xs">{fmtPct(row.f1_score)}</td>
                    <td className="px-3 py-2 mono text-xs">{fmtPct(row.roc_auc)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {Array.isArray(results) && results.length > 0 && (() => {
        const fusionRow = results.find((r) => r.kind === 'fusion')
        const individualRows = results.filter((r) => r.kind !== 'fusion')
        const bestIndividual = individualRows.reduce((best, r) => {
          const acc = Number(r.accuracy) || 0
          return acc > (Number(best?.accuracy) || 0) ? r : best
        }, individualRows[0])
        const fusionAcc = fusionRow ? Number(fusionRow.accuracy) || 0 : 0
        const bestAcc = bestIndividual ? Number(bestIndividual.accuracy) || 0 : 0
        const fusionWins = fusionAcc >= bestAcc

        return (
          <section
            ref={fusionResultsRef}
            className="result-enter scroll-mt-24"
            tabIndex={-1}
            aria-label={t('ml.result.badge')}
          >
            <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
              {t('ml.evalMode')}{' '}
              <strong style={{ color: 'var(--text-strong)' }}>
                {evaluationMode === 'cv_oof' ? t('ml.eval.cv') : t('ml.eval.holdout')}
              </strong>
            </p>

            <div className="overflow-hidden rounded-xl border mb-6" style={{ borderColor: 'var(--line)' }}>
              <div className="flex items-center gap-2 px-4 py-2.5" style={{ background: 'var(--accent-soft)', borderBottom: '1px solid var(--line)' }}>
                <svg className="h-4 w-4" style={{ color: 'var(--accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs font-bold tracking-wide uppercase" style={{ color: 'var(--accent-strong)' }}>{t('ml.result.badge')}</span>
              </div>
              <div className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em]" style={{ color: 'var(--text-muted)' }}>{t('ml.result.fusionAcc')}</p>
                  <span className="mono text-2xl font-bold tracking-tight" style={{ color: 'var(--accent-strong)' }}>{fmtPct(fusionRow?.accuracy)}</span>
                </div>
                <div className="sm:text-right">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em]" style={{ color: 'var(--text-muted)' }}>{t('ml.result.bestInd')}</p>
                  <p className="mono mt-1 text-base font-semibold" style={{ color: 'var(--text-strong)' }}>{fmtPct(bestIndividual?.accuracy)}</p>
                  <p className="text-xs mt-0.5" style={{ color: fusionWins ? 'var(--accent-strong)' : 'var(--text-muted)' }}>
                    {fusionWins ? t('ml.result.wins') : t('ml.result.loses')}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 mb-4">
              <p className="label">{t('ml.detail.title')}</p>
              <div className="flex items-center gap-3">
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {resultContext?.datasetName || getDatasetLabel(selectedDataset)} · {resultContext?.fusionMethodName || getMethodLabel(selectedMethod)}
                </p>
                <button type="button" onClick={exportCode} disabled={exportLoading || loading} className="btn btn-secondary text-xs">
                  {exportLoading ? t('ml.export.loading') : t('ml.export.button')}
                </button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--line)' }}>
              <table className="w-full text-sm" style={{ background: 'var(--bg-elevated)' }}>
                <thead>
                  <tr style={{ color: 'var(--text-muted)', background: 'var(--bg-sunken)' }}>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em]">{t('ml.table.model')}</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em]">{t('ml.table.acc')}</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em]">{t('ml.table.prec')}</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em]">{t('ml.table.rec')}</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em]">{t('ml.table.f1')}</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em]">{t('ml.table.auc')}</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em]">{t('ml.table.conf')}</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, idx) => {
                    const isFusion = r.kind === 'fusion'
                    const name = isFusion
                      ? `${t('ml.fusionRow')} (${methods.find((m) => m.id === r.fusion_method)?.name || r.fusion_method})`
                      : (models.find((m) => m.id === r.model_id)?.name || r.model_id)
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

            <ConfusionHeatmap matrix={confusionMatrixFusion} labels={classLabels} t={t} />

            {sampleAnalysis && (() => {
              const bestName = models.find((m) => m.id === sampleAnalysis.best_model_id)?.name || sampleAnalysis.best_model_id
              const stat = (label, value, hint) => (
                <div key={label} className="rounded-lg border px-3 py-2" style={{ borderColor: 'var(--line)', background: 'var(--bg-elevated)' }}>
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
                    <p className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>{t('ml.sample.empty')}</p>
                  ) : (
                    <>
                      <div className="mt-2 overflow-x-auto rounded-lg border" style={{ borderColor: 'var(--line)' }}>
                        <table className="w-full min-w-[640px] text-xs" style={{ background: 'var(--bg-elevated)' }}>
                          <thead>
                            <tr style={{ color: 'var(--text-muted)', background: 'var(--bg-sunken)' }}>
                              <th className="px-3 py-2 text-left font-semibold uppercase tracking-[0.08em]">{t('ml.sample.row')}</th>
                              <th className="px-3 py-2 text-left font-semibold uppercase tracking-[0.08em]">{t('ml.sample.tidx')}</th>
                              <th className="px-3 py-2 text-left font-semibold uppercase tracking-[0.08em]">{t('ml.sample.true')}</th>
                              <th className="px-3 py-2 text-left font-semibold uppercase tracking-[0.08em]">{t('ml.sample.fusion')}</th>
                              {selectedModels.map((mid) => (
                                <th key={mid} className="px-3 py-2 text-left font-semibold uppercase tracking-[0.08em]">
                                  {models.find((m) => m.id === mid)?.name || mid}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {rows.map((row, ri) => (
                              <tr key={`${row.test_index}-${row.original_row_index}-${ri}`} className="border-t" style={{ borderColor: 'var(--line)' }}>
                                <td className="px-3 py-2 mono" style={{ color: 'var(--text)' }}>{row.original_row_index}</td>
                                <td className="px-3 py-2 mono" style={{ color: 'var(--text)' }}>{row.test_index}</td>
                                <td className="px-3 py-2 mono" style={{ color: 'var(--text-strong)' }}>{row.y_true}</td>
                                <td className="px-3 py-2 mono font-semibold" style={{ color: borderAccent ? 'var(--accent-strong)' : 'var(--danger)' }}>{row.y_fused}</td>
                                {selectedModels.map((mid) => (
                                  <td key={mid} className="px-3 py-2 mono" style={{ color: 'var(--text)' }}>{row.predictions[mid] ?? '—'}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {truncated && total > rows.length && (
                        <p className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                          {t('ml.sample.showing')} {rows.length} {t('ml.sample.of')} {total} {t('ml.sample.samples')}
                        </p>
                      )}
                    </>
                  )}
                </div>
              )
              return (
                <div className="mt-8 overflow-hidden rounded-xl border" style={{ borderColor: 'var(--line)' }}>
                  <div className="flex items-center gap-2 px-4 py-2.5" style={{ background: 'var(--bg-sunken)', borderBottom: '1px solid var(--line)' }}>
                    <span className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--text-strong)' }}>{t('ml.sample.title')}</span>
                  </div>
                  <div className="space-y-2 p-4">
                    <p className="text-sm leading-6" style={{ color: 'var(--text-muted)' }}>
                      {t('ml.sample.intro')}{' '}
                      <span className="mono font-semibold" style={{ color: 'var(--text-strong)' }}>{sampleAnalysis.test_set_size}</span>
                      {' '}{t('ml.sample.baseline')}{' '}
                      <span className="font-semibold" style={{ color: 'var(--text-strong)' }}>{bestName}</span>.
                    </p>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                      {stat(t('ml.sample.gainBest'), sampleAnalysis.gain_vs_best, t('ml.sample.gainBestHint'))}
                      {stat(t('ml.sample.lossBest'), sampleAnalysis.loss_vs_best, t('ml.sample.lossBestHint'))}
                      {stat(t('ml.sample.bothOk'), sampleAnalysis.tie_correct_vs_best, t('ml.sample.bothOkHint'))}
                      {stat(t('ml.sample.bothBad'), sampleAnalysis.tie_wrong_vs_best, t('ml.sample.bothBadHint'))}
                      {stat(t('ml.sample.gainMaj'), sampleAnalysis.gain_vs_majority, t('ml.sample.gainMajHint'))}
                      {stat(t('ml.sample.lossMaj'), sampleAnalysis.loss_vs_majority, t('ml.sample.lossMajHint'))}
                      {stat(t('ml.sample.rescue'), sampleAnalysis.rescue_all_wrong, t('ml.sample.rescueHint'))}
                    </div>
                    {sampleTable(
                      `${t('ml.sample.gainsTitle')} (${bestName})`,
                      t('ml.sample.gainsSub'),
                      sampleAnalysis.gains_vs_best,
                      sampleAnalysis.gains_vs_best_total,
                      sampleAnalysis.gains_vs_best_truncated,
                      true,
                    )}
                    {sampleTable(
                      `${t('ml.sample.lossesTitle')} (${bestName})`,
                      t('ml.sample.lossesSub'),
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
      <CodeExportModal
        open={exportOpen}
        loading={exportLoading}
        error={exportError}
        code={exportedCode}
        filename={exportFilename}
        datasetKind={exportDatasetKind}
        copySuccess={copySuccess}
        onCopy={copyExportCode}
        onClose={() => {
          setExportOpen(false)
          setCopySuccess(false)
          setExportError(null)
        }}
        t={t}
      />
    </div>
  )
}

export default MLPipeline
