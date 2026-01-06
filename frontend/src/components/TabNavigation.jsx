function TabNavigation({ tabs, activeTab, onChange, darkMode }) {
  return (
    <div className={`border-b mb-6 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
      <nav className="flex gap-8">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : darkMode
                  ? 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {tab.label}
            {tab.badge && (
              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-700">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  )
}

export default TabNavigation
