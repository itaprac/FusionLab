function ExperimentHistoryPanel({
  title,
  count,
  limit,
  emptyText,
  entries,
  loadLabel,
  deleteLabel,
  onLoad,
  onDelete,
  getTitle,
  getMeta,
  getSummary,
}) {
  return (
    <section className="border-t pt-5" style={{ borderColor: 'var(--line)' }}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold" style={{ color: 'var(--text-strong)' }}>{title}</h2>
        <span className="mono text-[11px]" style={{ color: 'var(--text-muted)' }}>{count}/{limit}</span>
      </div>

      {entries.length === 0 ? (
        <p className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>{emptyText}</p>
      ) : (
        <div
          className="mt-3 max-h-56 overflow-y-auto rounded-lg border"
          style={{ borderColor: 'var(--line)', background: 'var(--bg-elevated)' }}
        >
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="grid gap-2 border-b px-3 py-2.5 last:border-b-0 sm:grid-cols-[minmax(0,1fr),auto] sm:items-center"
              style={{ borderColor: 'var(--line)' }}
            >
              <div className="min-w-0">
                <div className="flex min-w-0 items-center gap-2">
                  <p className="truncate text-xs font-semibold" style={{ color: 'var(--text-strong)' }}>
                    {getTitle(entry)}
                  </p>
                  <span className="hidden h-1 w-1 shrink-0 rounded-full sm:block" style={{ background: 'var(--line-strong)' }} />
                  <p className="hidden truncate text-[11px] sm:block" style={{ color: 'var(--text-muted)' }}>
                    {getMeta(entry)}
                  </p>
                </div>
                <p className="mt-1 truncate text-[11px] sm:hidden" style={{ color: 'var(--text-muted)' }}>
                  {getMeta(entry)}
                </p>
                <p className="mt-1 truncate text-[11px]" style={{ color: 'var(--text)' }}>
                  {getSummary(entry)}
                </p>
              </div>
              <div className="flex items-center gap-2 sm:justify-end">
                <button
                  type="button"
                  onClick={() => onLoad(entry)}
                  className="rounded-md px-2 py-1 text-xs font-semibold transition-colors"
                  style={{ color: 'var(--accent-strong)', background: 'var(--accent-soft)' }}
                >
                  {loadLabel}
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(entry.id)}
                  className="rounded-md px-2 py-1 text-xs font-semibold transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                  title={deleteLabel}
                  aria-label={deleteLabel}
                >
                  &times;
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export default ExperimentHistoryPanel
