function TabNavigation({ tabs, activeTab, onChange, darkMode }) {
  return (
    <div className="mb-6">
      <nav className={`inline-flex rounded-xl p-1 border ${
        darkMode
          ? 'border-gray-700 bg-gray-800'
          : 'border-gray-200 bg-gray-50'
      }`}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === tab.id
                ? darkMode
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-900'
                : darkMode
                  ? 'text-gray-300 hover:text-white'
                  : 'text-gray-600 hover:text-gray-900'
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
