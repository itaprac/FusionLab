function Examples({ darkMode, onOpenCalculator }) {
  return (
    <div>
      <div className="mb-6">
        <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Examples
        </h2>
        <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Wybierz, do którego modułu chcesz przejść.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onOpenCalculator}
          className={`text-left p-4 rounded-xl border transition-colors ${
            darkMode
              ? 'border-gray-700 hover:border-gray-600 bg-gray-900'
              : 'border-gray-200 hover:border-gray-300 bg-white'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 ${
              darkMode ? 'border-gray-500' : 'border-gray-300'
            }`}>
              <div className="w-2.5 h-2.5 rounded-full bg-teal-500 opacity-70" />
            </div>
            <div>
              <div className={`font-medium ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                Calculator
              </div>
              <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Go to a ready-to-run fusion example (avalanche hazard).
              </p>
            </div>
          </div>
        </button>
      </div>
    </div>
  )
}

export default Examples
