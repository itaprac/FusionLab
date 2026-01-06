function ResultCard({ result, method, darkMode }) {
  const sortedMasses = Object.entries(result.masses).sort((a, b) => b[1] - a[1])

  return (
    <div className={`rounded-lg border p-6 ${
      darkMode
        ? 'bg-gray-700 border-gray-600'
        : 'bg-white border-gray-200 shadow-sm'
    }`}>
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          darkMode ? 'bg-gray-600' : 'bg-gray-100'
        }`}>
          <svg className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          Fusion Result
        </h2>
      </div>

      <div className="space-y-3 mb-6">
        {sortedMasses.map(([hypothesis, mass], idx) => (
          <div key={hypothesis} className="flex items-center gap-4">
            <span className={`font-semibold w-16 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {hypothesis}
            </span>
            <div className={`flex-1 rounded-full h-8 overflow-hidden ${
              darkMode ? 'bg-gray-800' : 'bg-gray-100 shadow-inner'
            }`}>
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  darkMode ? 'bg-blue-500' : 'bg-blue-400'
                }`}
                style={{ width: `${mass * 100}%` }}
              />
            </div>
            <span className={`font-medium w-20 text-right ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {(mass * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>

      <div className={`pt-4 border-t flex items-center justify-between ${
        darkMode ? 'border-gray-600' : 'border-gray-200'
      }`}>
        <div>
          <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Method: </span>
          <span className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            {method === 'dempster' ? 'Dempster-Shafer' : 'PCR5'}
          </span>
        </div>
        <div className="text-right">
          <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Conflict: </span>
          <span className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            {result.conflict !== null ? `${(result.conflict * 100).toFixed(1)}%` : 'N/A'}
          </span>
          {result.conflict === null && (
            <p className={`text-xs mt-0.5 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              {method === 'pcr5' ? 'PCR5 redistributes conflict' : 'Multiple sources'}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default ResultCard
