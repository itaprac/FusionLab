const PYTHON_KEYWORDS = new Set([
  'and', 'as', 'class', 'def', 'elif', 'else', 'except', 'False', 'for', 'from',
  'if', 'import', 'in', 'None', 'not', 'or', 'raise', 'return', 'True', 'try',
  'while',
])

function highlightLine(line, lineIndex) {
  const regex = /#.*$|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\b\d+(?:\.\d+)?\b|\b[A-Za-z_][A-Za-z0-9_]*\b/g
  const tokens = []
  let lastIndex = 0
  let match
  let tokenIndex = 0

  while ((match = regex.exec(line)) !== null) {
    const [value] = match
    const start = match.index
    if (start > lastIndex) {
      tokens.push(
        <span key={`plain-${lineIndex}-${tokenIndex++}`}>{line.slice(lastIndex, start)}</span>,
      )
    }

    let color = 'var(--text-strong)'
    if (value.startsWith('#')) color = '#6b7280'
    else if (value.startsWith('"') || value.startsWith('\'')) color = '#7dd3fc'
    else if (/^\d/.test(value)) color = '#f9a8d4'
    else if (PYTHON_KEYWORDS.has(value)) color = '#fbbf24'
    else if (/^[A-Z_]{2,}$/.test(value)) color = '#c4b5fd'
    else if (value.includes('fusion') || value.includes('BeliefMass')) color = '#86efac'
    else color = '#cbd5e1'

    tokens.push(
      <span key={`tok-${lineIndex}-${tokenIndex++}`} style={{ color }}>
        {value}
      </span>,
    )
    lastIndex = start + value.length
  }

  if (lastIndex < line.length) {
    tokens.push(<span key={`tail-${lineIndex}`}>{line.slice(lastIndex)}</span>)
  }

  return tokens
}

function CodeExportModal({
  open,
  loading,
  error,
  code,
  filename,
  datasetKind,
  copySuccess,
  onCopy,
  onClose,
  t,
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
      <div
        className="max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-2xl border shadow-2xl"
        style={{ borderColor: 'var(--line)', background: 'var(--bg-elevated)' }}
      >
        <div
          className="flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-start sm:justify-between"
          style={{ borderColor: 'var(--line)', background: 'var(--bg-sunken)' }}
        >
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-strong)' }}>{t('ml.export.title')}</p>
            <p className="mt-1 text-xs leading-5" style={{ color: 'var(--text-muted)' }}>
              {datasetKind === 'uploaded' ? t('ml.export.csvHint') : t('ml.export.readyHint')}
            </p>
            {filename && <p className="mt-1 mono text-[11px]" style={{ color: 'var(--accent-strong)' }}>{filename}</p>}
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={onCopy} disabled={!code || loading} className="btn btn-secondary text-xs">
              {copySuccess ? t('ml.export.copied') : t('ml.export.copy')}
            </button>
            <button type="button" onClick={onClose} className="btn btn-primary text-xs">
              {t('ml.export.close')}
            </button>
          </div>
        </div>

        <div className="max-h-[calc(90vh-6rem)] overflow-auto">
          {loading && (
            <div className="px-5 py-6 text-sm" style={{ color: 'var(--text-muted)' }}>
              {t('ml.export.loading')}
            </div>
          )}
          {!loading && error && (
            <div className="px-5 py-6 text-sm" style={{ color: 'var(--danger)' }}>
              {t('ml.export.error')}: {error}
            </div>
          )}
          {!loading && !error && code && (
            <pre
              className="overflow-x-auto px-5 py-5 text-[13px] leading-6"
              style={{
                background: 'linear-gradient(180deg, #08111d 0%, #0f172a 100%)',
                color: '#e2e8f0',
              }}
            >
              <code>
                {code.split('\n').map((line, index) => (
                  <div key={`line-${index}`} className="whitespace-pre">
                    {highlightLine(line, index)}
                  </div>
                ))}
              </code>
            </pre>
          )}
        </div>
      </div>
    </div>
  )
}

export default CodeExportModal
