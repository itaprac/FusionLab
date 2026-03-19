function ResultCard({ result, methodId, methodName, darkMode, displayOrder }) {
  const sortedMasses = (() => {
    const entries = Object.entries(result?.masses || {})

    if (!Array.isArray(displayOrder) || displayOrder.length === 0) {
      return entries.sort((a, b) => b[1] - a[1])
    }

    const byKey = new Map(entries)
    const ordered = []
    for (const key of displayOrder) {
      if (byKey.has(key)) ordered.push([key, byKey.get(key)])
    }

    const used = new Set(ordered.map(([k]) => k))
    const rest = entries
      .filter(([k]) => !used.has(k))
      .sort((a, b) => b[1] - a[1])

    return [...ordered, ...rest]
  })()

  return (
    <div className={`rounded-xl border p-6 ${
      darkMode
        ? 'bg-gray-900 border-gray-800'
        : 'bg-white border-gray-200 shadow-sm'
    }`}>
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          darkMode ? 'bg-gray-800' : 'bg-gray-100'
        }`}>
          <svg className={`w-5 h-5 ${darkMode ? 'text-teal-400' : 'text-teal-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          Fusion Result
        </h2>
      </div>

      <div className="space-y-3 mb-6">
        {sortedMasses.map(([hypothesis, mass], idx) => (
          <div key={hypothesis} className="flex items-start gap-4">
            <span className={`font-semibold w-44 leading-snug break-words ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {hypothesis}
            </span>
            <div className={`flex-1 rounded-full h-4 overflow-hidden mt-1 ${
              darkMode ? 'bg-gray-800' : 'bg-gray-100'
            }`}>
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  darkMode ? 'bg-teal-500' : 'bg-teal-500'
                }`}
                style={{ width: `${mass * 100}%` }}
              />
            </div>
            <span className={`font-medium w-16 text-right mt-0.5 ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {(mass * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>

      <div className={`pt-4 border-t flex items-center justify-between ${
        darkMode ? 'border-gray-800' : 'border-gray-200'
      }`}>
        <div>
          <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Method: </span>
          <span className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            {methodName || (methodId === 'dempster' ? 'Dempster-Shafer' : methodId === 'pcr5' ? 'PCR5' : methodId === 'pcr6' ? 'PCR6' : '—')}
          </span>
        </div>
        <div className="text-right">
          <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Conflict: </span>
          <span className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            {result.conflict !== null ? `${Number(result.conflict).toFixed(2)}` : 'N/A'}
          </span>
          {result.conflict === null && (
            <p className={`text-xs mt-0.5 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              {methodId === 'pcr5' || methodId === 'pcr6'
                ? 'PCR redistributes conflict'
                : 'Multiple sources'}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default ResultCard
