import { useEffect } from 'react'

const FONTS_URL = 'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Urbanist:wght@300;400;600;800;900&display=swap'

function Poster5() {
  useEffect(() => {
    const link = document.createElement('link')
    link.href = FONTS_URL
    link.rel = 'stylesheet'
    document.head.appendChild(link)
    return () => document.head.removeChild(link)
  }, [])

  const ink = '#171412'
  const paper = '#f2ede5'
  const rust = '#b84a2d'
  const slate = '#6b6560'

  return (
    <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '2rem', background: '#d8d3cb' }}>
      <div style={{
        width: '700px', minHeight: '980px', aspectRatio: '5 / 7',
        background: paper, padding: '48px 44px',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 8px 60px rgba(0,0,0,0.12)',
        position: 'relative', overflow: 'hidden',
        fontFamily: "'Urbanist', sans-serif", color: ink,
      }}>

        {/* Top line */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
          marginBottom: '32px',
        }}>
          <span style={{ fontSize: '9px', fontWeight: 600, letterSpacing: '3px', textTransform: 'uppercase', color: slate }}>
            Inżynierski Projekt Zespołowy
          </span>
          <span style={{ fontSize: '9px', fontWeight: 600, letterSpacing: '3px', textTransform: 'uppercase', color: slate }}>
            2025
          </span>
        </div>

        {/* Massive title */}
        <div style={{ marginBottom: '6px' }}>
          <h1 style={{
            fontFamily: "'Urbanist', sans-serif", fontSize: '96px', fontWeight: 900,
            color: ink, margin: 0, lineHeight: 0.88, letterSpacing: '-4px',
          }}>
            FUSION
          </h1>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px' }}>
            <h1 style={{
              fontFamily: "'Urbanist', sans-serif", fontSize: '96px', fontWeight: 900,
              color: ink, margin: 0, lineHeight: 0.88, letterSpacing: '-4px',
            }}>
              LAB
            </h1>
            <span style={{
              fontFamily: "'Instrument Serif', serif", fontSize: '28px', fontStyle: 'italic',
              color: rust, lineHeight: 1,
            }}>
              evidence fusion
            </span>
          </div>
        </div>

        {/* Thin rule */}
        <div style={{ height: '1px', background: ink, margin: '16px 0', opacity: 0.15 }} />

        {/* Tagline block */}
        <div style={{ marginBottom: '20px' }}>
          <p style={{
            fontFamily: "'Instrument Serif', serif", fontSize: '22px', fontStyle: 'italic',
            color: ink, lineHeight: 1.4, margin: 0, maxWidth: '500px',
          }}>
            Złożoną teorię matematyczną zamieniamy w&nbsp;proste,
            wizualne narzędzie — <span style={{ color: rust, fontWeight: 700, fontStyle: 'normal', fontFamily: "'Urbanist', sans-serif", fontSize: '20px' }}>dla każdego.</span>
          </p>
        </div>

        {/* Two-column content */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '24px' }}>
          {/* Left column */}
          <div>
            <h2 style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '3px', textTransform: 'uppercase', color: rust, margin: '0 0 12px 0' }}>
              CO ROBIMY
            </h2>
            <p style={{ fontSize: '12px', fontWeight: 400, color: '#3a3632', lineHeight: 1.65, margin: '0 0 16px 0' }}>
              FusionLab to platforma webowa dla teorii fuzji dowodów:
              Dempster-Shafer (DST) i&nbsp;Dezert-Smarandache (DSmT).
              Dwa tryby pracy — ręczny Kalkulator Fuzji oraz
              automatyczny Pipeline Machine&nbsp;Learning.
            </p>

            <h2 style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '3px', textTransform: 'uppercase', color: rust, margin: '0 0 12px 0' }}>
              DLA KOGO
            </h2>
            {['Badacze — szybkie prototypowanie reguł fuzji',
              'Studenci — nauka DST/DSmT w praktyce',
              'Data Scientists — ensemble learning z fusion'
            ].map((item, i) => (
              <p key={i} style={{
                fontSize: '11px', color: '#3a3632', lineHeight: 1.5,
                margin: '0 0 6px 0', paddingLeft: '12px',
                borderLeft: `2px solid ${rust}`,
              }}>
                {item}
              </p>
            ))}
          </div>

          {/* Right column */}
          <div>
            <h2 style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '3px', textTransform: 'uppercase', color: rust, margin: '0 0 12px 0' }}>
              JAK DZIAŁA
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              {[
                { num: '1', text: 'Wprowadź masy przekonań z wielu źródeł' },
                { num: '2', text: 'Wybierz regułę: Dempster, PCR5 lub PCR6' },
                { num: '3', text: 'System łączy dowody i rozwiązuje konflikty' },
                { num: '4', text: 'Wizualizacja wyników z pełną analizą' },
              ].map((step) => (
                <div key={step.num} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <span style={{
                    fontFamily: "'Urbanist', sans-serif", fontSize: '24px', fontWeight: 900,
                    color: rust, lineHeight: 1, minWidth: '22px',
                  }}>
                    {step.num}
                  </span>
                  <span style={{ fontSize: '11px', color: '#3a3632', lineHeight: 1.5, paddingTop: '4px' }}>
                    {step.text}
                  </span>
                </div>
              ))}
            </div>

            <h2 style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '3px', textTransform: 'uppercase', color: rust, margin: '0 0 10px 0' }}>
              CO WYRÓŻNIA
            </h2>
            {[
              'DST vs DSmT — porównanie obok siebie',
              'Wizualna analiza konfliktów',
              'Kalkulator + ML Pipeline w jednym',
              'Gotowe scenariusze (np. lawiny)',
            ].map((f, i) => (
              <p key={i} style={{
                fontSize: '11px', color: '#3a3632', lineHeight: 1.5,
                margin: '0 0 4px 0', paddingLeft: '10px',
                position: 'relative',
              }}>
                <span style={{ position: 'absolute', left: 0, color: rust }}>+</span>
                {f}
              </p>
            ))}
          </div>
        </div>

        {/* Screenshots - editorial grid */}
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '3px', textTransform: 'uppercase', color: rust, margin: '0 0 10px 0' }}>
            ZRZUTY EKRANU
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gridTemplateRows: '100px 80px', gap: '8px' }}>
            <div style={{
              gridColumn: 'span 2', gridRow: 'span 1',
              background: '#e8e3da', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: '10px', fontWeight: 600, color: '#aaa', letterSpacing: '1px', textTransform: 'uppercase' }}>
                Screenshot 1 — Kalkulator Fuzji
              </span>
            </div>
            <div style={{
              gridRow: 'span 2',
              background: '#e8e3da', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: '9px', fontWeight: 600, color: '#aaa', letterSpacing: '1px', textTransform: 'uppercase', textAlign: 'center', padding: '0 8px' }}>
                Screenshot 2 — ML Pipeline
              </span>
            </div>
            <div style={{
              background: '#e8e3da', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: '9px', fontWeight: 600, color: '#aaa', letterSpacing: '1px', textTransform: 'uppercase' }}>
                Screenshot 3
              </span>
            </div>
            <div style={{
              background: '#e8e3da', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: '9px', fontWeight: 600, color: '#aaa', letterSpacing: '1px', textTransform: 'uppercase' }}>
                Screenshot 4
              </span>
            </div>
          </div>
          <div style={{ marginTop: '8px', display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
            <div style={{
              height: '70px', background: '#e8e3da', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: '9px', fontWeight: 600, color: '#aaa', letterSpacing: '1px', textTransform: 'uppercase' }}>
                Screenshot 5 — DST vs DSmT Porównanie
              </span>
            </div>
          </div>
        </div>

        {/* Keyword strip */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: '20px', padding: '14px 0',
          borderTop: `1px solid rgba(23,20,18,0.1)`,
          borderBottom: `1px solid rgba(23,20,18,0.1)`,
          marginBottom: '16px',
        }}>
          {['Evidence Fusion', 'Machine Learning', 'Belief Functions', 'AI Pipeline', 'Conflict Analysis'].map((w, i) => (
            <span key={i} style={{
              fontSize: '9px', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase',
              color: i % 2 === 0 ? rust : ink,
            }}>
              {w}
            </span>
          ))}
        </div>

        {/* Tech as flowing text */}
        <div style={{ marginBottom: '12px' }}>
          <span style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '3px', textTransform: 'uppercase', color: rust }}>
            TECHNOLOGIE:{' '}
          </span>
          <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: '14px', color: '#3a3632' }}>
            React, FastAPI, Python, scikit-learn, NumPy, Tailwind CSS, Vite
          </span>
        </div>

        {/* Footer */}
        <footer style={{
          marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
          paddingTop: '14px', borderTop: `1px solid rgba(23,20,18,0.1)`,
        }}>
          <div>
            <span style={{ fontSize: '9px', fontWeight: 600, color: slate, display: 'block', letterSpacing: '1px' }}>
              Wydział Informatyki
            </span>
          </div>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '8px', color: '#aaa' }}>
              Praca wykonana w ramach przedmiotu: Inżynierski Projekt Zespołowy
            </span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '9px', color: slate, display: 'block' }}>Autorzy: _______________</span>
            <span style={{ fontSize: '9px', color: slate, display: 'block' }}>Opiekun: _______________</span>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default Poster5
