import { useLanguage } from '../contexts/LanguageContext'

const CATEGORY_ORDER = [
  'normalized',
  'redistribution',
  'union_transfer',
  'ignorance_transfer',
  'open_conflict',
  'other',
]

const METHOD_CATEGORY_FALLBACK = {
  dempster: 'normalized',
  pcr5: 'redistribution',
  pcr6: 'redistribution',
  dsmh: 'union_transfer',
  dubois_prade: 'union_transfer',
  yager: 'ignorance_transfer',
  conjunctive: 'open_conflict',
  smets: 'open_conflict',
  dsmc: 'open_conflict',
}

const ML_CATEGORY_ORDER = [
  'recommended',
  'advanced',
  'diagnostic',
]

const ML_METHOD_CATEGORY = {
  dempster: 'recommended',
  pcr5: 'recommended',
  pcr6: 'recommended',
  yager: 'advanced',
  dsmh: 'advanced',
  dubois_prade: 'advanced',
  conjunctive: 'diagnostic',
  smets: 'diagnostic',
  dsmc: 'diagnostic',
}

function getCategory(method, context) {
  if (context === 'ml') return ML_METHOD_CATEGORY[method.id] || 'diagnostic'
  return method.category || METHOD_CATEGORY_FALLBACK[method.id] || 'other'
}

function getCategoryOrder(context) {
  return context === 'ml' ? ML_CATEGORY_ORDER : CATEGORY_ORDER
}

function getCategoryPrefix(context) {
  return context === 'ml' ? 'ml.method.category' : 'method.category'
}

function MethodSelector({ methods, selected, onChange, context = 'calculator' }) {
  const { t } = useLanguage()
  const categoryPrefix = getCategoryPrefix(context)
  const groupedMethods = getCategoryOrder(context).map(category => ({
    category,
    methods: methods.filter(method => getCategory(method, context) === category),
  })).filter(group => group.methods.length > 0)

  return (
    <div className="mt-4 space-y-4">
      {groupedMethods.map(group => (
        <section key={group.category} className="space-y-2">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: 'var(--accent-strong)' }}>
                {t(`${categoryPrefix}.${group.category}.title`)}
              </p>
              <p className="text-xs leading-5" style={{ color: 'var(--text-muted)' }}>
                {t(`${categoryPrefix}.${group.category}.body`)}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {group.methods.map(method => {
              const active = selected === method.id
              return (
                <button
                  key={method.id}
                  onClick={() => onChange(method.id)}
                  className="option-chip"
                  data-active={active}
                >
                  <div
                    className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2"
                    style={{ borderColor: active ? 'var(--accent)' : 'var(--line-strong)' }}
                  >
                    {active && <div className="h-2 w-2 rounded-full" style={{ background: 'var(--accent)' }} />}
                  </div>
                  <div className="text-left">
                    <span className="block text-sm leading-tight">{method.name}</span>
                    {method.description && (
                      <span className="block mt-0.5 text-xs leading-snug" style={{ color: 'var(--text-muted)', fontWeight: 400 }}>
                        {method.description}
                      </span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}

export default MethodSelector
