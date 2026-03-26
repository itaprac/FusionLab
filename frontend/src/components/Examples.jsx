function Examples({ onOpenCalculator, onOpenMLFusion }) {
  return (
    <div className="space-y-12">
      <div className="max-w-3xl">
        <p className="label">Guided scenarios</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-[-0.03em]" style={{ color: 'var(--text-strong)' }}>
          Examples
        </h1>
        <p className="mt-3 text-sm leading-7" style={{ color: 'var(--text)' }}>
          Choose a guided scenario to see fusion in action before configuring your own inputs.
        </p>
      </div>

      <div className="space-y-6">
        <button
          type="button"
          onClick={onOpenCalculator}
          className="group block w-full border-t py-6 text-left"
          style={{ borderColor: 'var(--line)' }}
        >
          <h2 className="text-base font-semibold tracking-[-0.01em]" style={{ color: 'var(--text-strong)' }}>
            Avalanche Hazard Assessment
          </h2>
          <p className="mt-2 max-w-lg text-sm leading-7" style={{ color: 'var(--text)' }}>
            Fuse weather conditions and field observations to estimate avalanche danger level using Dempster-Shafer theory.
          </p>
          <span
            className="mt-3 inline-block text-sm font-semibold transition-colors"
            style={{ color: 'var(--accent-strong)' }}
          >
            Open example &rarr;
          </span>
        </button>

        <button
          type="button"
          onClick={onOpenMLFusion}
          className="group block w-full border-t py-6 text-left"
          style={{ borderColor: 'var(--line)' }}
        >
          <h2 className="text-base font-semibold tracking-[-0.01em]" style={{ color: 'var(--text-strong)' }}>
            Handwritten Digit Classification
          </h2>
          <p className="mt-2 max-w-lg text-sm leading-7" style={{ color: 'var(--text)' }}>
            Train SVM, Random Forest, and Logistic Regression on digits, then fuse their outputs to compare against each model.
          </p>
          <span
            className="mt-3 inline-block text-sm font-semibold transition-colors"
            style={{ color: 'var(--accent-strong)' }}
          >
            Open example &rarr;
          </span>
        </button>
      </div>
    </div>
  )
}

export default Examples
