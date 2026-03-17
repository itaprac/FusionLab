function Header({ darkMode, onToggleSidebar, sidebarOpen, onHome }) {
  return (
    <header className={`mb-8 border-b ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
      <div className="flex items-center">
        <button
          onClick={onToggleSidebar}
          className={`flex-shrink-0 p-4 transition-colors ${
            darkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
          }`}
          title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="flex-1 pr-4">
          <button
            onClick={onHome}
            className={`text-left ${darkMode ? 'text-white' : 'text-gray-900'}`}
            title="Home"
          >
            <h1 className="text-lg font-semibold tracking-tight">
              Fusion Lab
            </h1>
            <p className={`mt-0.5 text-xs uppercase tracking-[0.16em] ${
              darkMode ? 'text-slate-400' : 'text-slate-500'
            }`}>
              Evidence fusion for uncertain data
            </p>
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
