import { useEffect, useMemo } from 'react'

const FONTS = 'https://fonts.googleapis.com/css2?family=Outfit:wght@200;400;700;900&family=Newsreader:ital,wght@0,400;1,300;1,600&display=swap'

function seeded(seed) {
  let s = seed
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646 }
}

export default function Poster9() {
  useEffect(() => {
    const l = document.createElement('link'); l.href = FONTS; l.rel = 'stylesheet'
    document.head.appendChild(l); return () => document.head.removeChild(l)
  }, [])

  const bg = '#08090d'
  const star = '#e8dcc8'
  const gold = '#d4a847'
  const rose = '#c75b6a'
  const ice = '#6ba3c7'

  const nodes = useMemo(() => {
    const rng = seeded(42)
    return Array.from({ length: 35 }, (_, i) => ({
      x: 60 + rng() * 580,
      y: 60 + rng() * 860,
      r: 1.5 + rng() * 3,
      bright: rng() > 0.7,
    }))
  }, [])

  const edges = useMemo(() => {
    const result = []
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x
        const dy = nodes[i].y - nodes[j].y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 120) result.push({ from: i, to: j, dist })
      }
    }
    return result
  }, [nodes])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '2rem', background: '#000' }}>
      <div style={{
        width: '700px', height: '980px', background: bg,
        position: 'relative', overflow: 'hidden',
      }}>

        {/* Star field + connections SVG */}
        <svg style={{ position: 'absolute', inset: 0, zIndex: 0 }} viewBox="0 0 700 980">
          {edges.map((e, i) => (
            <line key={i}
              x1={nodes[e.from].x} y1={nodes[e.from].y}
              x2={nodes[e.to].x} y2={nodes[e.to].y}
              stroke={star} strokeWidth="0.4" opacity={0.12}
            />
          ))}
          {nodes.map((n, i) => (
            <g key={i}>
              {n.bright && <circle cx={n.x} cy={n.y} r={n.r * 4} fill={gold} opacity="0.04" />}
              <circle cx={n.x} cy={n.y} r={n.r} fill={n.bright ? gold : star} opacity={n.bright ? 0.8 : 0.35} />
            </g>
          ))}
        </svg>

        {/* Glowing cluster center */}
        <div style={{
          position: 'absolute', top: '280px', left: '200px',
          width: '300px', height: '300px',
          background: `radial-gradient(circle, ${gold}10 0%, transparent 60%)`,
          zIndex: 0,
        }} />

        {/* Content scattered around constellation */}
        <div style={{ position: 'relative', zIndex: 2, height: '100%' }}>

          {/* Top edge label */}
          <div style={{ position: 'absolute', top: '24px', left: '32px', right: '32px', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '9px', fontWeight: 400, letterSpacing: '3px', textTransform: 'uppercase', color: `${star}50` }}>
              Inzynierski Projekt Zespolowy
            </span>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '9px', fontWeight: 400, letterSpacing: '3px', color: `${gold}70` }}>
              2025
            </span>
          </div>

          {/* Title — big, centered on the constellation */}
          <div style={{ position: 'absolute', top: '70px', left: '0', right: '0', textAlign: 'center' }}>
            <h1 style={{
              fontFamily: "'Outfit', sans-serif", fontSize: '100px', fontWeight: 900,
              color: star, margin: 0, lineHeight: 0.85, letterSpacing: '-4px',
              textShadow: `0 0 60px ${gold}15`,
            }}>
              FUSION
            </h1>
            <h1 style={{
              fontFamily: "'Outfit', sans-serif", fontSize: '100px', fontWeight: 200,
              color: gold, margin: 0, lineHeight: 0.85, letterSpacing: '8px',
            }}>
              LAB
            </h1>
          </div>

          {/* Tagline — italic, floating below title */}
          <div style={{ position: 'absolute', top: '265px', left: '0', right: '0', textAlign: 'center' }}>
            <p style={{
              fontFamily: "'Newsreader', serif", fontSize: '20px', fontStyle: 'italic', fontWeight: 300,
              color: `${star}aa`, margin: 0, lineHeight: 1.4,
            }}>
              Laczenie niepewnych dowodow<br />w jedno spojne wnioskowanie.
            </p>
          </div>

          {/* Three floating info nodes — positioned around the constellation */}
          <div style={{
            position: 'absolute', top: '340px', left: '28px',
            width: '200px', padding: '18px',
            background: `${bg}cc`, border: `1px solid ${star}15`,
            borderRadius: '12px', backdropFilter: 'blur(8px)',
          }}>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '11px', fontWeight: 700, color: gold, margin: '0 0 6px', letterSpacing: '2px', textTransform: 'uppercase' }}>
              Czym jest?
            </h3>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '10px', fontWeight: 200, color: `${star}bb`, lineHeight: 1.6, margin: 0 }}>
              Platforma fuzji dowodow — Dempster-Shafer i DSmT (PCR5/6) w formie wizualnego narzedzia webowego.
            </p>
          </div>

          <div style={{
            position: 'absolute', top: '350px', right: '28px',
            width: '200px', padding: '18px',
            background: `${bg}cc`, border: `1px solid ${star}15`,
            borderRadius: '12px', backdropFilter: 'blur(8px)',
          }}>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '11px', fontWeight: 700, color: rose, margin: '0 0 6px', letterSpacing: '2px', textTransform: 'uppercase' }}>
              Jak dziala?
            </h3>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '10px', fontWeight: 200, color: `${star}bb`, lineHeight: 1.6, margin: 0 }}>
              Zrodla → Metoda fuzji → Rozwiazanie konfliktow → Wynik z pelna analiza i wizualizacja.
            </p>
          </div>

          <div style={{
            position: 'absolute', top: '490px', left: '50%', transform: 'translateX(-50%)',
            width: '220px', padding: '18px',
            background: `${bg}cc`, border: `1px solid ${star}15`,
            borderRadius: '12px', backdropFilter: 'blur(8px)',
          }}>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '11px', fontWeight: 700, color: ice, margin: '0 0 6px', letterSpacing: '2px', textTransform: 'uppercase' }}>
              Dla kogo?
            </h3>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '10px', fontWeight: 200, color: `${star}bb`, lineHeight: 1.6, margin: 0 }}>
              Badacze, studenci, data scientists — kazdy kto laczy niepewne dane z wielu zrodel.
            </p>
          </div>

          {/* Screenshots — floating panels in the dark */}
          <div style={{ position: 'absolute', top: '600px', left: '24px', right: '24px' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              {['Kalkulator Fuzji', 'ML Pipeline', 'Wyniki'].map((label, i) => (
                <div key={i} style={{
                  flex: 1, height: '80px',
                  background: `${star}06`, border: `1px solid ${star}12`,
                  borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transform: `rotate(${i === 1 ? 0 : i === 0 ? -1 : 1}deg)`,
                }}>
                  <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '8px', fontWeight: 400, color: `${star}40` }}>
                    Screenshot {i + 1} — {label}
                  </span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['DST vs DSmT', 'Przyklady'].map((label, i) => (
                <div key={i} style={{
                  flex: 1, height: '70px',
                  background: `${star}06`, border: `1px solid ${star}12`,
                  borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transform: `rotate(${i === 0 ? 1 : -0.5}deg)`,
                }}>
                  <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '8px', fontWeight: 400, color: `${star}40` }}>
                    Screenshot {i + 4} — {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Keywords — orbiting */}
          {[
            { text: 'Evidence Fusion', t: '805px', l: '32px', color: gold },
            { text: 'Machine Learning', t: '805px', l: '200px', color: rose },
            { text: 'Belief Functions', t: '805px', l: '390px', color: ice },
            { text: 'AI Pipeline', t: '805px', l: '560px', color: gold },
          ].map((kw, i) => (
            <span key={i} style={{
              position: 'absolute', top: kw.t, left: kw.l, zIndex: 3,
              fontFamily: "'Outfit', sans-serif", fontSize: '10px', fontWeight: 700,
              color: kw.color, letterSpacing: '1.5px', textTransform: 'uppercase',
              opacity: 0.7,
            }}>
              {kw.text}
            </span>
          ))}

          {/* Features — small scattered labels */}
          <div style={{
            position: 'absolute', top: '840px', left: '32px', right: '32px',
            display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center',
          }}>
            {['DST vs DSmT', 'Analiza konfliktow', 'Kalkulator + ML', 'Gotowe scenariusze', 'Real-time'].map((f, i) => (
              <span key={i} style={{
                fontFamily: "'Outfit', sans-serif", fontSize: '9px', fontWeight: 400,
                color: `${star}70`, padding: '3px 10px',
                border: `1px solid ${star}15`, borderRadius: '20px',
              }}>
                {f}
              </span>
            ))}
          </div>

          {/* Tech */}
          <div style={{
            position: 'absolute', top: '880px', left: '0', right: '0',
            display: 'flex', justifyContent: 'center', gap: '14px', alignItems: 'center',
          }}>
            {['React', 'FastAPI', 'Python', 'scikit-learn', 'NumPy', 'Tailwind', 'Vite'].map(t => (
              <span key={t} style={{ fontFamily: "'Outfit', sans-serif", fontSize: '9px', fontWeight: 200, color: `${star}50` }}>
                {t}
              </span>
            ))}
          </div>

          {/* Footer */}
          <div style={{
            position: 'absolute', bottom: '18px', left: '32px', right: '32px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
            borderTop: `1px solid ${star}10`, paddingTop: '10px',
          }}>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '8px', fontWeight: 400, color: `${star}50` }}>
              Wydzial Informatyki
            </span>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '7px', color: `${star}35` }}>
              Praca w ramach: Inzynierski Projekt Zespolowy
            </span>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '8px', color: `${star}50`, display: 'block' }}>Autorzy: _______________</span>
              <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '8px', color: `${star}50`, display: 'block' }}>Opiekun: _______________</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
