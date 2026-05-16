import { useMemo } from 'react'
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useLanguage } from '../contexts/LanguageContext'

function splitProposition(raw) {
  const value = String(raw ?? '')
  if (value === 'empty') {
    return { kind: 'empty', display: '∅', detailKey: 'result.proposition.empty', full: '∅', parts: ['∅'], operator: null }
  }
  const unionParts = value.split('|').map(part => part.trim()).filter(Boolean)
  if (unionParts.length > 1) {
    return {
      kind: 'union',
      display: unionParts.join(' ∪ '),
      detailKey: 'result.proposition.union',
      full: unionParts.join(' ∪ '),
      parts: unionParts,
      operator: '∪',
    }
  }
  const intersectionParts = value.split('&').map(part => part.trim()).filter(Boolean)
  if (intersectionParts.length > 1) {
    return {
      kind: 'intersection',
      display: intersectionParts.join(' ∩ '),
      detailKey: 'result.proposition.intersection',
      full: intersectionParts.join(' ∩ '),
      parts: intersectionParts,
      operator: '∩',
    }
  }
  return { kind: 'singleton', display: value, detailKey: 'result.proposition.singleton', full: value, parts: [value], operator: null }
}

function wrapAxisText(value, maxChars = 28) {
  const parsed = splitProposition(value)
  if (parsed.kind === 'empty') return ['∅']

  const out = []
  parsed.parts.forEach((part, idx) => {
    const words = part.split(/\s+/).filter(Boolean)
    let line = idx > 0 && parsed.operator ? `${parsed.operator} ` : ''
    words.forEach(word => {
      const next = line ? `${line} ${word}` : word
      if (next.length > maxChars && line.trim()) {
        out.push(line)
        line = word
      } else {
        line = next
      }
    })
    if (line.trim()) out.push(line)
  })
  return out.length ? out : [parsed.display]
}

function AxisTick({ x, y, payload, tickColor }) {
  const lines = wrapAxisText(payload.value)
  const startY = y - ((lines.length - 1) * 6)
  return (
    <g transform={`translate(${x},${startY})`}>
      {lines.map((line, index) => (
        <text
          key={`${line}-${index}`}
          x={0}
          y={index * 13}
          textAnchor="end"
          dominantBaseline="central"
          fill={tickColor}
          fontSize={11}
        >
          {line}
        </text>
      ))}
    </g>
  )
}

function PropositionLabel({ value, compact = false }) {
  const { t } = useLanguage()
  const parsed = splitProposition(value)
  const isEmpty = parsed.kind === 'empty'
  const isCompound = parsed.parts.length > 1
  return (
    <span className={`inline-flex min-w-0 ${compact ? 'items-center gap-1.5' : 'flex-col gap-1'}`}>
      {isCompound ? (
        <span className="inline-flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 leading-snug">
          {parsed.parts.map((part, idx) => (
            <span key={`${part}-${idx}`} className="inline-flex min-w-0 items-center gap-2">
              {idx > 0 && (
                <span
                  className="inline-flex items-center justify-center text-base font-bold leading-none"
                  style={{ color: 'var(--accent-strong)', transform: 'translateY(-0.08em)' }}
                >
                  {parsed.operator}
                </span>
              )}
              <span className="break-words">{part}</span>
            </span>
          ))}
        </span>
      ) : (
        <span
          className={isEmpty ? 'inline-flex items-center text-base font-bold' : 'break-words'}
          style={isEmpty ? { color: 'var(--danger)' } : undefined}
        >
          {parsed.display}
        </span>
      )}
      {!compact && (
        <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
          {t(parsed.detailKey)}
        </span>
      )}
    </span>
  )
}

function parseSourceMasses(source) {
  if (!source || !Array.isArray(source.hypotheses)) return {}
  const out = {}
  for (const h of source.hypotheses) {
    if (!h?.name) continue
    const m = typeof h.mass === 'number' ? h.mass : parseFloat(h.mass)
    if (!Number.isFinite(m) || m <= 0) continue
    out[h.name] = (out[h.name] || 0) + m
  }
  return out
}

function pairwiseConflict(massesA, massesB) {
  let k = 0
  for (const [hA, mA] of Object.entries(massesA)) {
    for (const [hB, mB] of Object.entries(massesB)) {
      if (hA !== hB) k += mA * mB
    }
  }
  return Math.max(0, Math.min(1, k))
}

function levelFor(value) {
  if (!Number.isFinite(value)) return null
  if (value < 0.2) return 'low'
  if (value < 0.5) return 'moderate'
  return 'high'
}

const LEVEL_STYLES = {
  low: {
    chipBg: 'var(--accent-soft)',
    chipFg: 'var(--accent-strong)',
    barFg: 'var(--accent)',
  },
  moderate: {
    chipBg: 'oklch(95% 0.04 85)',
    chipFg: 'oklch(45% 0.08 85)',
    barFg: 'oklch(60% 0.13 85)',
  },
  high: {
    chipBg: 'oklch(94% 0.04 25)',
    chipFg: 'var(--danger)',
    barFg: 'var(--danger)',
  },
}

function ResultCard({ result, methodId, methodName, darkMode, displayOrder, conflictSources }) {
  const { t } = useLanguage()
  const sortedMasses = (() => {
    const entries = Object.entries(result?.masses || {})
    if (!Array.isArray(displayOrder) || !displayOrder.length) return entries.sort((a, b) => b[1] - a[1])
    const byKey = new Map(entries)
    const ordered = displayOrder.filter(k => byKey.has(k)).map(k => [k, byKey.get(k)])
    const used = new Set(ordered.map(([k]) => k))
    return [...ordered, ...entries.filter(([k]) => !used.has(k)).sort((a, b) => b[1] - a[1])]
  })()

  const chartData = sortedMasses.map(([name, m]) => {
    const parsed = splitProposition(name)
    return {
      name: parsed.display,
      fullName: parsed.full,
      kind: parsed.kind,
      massPct: Number(m) * 100,
    }
  })
  const chartHeight = Math.max(224, chartData.reduce((sum, item) => sum + Math.max(32, wrapAxisText(item.name).length * 16), 56))

  const winner = [...sortedMasses].sort((a, b) => b[1] - a[1])[0]
  const conflict = result.conflict !== null && result.conflict !== undefined && !Number.isNaN(Number(result.conflict))
    ? Number(result.conflict)
    : null
  const resolvedMethodName = methodName || (methodId === 'dempster' ? 'Dempster-Shafer' : methodId === 'pcr5' ? 'PCR5' : methodId === 'pcr6' ? 'PCR6' : '\u2014')

  const conflictLevel = conflict === null ? null : conflict < 0.2 ? 'low' : conflict < 0.5 ? 'moderate' : 'high'
  const conflictLabel = conflictLevel === 'low' ? t('result.conflict.low') : conflictLevel === 'moderate' ? t('result.conflict.mid') : t('result.conflict.high')

  const tickColor = darkMode ? 'oklch(78% 0.01 155)' : 'oklch(40% 0.02 85)'

  const conflictPairs = useMemo(() => {
    if (!Array.isArray(conflictSources) || conflictSources.length < 2) return []
    const parsed = conflictSources.map((s, idx) => ({
      idx,
      name: s?.name || `${t('conflict.panel.source')} ${idx + 1}`,
      masses: parseSourceMasses(s),
    }))
    const out = []
    for (let i = 0; i < parsed.length - 1; i++) {
      for (let j = i + 1; j < parsed.length; j++) {
        const a = parsed[i]
        const b = parsed[j]
        const hasMass = Object.keys(a.masses).length > 0 && Object.keys(b.masses).length > 0
        const value = hasMass ? pairwiseConflict(a.masses, b.masses) : null
        out.push({
          key: `${a.idx}-${b.idx}`,
          a: a.name,
          b: b.name,
          value,
          level: value === null ? null : levelFor(value),
        })
      }
    }
    return out
  }, [conflictSources, t])

  const showPairs = conflictPairs.length > 0

  const pairLevelLabel = (lvl) =>
    lvl === 'low'
      ? t('result.conflict.low')
      : lvl === 'moderate'
      ? t('result.conflict.mid')
      : lvl === 'high'
      ? t('result.conflict.high')
      : t('common.na')

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
          <div className="flex flex-col gap-3 border-b px-4 py-4 sm:flex-row sm:items-start sm:justify-between" style={{ borderColor: 'var(--line)' }}>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em]" style={{ color: 'var(--text-muted)' }}>{t('result.dominant')}</p>
              <p className="mt-1 text-sm font-semibold" style={{ color: 'var(--text-strong)' }}>
                <PropositionLabel value={winner[0]} />
              </p>
            </div>
            <div className="shrink-0 text-left sm:text-right">
              <span className="mono text-2xl font-bold tracking-tight" style={{ color: 'var(--accent-strong)' }}>
                {(winner[1] * 100).toFixed(1)}
              </span>
              <span className="mono text-sm font-semibold" style={{ color: 'var(--accent)' }}>%</span>
            </div>
          </div>
        )}

        <div className="px-4 py-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.1em]" style={{ color: 'var(--text-muted)' }}>{t('result.chart.title')}</p>
          <div className="w-full" style={{ height: chartHeight }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 16, top: 8, bottom: 8 }}>
                <XAxis type="number" domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fill: tickColor, fontSize: 11 }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={220}
                  interval={0}
                  tick={(props) => <AxisTick {...props} tickColor={tickColor} />}
                />
                <Tooltip
                  formatter={(value, _n, props) => [`${Number(value).toFixed(1)}%`, props.payload?.fullName || 'mass']}
                  contentStyle={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--line)',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="massPct" radius={[0, 4, 4, 0]}>
                  {chartData.map((entry, idx) => (
                    <Cell
                      key={`${entry.fullName}-${idx}`}
                      fill={entry.kind === 'empty' ? 'var(--danger)' : entry.kind === 'union' ? 'oklch(58% 0.12 170)' : 'var(--accent)'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          {sortedMasses.some(([name]) => splitProposition(name).kind === 'empty') && (
            <p className="mt-3 text-xs leading-5" style={{ color: 'var(--text-muted)' }}>
              <span className="font-semibold" style={{ color: 'var(--danger)' }}>∅</span>{' '}
              {t('result.empty.explain')}
            </p>
          )}
        </div>

        {showPairs && (
          <div className="border-t px-4 py-4" style={{ borderColor: 'var(--line)' }}>
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.1em]" style={{ color: 'var(--text-muted)' }}>
                {t('conflict.panel.title')}
              </p>
              <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                {conflictPairs.length} {conflictPairs.length === 1 ? t('conflict.panel.pairOne') : t('conflict.panel.pairMany')}
              </span>
            </div>
            <p className="mb-3 text-xs leading-5" style={{ color: 'var(--text-muted)' }}>
              {t('conflict.panel.subtitle')}
            </p>
            <div className="space-y-3">
              {conflictPairs.map(({ key, a, b, value, level }) => {
                const styles = level ? LEVEL_STYLES[level] : null
                const pct = value === null ? 0 : Math.max(2, value * 100)
                return (
                  <div key={key}>
                    <div className="mb-1 flex items-center justify-between gap-3">
                      <span className="truncate text-sm" style={{ color: 'var(--text-strong)' }}>
                        <span className="truncate">{a}</span>
                        <span className="mx-1.5" style={{ color: 'var(--text-muted)' }}>↔</span>
                        <span className="truncate">{b}</span>
                      </span>
                      <div className="flex shrink-0 items-center gap-2">
                        {level && (
                          <span
                            className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                            style={{ background: styles.chipBg, color: styles.chipFg }}
                          >
                            {pairLevelLabel(level)}
                          </span>
                        )}
                        <span className="mono text-xs font-semibold tabular-nums" style={{ color: 'var(--text-strong)' }}>
                          {value === null ? t('common.na') : value.toFixed(4)}
                        </span>
                      </div>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: 'var(--bg-sunken)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-700 ease-out"
                        style={{
                          width: `${pct}%`,
                          background: styles ? styles.barFg : 'var(--line-strong)',
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {!showPairs && (
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
        )}
      </div>
    </div>
  )
}

export default ResultCard
