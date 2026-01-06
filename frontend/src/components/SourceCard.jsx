function SourceCard({
  source,
  index,
  canRemove,
  onRemove,
  onUpdateName,
  onAddHypothesis,
  onRemoveHypothesis,
  onUpdateHypothesis,
  darkMode
}) {
  const totalMass = source.hypotheses.reduce((sum, h) => {
    const mass = parseFloat(h.mass) || 0
    return sum + mass
  }, 0)

  const isOverLimit = totalMass > 1

  return (
    <div className={`rounded-lg border p-5 ${
      darkMode
        ? 'bg-gray-700 border-gray-600'
        : 'bg-white border-gray-200 shadow-sm'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className={`text-xs font-semibold uppercase tracking-wide px-2 py-1 rounded ${
            darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-600'
          }`}>
            Source {index}
          </span>
          <input
            type="text"
            value={source.name}
            onChange={(e) => onUpdateName(e.target.value)}
            className={`text-base font-medium bg-transparent border-b-2 border-transparent hover:border-gray-400 focus:border-blue-500 focus:outline-none px-1 py-0.5 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}
          />
        </div>
        {canRemove && (
          <button
            onClick={onRemove}
            className={`transition-colors ${
              darkMode
                ? 'text-gray-400 hover:text-red-400'
                : 'text-gray-400 hover:text-red-500'
            }`}
            title="Remove source"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>

      <div className="space-y-2">
        <div className={`flex gap-3 text-xs font-semibold uppercase tracking-wide px-1 ${
          darkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          <span className="flex-1">Hypothesis</span>
          <span className="w-28">Mass</span>
          <span className="w-6"></span>
        </div>
        {source.hypotheses.map((hypothesis, idx) => (
          <div key={idx} className="flex gap-3 items-center">
            <input
              type="text"
              placeholder="e.g., A"
              value={hypothesis.name}
              onChange={(e) => onUpdateHypothesis(idx, { name: e.target.value })}
              className={`flex-1 p-2.5 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium ${
                darkMode
                  ? 'bg-gray-800 border-gray-500 text-white placeholder-gray-500'
                  : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
              }`}
            />
            <input
              type="number"
              placeholder="0.0 - 1.0"
              value={hypothesis.mass}
              onChange={(e) => onUpdateHypothesis(idx, { mass: e.target.value })}
              step="0.1"
              min="0"
              max="1"
              className={`w-28 p-2.5 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium ${
                darkMode
                  ? 'bg-gray-800 border-gray-500 text-white placeholder-gray-500'
                  : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
              }`}
            />
            <button
              onClick={() => onRemoveHypothesis(idx)}
              disabled={source.hypotheses.length <= 1}
              className={`w-6 disabled:opacity-0 disabled:cursor-default transition-colors text-xl leading-none font-bold ${
                darkMode
                  ? 'text-gray-500 hover:text-red-400'
                  : 'text-gray-400 hover:text-red-500'
              }`}
            >
              &times;
            </button>
          </div>
        ))}
      </div>

      <div className={`mt-4 flex items-center justify-between pt-3 border-t ${
        darkMode ? 'border-gray-600' : 'border-gray-200'
      }`}>
        <button
          onClick={onAddHypothesis}
          className="text-blue-500 hover:text-blue-400 text-sm font-semibold flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Hypothesis
        </button>
        <div className={`text-sm font-semibold px-3 py-1 rounded-full ${
          isOverLimit
            ? 'bg-red-500/20 text-red-500'
            : darkMode
              ? 'bg-gray-600 text-gray-200'
              : 'bg-gray-100 text-gray-700'
        }`}>
          Total: {totalMass.toFixed(2)}
          {isOverLimit && ' (exceeds 1.0)'}
        </div>
      </div>
    </div>
  )
}

export default SourceCard
