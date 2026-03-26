function ResultCard({ result, methodId, methodName, darkMode, displayOrder }) {
  const sortedMasses = (() => {
    const entries = Object.entries(result?.masses || {})
    if (!Array.isArray(displayOrder) || !displayOrder.length) return entries.sort((a, b) => b[1] - a[1])
    const byKey = new Map(entries)
    const ordered = displayOrder.filter(k => byKey.has(k)).map(k => [k, byKey.get(k)])
    const used = new Set(ordered.map(([k]) => k))
    return [...ordered, ...entries.filter(([k]) => !used.has(k)).sort((a, b) => b[1] - a[1])]
  })()

  const winner = [...sortedMasses].sort((a, b) => b[1] - a[1])[0]
  const maxMass = Math.max(...sortedMasses.map(([, m]) => m), 0.01)
  const conflict = result.conflict !== null ? Number(result.conflict) : null
  const resolvedMethodName = methodName || (methodId === 'dempster' ? 'Dempster-Shafer' : methodId === 'pcr5' ? 'PCR5' : methodId === 'pcr6' ? 'PCR6' : '\u2014')

  const conflictLevel = conflict === null ? null : conflict < 0.2 ? 'low' : conflict < 0.5 ? 'moderate' : 'high'

  return (
    <div className="result-enter mt-8 overflow-hidden rounded-xl border" style={{ borderColor: 'var(--line)' }}>
      <div
        className="flex items-center justify-between gap-4 px-4 py-2.5"
        style={{ background: 'var(--accent-soft)', borderBottom: '1px solid var(--line)' }}
      >
        <div className="flex items-center gap-2">
          <svg className="h-4 w-4" style={{ color: 'var(--accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-xs font-bold tracking-wide uppercase" style={{ color: 'var(--accent-strong)' }}>Fusion Result</span>
        </div>
        <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{resolvedMethodName}</span>
      </div>

      {winner && (
        <div className="flex items-baseline justify-between gap-4 border-b px-4 py-4" style={{ borderColor: 'var(--line)' }}>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em]" style={{ color: 'var(--text-muted)' }}>
              Dominant hypothesis
            </p>
            <p className="mt-0.5 text-sm font-semibold" style={{ color: 'var(--text-strong)' }}>
              {winner[0]}
            </p>
          </div>
          <div className="text-right">
            <span className="mono text-2xl font-bold tracking-tight" style={{ color: 'var(--accent-strong)' }}>
              {(winner[1] * 100).toFixed(1)}
            </span>
            <span className="mono text-sm font-semibold" style={{ color: 'var(--accent)' }}>%</span>
          </div>
        </div>
      )}

      <div className="px-4 py-3.5">
        <div className="space-y-2.5">
          {sortedMasses.map(([hypothesis, mass]) => {
            const isWinner = winner && hypothesis === winner[0]
            return (
              <div key={hypothesis}>
                <div className="flex items-center justify-between gap-3 mb-0.5">
                  <span
                    className="truncate text-sm"
                    style={{ color: isWinner ? 'var(--accent-strong)' : 'var(--text-strong)', fontWeight: isWinner ? 600 : 400 }}
                  >
                    {hypothesis}
                  </span>
                  <span
                    className="mono shrink-0 text-xs tabular-nums"
                    style={{ color: isWinner ? 'var(--accent-strong)' : 'var(--text-muted)', fontWeight: isWinner ? 600 : 400 }}
                  >
                    {(mass * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: 'var(--bg-sunken)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${(mass / maxMass) * 100}%`,
                      background: isWinner ? 'var(--accent)' : 'var(--line-strong)',
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div
        className="flex items-center justify-between gap-4 border-t px-4 py-2.5"
        style={{ borderColor: 'var(--line)', background: 'var(--bg-sunken)' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Conflict</span>
          {conflictLevel && (
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
              style={{
                background: conflictLevel === 'low' ? 'var(--accent-soft)' : conflictLevel === 'moderate' ? 'oklch(95% 0.04 85)' : 'oklch(94% 0.04 25)',
                color: conflictLevel === 'low' ? 'var(--accent-strong)' : conflictLevel === 'moderate' ? 'oklch(45% 0.08 85)' : 'var(--danger)',
              }}
            >
              {conflictLevel}
            </span>
          )}
        </div>
        <span className="mono text-xs font-semibold" style={{ color: 'var(--text-strong)' }}>
          {conflict !== null ? conflict.toFixed(4) : 'N/A'}
        </span>
      </div>
    </div>
  )
}

export default ResultCard
