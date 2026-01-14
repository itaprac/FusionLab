function MethodSelector({ methods, selected, onChange, darkMode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {methods.map(method => (
        <button
          key={method.id}
          onClick={() => onChange(method.id)}
          className={`text-left p-4 rounded-xl border transition-colors ${
            selected === method.id
              ? darkMode
                ? 'border-teal-500/70 bg-teal-500/10'
                : 'border-teal-500 bg-teal-50'
              : darkMode
                ? 'border-gray-700 hover:border-gray-600 bg-gray-900'
                : 'border-gray-200 hover:border-gray-300 bg-white'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 ${
              selected === method.id
                ? 'border-teal-500'
                : darkMode
                  ? 'border-gray-500'
                  : 'border-gray-300'
            }`}>
              {selected === method.id && (
                <div className="w-2.5 h-2.5 rounded-full bg-teal-500" />
              )}
            </div>
            <div>
              <div className={`font-medium ${
                darkMode ? 'text-gray-100' : 'text-gray-800'
              }`}>
                {method.name}
              </div>
              <p className={`text-sm mt-1 ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {method.description}
              </p>
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}

export default MethodSelector
