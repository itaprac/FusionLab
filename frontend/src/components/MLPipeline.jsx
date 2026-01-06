function MLPipeline({ darkMode }) {
  return (
    <div className="py-8">
      <div className="text-center mb-8">
        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
          darkMode
            ? 'bg-gradient-to-br from-blue-900 to-indigo-900'
            : 'bg-gradient-to-br from-blue-100 to-indigo-100'
        }`}>
          <svg className={`w-8 h-8 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>

        <h2 className={`text-2xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          ML Fusion Pipeline
        </h2>

        <p className={`max-w-lg mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Train machine learning models on your dataset and combine their predictions using Dempster-Shafer fusion for improved accuracy.
        </p>
      </div>

      <div className={`rounded-xl p-6 mb-8 ${
        darkMode
          ? 'bg-gray-700/50'
          : 'bg-gradient-to-br from-gray-50 to-slate-50'
      }`}>
        <h3 className={`text-sm font-semibold uppercase tracking-wide mb-5 text-center ${
          darkMode ? 'text-gray-400' : 'text-gray-700'
        }`}>
          How It Works
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`rounded-lg p-5 border ${
            darkMode
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white shadow-sm border-gray-100'
          }`}>
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg mb-3">
              1
            </div>
            <h4 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Upload Dataset</h4>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Import your CSV or dataset file for training and evaluation</p>
          </div>

          <div className={`rounded-lg p-5 border ${
            darkMode
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white shadow-sm border-gray-100'
          }`}>
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg mb-3">
              2
            </div>
            <h4 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Select Models</h4>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Choose multiple ML models to train and compare their predictions</p>
          </div>

          <div className={`rounded-lg p-5 border ${
            darkMode
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white shadow-sm border-gray-100'
          }`}>
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg mb-3">
              3
            </div>
            <h4 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Fuse Results</h4>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Combine model predictions using evidence fusion rules</p>
          </div>
        </div>
      </div>

      <div className={`rounded-lg p-4 flex items-start gap-3 ${
        darkMode
          ? 'bg-amber-900/20 border border-amber-800'
          : 'bg-amber-50 border border-amber-200'
      }`}>
        <svg className={`w-5 h-5 flex-shrink-0 mt-0.5 ${darkMode ? 'text-amber-400' : 'text-amber-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <p className={`text-sm ${darkMode ? 'text-amber-300' : 'text-amber-800'}`}>
            This feature is under development. Use the <span className="font-medium">Calculator</span> tab to manually compute belief fusion.
          </p>
        </div>
      </div>
    </div>
  )
}

export default MLPipeline
