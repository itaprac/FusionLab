function Landing({ darkMode }) {
  return (
    <div className="py-12">
      <div className="max-w-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
            darkMode ? 'bg-teal-900/30 text-teal-300' : 'bg-teal-100 text-teal-700'
          }`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6" />
            </svg>
          </div>
          <div>
            <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Welcome
            </h2>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Landing page placeholder (to be filled).
            </p>
          </div>
        </div>

        <div className={`rounded-2xl border p-5 ${
          darkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'
        }`}>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Choose a section from the left sidebar to get started:
          </p>
          <ul className={`mt-3 space-y-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <li>- Mlfusion: run ML fusion pipeline</li>
            <li>- Calculator: calculate fusion from belief masses</li>
            <li>- Examples: browse ready-made inputs</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Landing
