import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useLanguage } from '../contexts/LanguageContext'

function ResultCard({ result, methodId, methodName, darkMode, displayOrder }) {
  const { t } = useLanguage()
  const sortedMasses = (() => {
    const entries = Object.entries(result?.masses || {})
    if (!Array.isArray(displayOrder) || !displayOrder.length) return entries.sort((a, b) => b[1] - a[1])
    const byKey = new Map(entries)
    const ordered = displayOrder.filter(k => byKey.has(k)).map(k => [k, byKey.get(k)])
    const used = new Set(ordered.map(([k]) => k))
    return [...ordered, ...entries.filter(([k]) => !used.has(k)).sort((a, b) => b[1] - a[1])]
  })()

  const chartData = sortedMasses.map(([name, m]) => ({
    name: String(name).length > 24 ? `${String(name).slice(0, 22)}…` : String(name),
    fullName: String(name),
    massPct: Number(m) * 100,
  }))

  const winner = [...sortedMasses].sort((a, b) => b[1] - a[1])[0]
  const maxMass = Math.max(...sortedMasses.map(([, m]) => m), 0.01)
  const conflict = result.conflict !== null ? Number(result.conflict) : null
  const resolvedMethodName = methodName || (methodId === 'dempster' ? 'Dempster-Shafer' : methodId === 'pcr5' ? 'PCR5' : methodId === 'pcr6' ? 'PCR6' : '\u2014')

  const conflictLevel = conflict === null ? null : conflict < 0.2 ? 'low' : conflict < 0.5 ? 'moderate' : 'high'
  const conflictLabel = conflictLevel === 'low' ? t('result.conflict.low') : conflictLevel === 'moderate' ? t('result.conflict.mid') : t('result.conflict.high')

  const tickColor = darkMode ? 'oklch(78% 0.01 155)' : 'oklch(40% 0.02 85)'

  return (
    <div className="result-enter mt-8 space-y-6">
      <div className="overflow-hidden rounded-xl border" style={{ borderColor: 'var(--line)' }}>
        <div
          className="flex items-center justify-between gap-4 px-4 py-2.5"
          style={{ background: 'var(--accent-soft)', borderBottom: '1px solid var(--line)' }}
        >
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4" style={{ color: 'var(--accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs font-bold tracking-wide uppercase" style={{ color: 'var(--accent-strong)' }}>{t('result.badge')}</span>
          </div>
          <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{resolvedMethodName}</span>
        </div>

        {winner && (
          <div className="flex items-baseline justify-between gap-4 border-b px-4 py-4" style={{ borderColor: 'var(--line)' }}>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em]" style={{ color: 'var(--text-muted)' }}>{t('result.dominant')}</p>
              <p className="mt-0.5 text-sm font-semibold" style={{ color: 'var(--text-strong)' }}>{winner[0]}</p>
            </div>
            <div className="text-right">
              <span className="mono text-2xl font-bold tracking-tight" style={{ color: 'var(--accent-strong)' }}>
                {(winner[1] * 100).toFixed(1)}
              </span>
              <span className="mono text-sm font-semibold" style={{ color: 'var(--accent)' }}>%</span>
            </div>
          </div>
        )}

        <div className="px-4 py-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.1em]" style={{ color: 'var(--text-muted)' }}>{t('result.chart.title')}</p>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 16, top: 8, bottom: 8 }}>
                <XAxis type="number" domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fill: tickColor, fontSize: 11 }} />
                <YAxis type="category" dataKey="name" width={120} tick={{ fill: tickColor, fontSize: 11 }} />
                <Tooltip
                  formatter={(value, _n, props) => [`${Number(value).toFixed(1)}%`, props.payload?.fullName || 'mass']}
                  contentStyle={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--line)',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="massPct" fill="var(--accent)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-2.5 border-t px-4 py-3.5" style={{ borderColor: 'var(--line)' }}>
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

        <div
          className="flex items-center justify-between gap-4 border-t px-4 py-2.5"
          style={{ borderColor: 'var(--line)', background: 'var(--bg-sunken)' }}
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{t('result.conflict')}</span>
            {conflictLevel && (
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                style={{
                  background: conflictLevel === 'low' ? 'var(--accent-soft)' : conflictLevel === 'moderate' ? 'oklch(95% 0.04 85)' : 'oklch(94% 0.04 25)',
                  color: conflictLevel === 'low' ? 'var(--accent-strong)' : conflictLevel === 'moderate' ? 'oklch(45% 0.08 85)' : 'var(--danger)',
                }}
              >
                {conflictLabel}
              </span>
            )}
          </div>
          <span className="mono text-xs font-semibold" style={{ color: 'var(--text-strong)' }}>
            {conflict !== null ? conflict.toFixed(4) : t('common.na')}
          </span>
        </div>
      </div>
    </div>
  )
}

export default ResultCard
