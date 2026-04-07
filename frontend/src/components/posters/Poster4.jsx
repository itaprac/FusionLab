import { useEffect } from 'react'

const FONTS_URL = 'https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&family=Newsreader:ital,wght@0,400;0,700;1,400&display=swap'

function Poster4() {
  useEffect(() => {
    const link = document.createElement('link')
    link.href = FONTS_URL
    link.rel = 'stylesheet'
    document.head.appendChild(link)
    return () => document.head.removeChild(link)
  }, [])

  const teal = '#1a8a7d'
  const tealLight = '#e4f5f2'
  const violet = '#6e4fad'
  const violetLight = '#ede7f7'
  const warm = '#e86f3a'
  const bg = '#fafbfc'
  const text = '#1e2228'
  const textSoft = '#5c6370'

  return (
    <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '2rem', background: '#edeff2' }}>
      <div style={{
        width: '700px', minHeight: '980px', aspectRatio: '5 / 7',
        background: bg, padding: '44px 40px',
        display: 'flex', flexDirection: 'column', gap: '22px',
        boxShadow: '0 4px 48px rgba(0,0,0,0.08)',
        position: 'relative', overflow: 'hidden',
        fontFamily: "'Sora', sans-serif", color: text,
      }}>

        {/* Gradient mesh background */}
        <div style={{
          position: 'absolute', top: '-100px', left: '-60px', width: '450px', height: '450px',
          background: `radial-gradient(circle at 30% 40%, ${tealLight} 0%, transparent 60%)`,
          zIndex: 0,
        }} />
        <div style={{
          position: 'absolute', bottom: '-80px', right: '-40px', width: '400px', height: '400px',
          background: `radial-gradient(circle at 60% 60%, ${violetLight} 0%, transparent 60%)`,
          zIndex: 0,
        }} />
        <div style={{
          position: 'absolute', top: '50%', left: '50%', width: '300px', height: '300px',
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(circle, rgba(232,111,58,0.06) 0%, transparent 70%)`,
          zIndex: 0,
        }} />

        {/* Subtle dot pattern */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0, opacity: 0.3,
          backgroundImage: 'radial-gradient(circle, #c0c4cc 0.7px, transparent 0.7px)',
          backgroundSize: '20px 20px',
        }} />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '22px', flex: 1 }}>

          {/* Top row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: textSoft }}>
              Inżynierski Projekt Zespołowy
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: teal }} />
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: violet }} />
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: warm }} />
            </div>
          </div>

          {/* Header */}
          <header>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '10px' }}>
              <h1 style={{
                fontSize: '52px', fontWeight: 800, color: text,
                margin: 0, lineHeight: 1, letterSpacing: '-2px',
              }}>
                FusionLab
              </h1>
              <span style={{
                fontSize: '11px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase',
                color: bg, background: teal, padding: '3px 10px', borderRadius: '20px',
              }}>
                Evidence Fusion
              </span>
            </div>
            <p style={{
              fontFamily: "'Newsreader', serif", fontSize: '18px', fontStyle: 'italic',
              color: textSoft, margin: 0, maxWidth: '440px', lineHeight: 1.5,
            }}>
              Matematyka fuzji dowodów — prosta, wizualna i dostępna dla każdego.
            </p>
          </header>

          {/* Value cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {[
              { bg: tealLight, border: teal, label: 'Czym jest?', desc: 'Platforma webowa upraszczająca teorię Dempster-Shafer i DSmT (PCR5/6) do intuicyjnego interfejsu.' },
              { bg: violetLight, border: violet, label: 'Dla kogo?', desc: 'Badacze, studenci i data scientists szukający prostego narzędzia do analizy niepewności.' },
              { bg: '#fef3ec', border: warm, label: 'Dlaczego?', desc: 'Łączymy dane z wielu źródeł, rozwiązujemy konflikty i pokazujemy reasoning — krok po kroku.' },
            ].map((card, i) => (
              <div key={i} style={{
                background: card.bg, borderRadius: '12px', padding: '18px 16px',
                borderLeft: `3px solid ${card.border}`,
              }}>
                <h3 style={{ fontSize: '13px', fontWeight: 700, color: text, margin: '0 0 6px 0' }}>{card.label}</h3>
                <p style={{ fontSize: '11px', color: textSoft, lineHeight: 1.55, margin: 0 }}>{card.desc}</p>
              </div>
            ))}
          </div>

          {/* How it works - horizontal flow */}
          <section>
            <h2 style={{ fontSize: '15px', fontWeight: 700, color: text, margin: '0 0 12px 0' }}>
              Jak to działa?
            </h2>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0',
              background: '#f0f2f5', borderRadius: '12px', padding: '16px 12px',
            }}>
              {[
                { icon: '📊', label: 'Źródła danych', sub: 'Eksperci / Sensory / ML' },
                { icon: '⚙️', label: 'Reguła fuzji', sub: 'Dempster / PCR5 / PCR6' },
                { icon: '🔬', label: 'Analiza', sub: 'Konflikty + Wagi' },
                { icon: '✅', label: 'Wynik', sub: 'Fused belief + metryki' },
              ].map((step, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <div style={{ textAlign: 'center', width: '100%' }}>
                    <span style={{ fontSize: '22px', display: 'block', marginBottom: '4px' }}>{step.icon}</span>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: text, display: 'block' }}>{step.label}</span>
                    <span style={{ fontSize: '9px', color: textSoft, display: 'block', marginTop: '2px' }}>{step.sub}</span>
                  </div>
                  {i < 3 && (
                    <svg width="20" height="20" viewBox="0 0 20 20" style={{ flexShrink: 0, margin: '0 -2px' }}>
                      <path d="M6 4l8 6-8 6" fill="none" stroke={teal} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Screenshots */}
          <section>
            <h2 style={{ fontSize: '15px', fontWeight: 700, color: text, margin: '0 0 10px 0' }}>
              Aplikacja
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '10px', marginBottom: '10px' }}>
              <div style={{
                background: '#f0f2f5', borderRadius: '10px', minHeight: '130px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1px solid #e4e7ec',
              }}>
                <span style={{ fontSize: '10px', fontWeight: 600, color: '#aaa' }}>Screenshot 1 — Kalkulator Fuzji</span>
              </div>
              <div style={{
                background: '#f0f2f5', borderRadius: '10px', minHeight: '130px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1px solid #e4e7ec',
              }}>
                <span style={{ fontSize: '10px', fontWeight: 600, color: '#aaa' }}>Screenshot 2 — ML Pipeline</span>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {['Wyniki fuzji', 'DST vs DSmT', 'Przykłady'].map((label, i) => (
                <div key={i} style={{
                  background: '#f0f2f5', borderRadius: '10px', minHeight: '90px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '1px solid #e4e7ec',
                }}>
                  <span style={{ fontSize: '9px', fontWeight: 600, color: '#aaa' }}>Screenshot {i + 3} — {label}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Features + Buzzwords */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: text, margin: '0 0 8px 0' }}>Co wyróżnia?</h3>
              {[
                'Porównanie DST i DSmT side-by-side',
                'Wizualna analiza konfliktów',
                'Kalkulator + ML Pipeline',
                'Gotowe scenariusze testowe',
                'Wyniki w czasie rzeczywistym',
              ].map((f, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '5px' }}>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: teal, flexShrink: 0 }} />
                  <span style={{ fontSize: '11px', color: textSoft, lineHeight: 1.4 }}>{f}</span>
                </div>
              ))}
            </div>
            <div>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: text, margin: '0 0 8px 0' }}>Słowa kluczowe</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {[
                  { label: 'Evidence Fusion', color: teal },
                  { label: 'Machine Learning', color: violet },
                  { label: 'AI Pipeline', color: warm },
                  { label: 'Belief Functions', color: teal },
                  { label: 'Conflict Analysis', color: violet },
                  { label: 'Ensemble Learning', color: warm },
                ].map((kw, i) => (
                  <span key={i} style={{
                    fontSize: '10px', fontWeight: 600, padding: '4px 10px',
                    borderRadius: '20px', color: kw.color,
                    background: kw.color === teal ? tealLight : kw.color === violet ? violetLight : '#fef3ec',
                  }}>
                    {kw.label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Tech */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '12px 16px', background: '#f0f2f5', borderRadius: '10px',
          }}>
            <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: textSoft, flexShrink: 0 }}>
              Technologie
            </span>
            <div style={{ width: '1px', height: '16px', background: '#d0d4da' }} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {['React', 'FastAPI', 'Python', 'scikit-learn', 'NumPy', 'Tailwind CSS', 'Vite'].map((t) => (
                <span key={t} style={{ fontSize: '11px', fontWeight: 600, color: text }}>{t}</span>
              ))}
            </div>
          </div>

          {/* Footer */}
          <footer style={{
            marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
            paddingTop: '14px', borderTop: '1px solid #e4e7ec',
          }}>
            <div>
              <span style={{ fontSize: '9px', fontWeight: 600, color: textSoft, display: 'block' }}>Wydział Informatyki</span>
            </div>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '8px', color: '#aaa' }}>Praca wykonana w ramach przedmiotu: Inżynierski Projekt Zespołowy, 2025</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '9px', color: textSoft, display: 'block' }}>Autorzy: _______________</span>
              <span style={{ fontSize: '9px', color: textSoft, display: 'block' }}>Opiekun: _______________</span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  )
}

export default Poster4
