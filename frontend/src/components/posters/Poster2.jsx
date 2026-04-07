import { useEffect } from 'react'

const FONTS_URL = 'https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Outfit:wght@300;400;600;800&display=swap'

function Poster2() {
  useEffect(() => {
    const link = document.createElement('link')
    link.href = FONTS_URL
    link.rel = 'stylesheet'
    document.head.appendChild(link)
    return () => document.head.removeChild(link)
  }, [])

  const bg = '#0c1117'
  const grid = '#1a2230'
  const accent = '#e8913a'
  const accentDim = 'rgba(232,145,58,0.15)'
  const text = '#d4dae3'
  const textDim = '#6b7a8d'
  const surface = '#141c26'

  return (
    <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '2rem', background: '#080c10' }}>
      <div style={{
        width: '700px', minHeight: '980px', aspectRatio: '5 / 7',
        background: bg, padding: '40px',
        display: 'flex', flexDirection: 'column', gap: '24px',
        boxShadow: '0 0 80px rgba(232,145,58,0.08)',
        position: 'relative', overflow: 'hidden',
        fontFamily: "'Outfit', sans-serif", color: text,
      }}>
        {/* Blueprint grid overlay */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          backgroundImage: `
            linear-gradient(${grid} 1px, transparent 1px),
            linear-gradient(90deg, ${grid} 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          opacity: 0.5,
        }} />

        {/* Subtle glow top-right */}
        <div style={{
          position: 'absolute', top: '-120px', right: '-80px', width: '350px', height: '350px',
          background: `radial-gradient(circle, rgba(232,145,58,0.08) 0%, transparent 70%)`,
          zIndex: 0,
        }} />

        {/* Content layer */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '24px', flex: 1 }}>

          {/* Top label */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '10px', color: textDim, letterSpacing: '3px', textTransform: 'uppercase' }}>
              Inżynierski Projekt Zespołowy
            </span>
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '10px', color: accent, letterSpacing: '3px' }}>
              REV.2025
            </span>
          </div>

          {/* Title block */}
          <header style={{ marginTop: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <rect x="2" y="2" width="36" height="36" stroke={accent} strokeWidth="1.5" fill="none" strokeDasharray="4 3" />
                <circle cx="15" cy="20" r="8" stroke={accent} strokeWidth="1.5" fill="none" />
                <circle cx="25" cy="20" r="8" stroke={accent} strokeWidth="1.5" fill="none" />
              </svg>
              <div>
                <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '48px', fontWeight: 800, color: '#f0f2f5', margin: 0, lineHeight: 1, letterSpacing: '-1px' }}>
                  FUSION<span style={{ color: accent }}>LAB</span>
                </h1>
              </div>
            </div>
            <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '13px', color: accent, margin: '0 0 4px 0', letterSpacing: '1px' }}>
              // Matematyka fuzji dowodów — uprość złożoność
            </p>
            <p style={{ fontSize: '13px', fontWeight: 300, color: textDim, margin: 0, maxWidth: '500px', lineHeight: 1.6 }}>
              Platforma webowa przekształcająca zaawansowaną teorię Dempster-Shafer
              i&nbsp;DSmT w intuicyjne narzędzie do analizy niepewnych danych.
            </p>
          </header>

          {/* Flow diagram */}
          <section style={{ background: surface, border: `1px solid ${grid}`, padding: '20px', borderRadius: '2px' }}>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '10px', color: textDim, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '14px' }}>
              SYSTEM FLOW
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
              {[
                { icon: '◇', label: 'SOURCES', sub: 'belief masses' },
                { icon: '▷', label: 'METHOD', sub: 'DST / PCR5 / PCR6' },
                { icon: '⬡', label: 'FUSION', sub: 'conflict resolution' },
                { icon: '◉', label: 'RESULT', sub: 'visual output' },
              ].map((node, i) => (
                <div key={node.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                  <div style={{
                    width: '100%', border: `1px solid ${i === 2 ? accent : grid}`,
                    background: i === 2 ? accentDim : 'transparent',
                    padding: '12px 10px', textAlign: 'center', borderRadius: '2px',
                  }}>
                    <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '18px', color: i === 2 ? accent : textDim, display: 'block', marginBottom: '4px' }}>
                      {node.icon}
                    </span>
                    <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '10px', fontWeight: 700, color: text, display: 'block', letterSpacing: '1px' }}>
                      {node.label}
                    </span>
                    <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '8px', color: textDim, display: 'block', marginTop: '2px' }}>
                      {node.sub}
                    </span>
                  </div>
                  {i < 3 && (
                    <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '14px', color: textDim, flexShrink: 0 }}>→</span>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Screenshots */}
          <section>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '10px', color: textDim, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>
              INTERFACE PREVIEW
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '10px' }}>
              {['Kalkulator Fuzji', 'ML Pipeline', 'Wyniki'].map((label, i) => (
                <div key={i} style={{
                  height: '110px', background: surface, border: `1px solid ${grid}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: '2px',
                }}>
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', color: textDim }}>
                    [{String(i + 1).padStart(2, '0')}] {label}
                  </span>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '10px' }}>
              {['DST vs DSmT Porównanie', 'Przykłady'].map((label, i) => (
                <div key={i} style={{
                  height: '90px', background: surface, border: `1px solid ${grid}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: '2px',
                }}>
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', color: textDim }}>
                    [{String(i + 4).padStart(2, '0')}] {label}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Two columns: audience + unique */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <section style={{ background: surface, border: `1px solid ${grid}`, padding: '16px', borderRadius: '2px' }}>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '10px', color: accent, letterSpacing: '2px', marginBottom: '10px' }}>
                TARGET AUDIENCE
              </div>
              {['Badacze — prototypowanie reguł fuzji', 'Studenci — nauka DST/DSmT w praktyce', 'Data Scientists — ensemble z AI fusion'].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'flex-start' }}>
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '10px', color: accent, flexShrink: 0 }}>▸</span>
                  <span style={{ fontSize: '11px', color: text, lineHeight: 1.5 }}>{item}</span>
                </div>
              ))}
            </section>
            <section style={{ background: surface, border: `1px solid ${grid}`, padding: '16px', borderRadius: '2px' }}>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '10px', color: accent, letterSpacing: '2px', marginBottom: '10px' }}>
                KEY FEATURES
              </div>
              {[
                'Porównanie DST i DSmT side-by-side',
                'Wizualna analiza konfliktów',
                'Kalkulator + ML Pipeline w jednym',
                'Gotowe scenariusze (np. lawiny)',
                'Real-time fusion results',
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '6px', alignItems: 'flex-start' }}>
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '10px', color: accent, flexShrink: 0 }}>▸</span>
                  <span style={{ fontSize: '11px', color: text, lineHeight: 1.5 }}>{item}</span>
                </div>
              ))}
            </section>
          </div>

          {/* Tech stack */}
          <section>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '10px', color: textDim, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>
              TECH STACK
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {['React', 'FastAPI', 'Python', 'scikit-learn', 'NumPy', 'Tailwind', 'Vite'].map((t) => (
                <span key={t} style={{
                  fontFamily: "'Space Mono', monospace", fontSize: '10px',
                  padding: '5px 12px', border: `1px solid ${grid}`,
                  color: text, letterSpacing: '0.5px',
                  background: 'transparent', borderRadius: '1px',
                }}>
                  {t}
                </span>
              ))}
            </div>
          </section>

          {/* Buzzwords banner */}
          <div style={{
            display: 'flex', gap: '24px', justifyContent: 'center', padding: '12px',
            background: `linear-gradient(90deg, transparent, ${accentDim}, transparent)`,
          }}>
            {['Evidence Fusion', 'Machine Learning', 'Belief Functions', 'AI Pipeline'].map((w) => (
              <span key={w} style={{
                fontFamily: "'Space Mono', monospace", fontSize: '10px', fontWeight: 700,
                color: accent, letterSpacing: '2px', textTransform: 'uppercase',
              }}>
                {w}
              </span>
            ))}
          </div>

          {/* Footer */}
          <footer style={{
            marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
            paddingTop: '12px', borderTop: `1px solid ${grid}`,
          }}>
            <div>
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', color: textDim, display: 'block' }}>
                Wydział Informatyki
              </span>
            </div>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '8px', color: textDim }}>
                Inżynierski Projekt Zespołowy — 2025
              </span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', color: textDim, display: 'block' }}>
                Autorzy: _______________
              </span>
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', color: textDim, display: 'block' }}>
                Opiekun: _______________
              </span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  )
}

export default Poster2
