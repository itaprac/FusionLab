function AvalancheExample({ darkMode, onTest }) {
  const sources = [
    {
      name: 'Prognoza pogody (wiatr/śnieg/temperatura)',
      note: 'Model meteorologiczny wskazuje na wzrost obciążenia i transport śniegu przez wiatr.',
      masses: {
        LOW: 0.05,
        MODERATE: 0.15,
        CONSIDERABLE: 0.55,
        HIGH: 0.15,
        UNCERTAIN: 0.10,
      },
    },
    {
      name: 'Obserwacje w terenie',
      note: 'Świeże depozyty nawiane, pojedyncze "whumph" i pęknięcia na stromych stokach.',
      masses: {
        LOW: 0.05,
        MODERATE: 0.10,
        CONSIDERABLE: 0.45,
        HIGH: 0.30,
        UNCERTAIN: 0.10,
      },
    },
  ]

  const hypotheses = ['LOW', 'MODERATE', 'CONSIDERABLE', 'HIGH', 'UNCERTAIN']

  return (
    <div>
      <div className="mb-6">
        <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Przykład: fuzja danych o zagrożeniu lawinowym
        </h2>
        <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Poniżej jest prosty, realistyczny scenariusz, w którym łączymy dwa źródła informacji, aby oszacować poziom zagrożenia.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className={`rounded-2xl border p-5 ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
          <div className={`text-sm font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Cel</div>
          <p className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Zfuzjować oceny i uzyskać jeden rozkład mas dla hipotez: LOW / MODERATE / CONSIDERABLE / HIGH (+ UNCERTAIN).
          </p>
        </div>

        <div className={`rounded-2xl border p-5 ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
          <div className={`text-sm font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Interpretacja</div>
          <p className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Każde źródło przypisuje masy (0–1). "UNCERTAIN" oznacza część niewiedzy/niepewności danego źródła.
          </p>
        </div>

        <div className={`rounded-2xl border p-5 ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
          <div className={`text-sm font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Wskazówka</div>
          <p className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            W przypadku potencjalnego konfliktu źródeł warto sprawdzić też PCR5 — lepiej radzi sobie z wysokim konfliktem.
          </p>
        </div>
      </div>

      <div className={`rounded-2xl border overflow-hidden ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
        <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
          <div className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Masy dla źródeł</div>
          <div className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Te dane zostaną automatycznie wczytane do kalkulatora po kliknięciu „Przetestuj”.
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-5">
            {sources.map((src) => (
              <div key={src.name} className={`rounded-xl border p-4 ${darkMode ? 'border-gray-800 bg-gray-950/30' : 'border-gray-200 bg-gray-50'}`}>
                <div className={`font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{src.name}</div>
                <div className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{src.note}</div>

                <div className="overflow-x-auto mt-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                        <th className="text-left font-semibold pb-2">Hipoteza</th>
                        <th className="text-left font-semibold pb-2">Masa</th>
                      </tr>
                    </thead>
                    <tbody>
                      {hypotheses.map((h) => (
                        <tr key={h} className={darkMode ? 'text-gray-200' : 'text-gray-800'}>
                          <td className="py-1.5 pr-6 whitespace-nowrap">{h}</td>
                          <td className="py-1.5">{src.masses[h].toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Przycisk przeniesie do „Fusion Calculator” i ustawi przykład + metodę PCR5.
            </div>
            <button
              onClick={onTest}
              className="btn btn-primary px-5 py-3"
            >
              Przetestuj w kalkulatorze
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AvalancheExample
