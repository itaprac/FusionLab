import { useEffect } from 'react'

const FONTS_URL = 'https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,700;0,800;1,400&family=Fraunces:ital,wght@0,700;0,900;1,400&display=swap'

function Poster3() {
  useEffect(() => {
    const link = document.createElement('link')
    link.href = FONTS_URL
    link.rel = 'stylesheet'
    document.head.appendChild(link)
    return () => document.head.removeChild(link)
  }, [])

  const red = '#d64030'
  const blue = '#2856a3'
  const yellow = '#e8b830'
  const cream = '#f5f0e6'
  const dark = '#1a1714'

  return (
    <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '2rem', background: '#e0dbd3' }}>
      <div style={{
        width: '700px', minHeight: '980px', aspectRatio: '5 / 7',
        background: cream, padding: '0',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 8px 60px rgba(0,0,0,0.15)',
        position: 'relative', overflow: 'hidden',
        fontFamily: "'DM Sans', sans-serif", color: dark,
      }}>

        {/* Red top band */}
        <div style={{ height: '8px', background: red, width: '100%', flexShrink: 0 }} />

        {/* Hero section with geometric shapes */}
        <div style={{ position: 'relative', padding: '36px 40px 24px', overflow: 'hidden' }}>
          {/* Geometric shapes */}
          <div style={{
            position: 'absolute', top: '-30px', right: '-20px', width: '200px', height: '200px',
            borderRadius: '50%', background: yellow, opacity: 0.25, zIndex: 0,
          }} />
          <div style={{
            position: 'absolute', top: '60px', right: '80px', width: '80px', height: '80px',
            background: blue, opacity: 0.2, zIndex: 0, transform: 'rotate(15deg)',
          }} />
          <div style={{
            position: 'absolute', top: '10px', right: '200px', width: '0', height: '0',
            borderLeft: '40px solid transparent', borderRight: '40px solid transparent',
            borderBottom: `70px solid ${red}`, opacity: 0.15, zIndex: 0,
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: '10px', fontWeight: 700,
              letterSpacing: '4px', textTransform: 'uppercase', color: red, marginBottom: '10px',
            }}>
              Inżynierski Projekt Zespołowy — 2025
            </div>

            <h1 style={{
              fontFamily: "'Fraunces', serif", fontSize: '64px', fontWeight: 900,
              color: dark, margin: '0 0 0 -3px', lineHeight: 0.95, letterSpacing: '-2px',
            }}>
              Fusion<br />Lab
            </h1>

            <div style={{
              width: '60px', height: '4px', background: red, margin: '16px 0',
            }} />

            <p style={{
              fontSize: '16px', fontWeight: 400, color: '#444',
              maxWidth: '360px', lineHeight: 1.55, margin: 0,
            }}>
              Złożona teoria fuzji dowodów — Dempster-Shafer
              i&nbsp;DSmT — w formie prostego,
              wizualnego narzędzia.
            </p>
          </div>
        </div>

        {/* Fusion metaphor: overlapping circles */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0 16px', position: 'relative' }}>
          <svg width="280" height="100" viewBox="0 0 280 100">
            <circle cx="100" cy="50" r="40" fill={red} opacity="0.2" stroke={red} strokeWidth="2" />
            <circle cx="180" cy="50" r="40" fill={blue} opacity="0.2" stroke={blue} strokeWidth="2" />
            <ellipse cx="140" cy="50" rx="20" ry="35" fill={yellow} opacity="0.35" />
            <text x="75" y="54" fontFamily="'DM Sans', sans-serif" fontSize="11" fontWeight="700" fill={dark} textAnchor="middle">Źródło A</text>
            <text x="205" y="54" fontFamily="'DM Sans', sans-serif" fontSize="11" fontWeight="700" fill={dark} textAnchor="middle">Źródło B</text>
            <text x="140" y="50" fontFamily="'Fraunces', serif" fontSize="13" fontWeight="900" fill={dark} textAnchor="middle">FUZJA</text>
            <text x="140" y="64" fontFamily="'DM Sans', sans-serif" fontSize="8" fill="#666" textAnchor="middle">conflict resolution</text>
          </svg>
        </div>

        {/* Three cards: Co? Dla kogo? Jak? */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0', padding: '0 40px', marginBottom: '20px' }}>
          {[
            { color: red, title: 'Co robimy?', items: ['Kalkulator Fuzji', 'ML Pipeline', 'Analiza konfliktów', 'DST vs DSmT'] },
            { color: blue, title: 'Dla kogo?', items: ['Badacze', 'Studenci', 'Data Scientists', 'Inżynierowie AI'] },
            { color: yellow, title: 'Jak działa?', items: ['Evidence Fusion', 'Machine Learning', 'Belief Functions', 'Real-time results'] },
          ].map((card, ci) => (
            <div key={ci} style={{
              padding: '18px 16px', borderTop: `4px solid ${card.color}`,
              borderRight: ci < 2 ? `1px solid #e0dbd3` : 'none',
            }}>
              <h3 style={{
                fontFamily: "'Fraunces', serif", fontSize: '16px', fontWeight: 900,
                color: dark, margin: '0 0 10px 0',
              }}>
                {card.title}
              </h3>
              {card.items.map((item, i) => (
                <div key={i} style={{
                  fontSize: '11px', color: '#555', lineHeight: 1.5,
                  paddingLeft: '10px', position: 'relative', marginBottom: '4px',
                }}>
                  <span style={{ position: 'absolute', left: 0, color: card.color, fontWeight: 700 }}>—</span>
                  {item}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Screenshots */}
        <div style={{ padding: '0 40px', marginBottom: '20px' }}>
          <h2 style={{
            fontFamily: "'Fraunces', serif", fontSize: '18px', fontWeight: 900,
            color: dark, margin: '0 0 12px 0',
          }}>
            Zrzuty ekranu
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '8px', marginBottom: '8px' }}>
            <div style={{
              gridRow: 'span 2', background: '#e8e3d9', display: 'flex', alignItems: 'center', justifyContent: 'center',
              minHeight: '140px', border: `2px solid ${dark}`,
            }}>
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Screenshot 1 — Kalkulator
              </span>
            </div>
            <div style={{
              background: '#e8e3d9', display: 'flex', alignItems: 'center', justifyContent: 'center',
              minHeight: '66px', border: `2px solid ${dark}`,
            }}>
              <span style={{ fontSize: '9px', fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Screenshot 2
              </span>
            </div>
            <div style={{
              background: '#e8e3d9', display: 'flex', alignItems: 'center', justifyContent: 'center',
              minHeight: '66px', border: `2px solid ${dark}`,
            }}>
              <span style={{ fontSize: '9px', fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Screenshot 3
              </span>
            </div>
            <div style={{
              background: '#e8e3d9', display: 'flex', alignItems: 'center', justifyContent: 'center',
              minHeight: '66px', border: `2px solid ${dark}`,
            }}>
              <span style={{ fontSize: '9px', fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Screenshot 4
              </span>
            </div>
            <div style={{
              background: '#e8e3d9', display: 'flex', alignItems: 'center', justifyContent: 'center',
              minHeight: '66px', border: `2px solid ${dark}`,
            }}>
              <span style={{ fontSize: '9px', fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Screenshot 5
              </span>
            </div>
          </div>
        </div>

        {/* What's unique — horizontal strip */}
        <div style={{
          background: dark, padding: '18px 40px',
          display: 'flex', alignItems: 'center', gap: '24px',
        }}>
          <h3 style={{
            fontFamily: "'Fraunces', serif", fontSize: '14px', fontWeight: 900,
            color: yellow, margin: 0, whiteSpace: 'nowrap',
          }}>
            Co wyróżnia?
          </h3>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {[
              'DST vs DSmT obok siebie',
              'Wizualizacja konfliktów',
              'Kalkulator + ML w jednym',
              'Gotowe scenariusze',
            ].map((f, i) => (
              <span key={i} style={{
                fontSize: '10px', fontWeight: 500, color: cream,
                padding: '4px 10px', border: `1px solid rgba(245,240,230,0.25)`, borderRadius: '1px',
              }}>
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Tech stack */}
        <div style={{ padding: '18px 40px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: '10px', fontWeight: 700,
            letterSpacing: '3px', textTransform: 'uppercase', color: red, flexShrink: 0,
          }}>
            TECH
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {['React', 'FastAPI', 'Python', 'scikit-learn', 'NumPy', 'Tailwind', 'Vite'].map((t, i) => (
              <span key={i} style={{
                fontSize: '10px', fontWeight: 700, color: dark,
                padding: '3px 10px', background: i % 3 === 0 ? `${red}20` : i % 3 === 1 ? `${blue}15` : `${yellow}30`,
                borderRadius: '1px',
              }}>
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          marginTop: 'auto', padding: '14px 40px', borderTop: `3px solid ${dark}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
        }}>
          <div>
            <span style={{ fontSize: '9px', fontWeight: 700, color: '#888', letterSpacing: '1px', textTransform: 'uppercase', display: 'block' }}>
              Wydział Informatyki
            </span>
          </div>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '8px', color: '#999' }}>
              Praca wykonana w ramach przedmiotu: Inżynierski Projekt Zespołowy
            </span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '9px', color: '#888', display: 'block' }}>Autorzy: _______________</span>
            <span style={{ fontSize: '9px', color: '#888', display: 'block' }}>Opiekun: _______________</span>
          </div>
        </div>

        {/* Bottom color band */}
        <div style={{ display: 'flex', height: '6px', flexShrink: 0 }}>
          <div style={{ flex: 1, background: red }} />
          <div style={{ flex: 1, background: blue }} />
          <div style={{ flex: 1, background: yellow }} />
        </div>
      </div>
    </div>
  )
}

export default Poster3
