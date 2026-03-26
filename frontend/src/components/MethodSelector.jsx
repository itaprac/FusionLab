function MethodSelector({ methods, selected, onChange }) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {methods.map(method => {
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
  )
}

export default MethodSelector
