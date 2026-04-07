import { useEffect } from 'react'

const FONTS = 'https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,800;0,900;1,400&family=Figtree:wght@300;500;700&display=swap'

export default function Poster10() {
  useEffect(() => {
    const l = document.createElement('link'); l.href = FONTS; l.rel = 'stylesheet'
    document.head.appendChild(l); return () => document.head.removeChild(l)
  }, [])

  const cream = '#faf5eb'
  const charcoal = '#23201c'
  const terracotta = '#c4613a'
  const sage = '#6b8f71'
  const indigo = '#3b4980'
  const blush = '#e8c4b0'

  return (
    <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '2rem', background: '#d5d0c8' }}>
      <div style={{
        width: '700px', height: '980px', background: cream,
        position: 'relative', overflow: 'hidden',
      }}>

        {/* Layered translucent planes */}

        {/* Plane 1: large indigo rectangle, back layer */}
        <div style={{
          position: 'absolute', top: '80px', left: '-40px',
          width: '450px', height: '580px',
          background: indigo, opacity: 0.07,
          transform: 'rotate(-6deg)',
          borderRadius: '20px',
          zIndex: 0,
        }} />

        {/* Plane 2: sage rectangle, mid layer */}
        <div style={{
          position: 'absolute', top: '200px', right: '-60px',
          width: '400px', height: '500px',
          background: sage, opacity: 0.08,
          transform: 'rotate(4deg)',
          borderRadius: '16px',
          zIndex: 0,
        }} />

        {/* Plane 3: terracotta, front-ish */}
        <div style={{
          position: 'absolute', bottom: '100px', left: '60px',
          width: '350px', height: '300px',
          background: terracotta, opacity: 0.06,
          transform: 'rotate(-3deg)',
          borderRadius: '12px',
          zIndex: 0,
        }} />

        {/* Plane 4: blush circle, accent */}
        <div style={{
          position: 'absolute', top: '120px', right: '60px',
          width: '200px', height: '200px',
          borderRadius: '50%',
          background: blush, opacity: 0.2,
          zIndex: 0,
        }} />

        {/* Small geometric accents */}
        <div style={{
          position: 'absolute', top: '420px', left: '40px',
          width: '40px', height: '40px',
          border: `2px solid ${terracotta}`,
          borderRadius: '50%', opacity: 0.3, zIndex: 1,
        }} />
        <div style={{
          position: 'absolute', top: '380px', left: '70px',
          width: '20px', height: '20px',
          background: sage, borderRadius: '50%', opacity: 0.25, zIndex: 1,
        }} />
        <div style={{
          position: 'absolute', top: '440px', right: '120px',
          width: '60px', height: '3px',
          background: indigo, opacity: 0.2, zIndex: 1,
          transform: 'rotate(25deg)',
        }} />

        {/* Content — layered at different visual depths */}
        <div style={{ position: 'relative', zIndex: 2, height: '100%' }}>

          {/* Top label */}
          <div style={{
            position: 'absolute', top: '28px', left: '40px', right: '40px',
            display: 'flex', justifyContent: 'space-between',
          }}>
            <span style={{ fontFamily: "'Figtree', sans-serif", fontSize: '9px', fontWeight: 500, letterSpacing: '3px', textTransform: 'uppercase', color: '#999' }}>
              Inzynierski Projekt Zespolowy
            </span>
            <span style={{ fontFamily: "'Figtree', sans-serif", fontSize: '9px', fontWeight: 500, letterSpacing: '3px', color: terracotta }}>
              2025
            </span>
          </div>

          {/* Title — stacked with depth effect */}
          <div style={{ position: 'absolute', top: '72px', left: '40px' }}>
            {/* Shadow layer */}
            <h1 style={{
              fontFamily: "'Fraunces', serif", fontSize: '80px', fontWeight: 900,
              color: 'transparent', margin: 0, lineHeight: 0.9,
              WebkitTextStroke: `1.5px ${charcoal}15`,
              letterSpacing: '-2px',
              position: 'absolute', top: '6px', left: '6px',
            }}>
              Fusion<br />Lab
            </h1>
            {/* Main layer */}
            <h1 style={{
              fontFamily: "'Fraunces', serif", fontSize: '80px', fontWeight: 900,
              color: charcoal, margin: 0, lineHeight: 0.9,
              letterSpacing: '-2px', position: 'relative',
            }}>
              Fusion<br />Lab
            </h1>
          </div>

          {/* Side annotation */}
          <div style={{
            position: 'absolute', top: '90px', right: '40px',
            maxWidth: '220px', textAlign: 'right',
          }}>
            <span style={{
              fontFamily: "'Fraunces', serif", fontSize: '16px', fontStyle: 'italic',
              color: terracotta, lineHeight: 1.4,
            }}>
              evidence fusion workspace
            </span>
          </div>

          {/* Tagline — italic, placed in the space between title and content */}
          <div style={{
            position: 'absolute', top: '260px', left: '40px', right: '40px',
          }}>
            <p style={{
              fontFamily: "'Fraunces', serif", fontSize: '22px', fontStyle: 'italic', fontWeight: 400,
              color: charcoal, lineHeight: 1.35, margin: 0, maxWidth: '440px',
            }}>
              Zamieniamy zlozonosc teorii matematycznej
              w&nbsp;czytelne, wizualne doswiadczenie.
            </p>
            <div style={{ width: '60px', height: '3px', background: terracotta, marginTop: '16px', borderRadius: '2px' }} />
          </div>

          {/* Floating content blocks at different "depths" */}
          {/* Block 1 — front layer, strong */}
          <div style={{
            position: 'absolute', top: '360px', left: '40px',
            width: '260px', padding: '20px',
            background: `${cream}ee`,
            borderLeft: `3px solid ${terracotta}`,
            boxShadow: '8px 8px 30px rgba(0,0,0,0.04)',
          }}>
            <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: '15px', fontWeight: 800, color: charcoal, margin: '0 0 8px' }}>
              Co robimy?
            </h3>
            <p style={{ fontFamily: "'Figtree', sans-serif", fontSize: '11px', fontWeight: 300, color: '#444', lineHeight: 1.65, margin: 0 }}>
              Platforma Dempster-Shafer & DSmT (PCR5/6).
              Kalkulator Fuzji reczny + automatyczny
              Pipeline Machine Learning w jednym interfejsie.
            </p>
          </div>

          {/* Block 2 — mid layer, offset */}
          <div style={{
            position: 'absolute', top: '380px', right: '36px',
            width: '240px', padding: '18px',
            background: `${cream}dd`,
            borderLeft: `3px solid ${sage}`,
            boxShadow: '6px 6px 24px rgba(0,0,0,0.03)',
          }}>
            <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: '15px', fontWeight: 800, color: charcoal, margin: '0 0 8px' }}>
              Dla kogo?
            </h3>
            <p style={{ fontFamily: "'Figtree', sans-serif", fontSize: '11px', fontWeight: 300, color: '#444', lineHeight: 1.65, margin: 0 }}>
              Badacze prototypujacy reguly fuzji.
              Studenci uczacy sie DST/DSmT.
              Data Scientists stosujacy ensemble fusion.
            </p>
          </div>

          {/* Block 3 — back layer, deeper */}
          <div style={{
            position: 'absolute', top: '520px', left: '120px',
            width: '280px', padding: '18px',
            background: `${cream}cc`,
            borderLeft: `3px solid ${indigo}`,
            boxShadow: '4px 4px 20px rgba(0,0,0,0.02)',
          }}>
            <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: '15px', fontWeight: 800, color: charcoal, margin: '0 0 8px' }}>
              Co wyroznia?
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {['DST vs DSmT — porownanie obok siebie', 'Wizualna analiza konfliktow', 'Kalkulator + ML Pipeline w jednym', 'Gotowe scenariusze testowe'].map((f, i) => (
                <span key={i} style={{
                  fontFamily: "'Figtree', sans-serif", fontSize: '10px', fontWeight: 300, color: '#555', lineHeight: 1.5,
                }}>
                  {['●', '◆', '▲', '■'][i % 4]}{' '}{f}
                </span>
              ))}
            </div>
          </div>

          {/* Screenshots — layered cards with depth shadows */}
          <div style={{ position: 'absolute', top: '640px', left: '32px', right: '32px' }}>
            <div style={{ position: 'relative', height: '170px' }}>
              {[
                { w: 220, h: 120, t: 0, l: 0, rot: -2, label: 'Screenshot 1 — Kalkulator', depth: 4 },
                { w: 200, h: 110, t: 15, l: 180, rot: 1.5, label: 'Screenshot 2 — ML Pipeline', depth: 3 },
                { w: 185, h: 105, t: 5, l: 390, rot: -1, label: 'Screenshot 3 — Wyniki', depth: 2 },
                { w: 240, h: 95, t: 80, l: 50, rot: 1, label: 'Screenshot 4 — DST vs DSmT', depth: 5 },
                { w: 210, h: 90, t: 85, l: 320, rot: -1.5, label: 'Screenshot 5 — Przyklady', depth: 1 },
              ].map((s, i) => (
                <div key={i} style={{
                  position: 'absolute', top: s.t, left: s.l,
                  width: s.w, height: s.h,
                  transform: `rotate(${s.rot}deg)`,
                  background: `${cream}${90 - s.depth * 8}`,
                  border: `1px solid ${charcoal}12`,
                  borderRadius: '6px',
                  boxShadow: `${s.depth * 2}px ${s.depth * 2}px ${s.depth * 6}px rgba(0,0,0,${0.02 + s.depth * 0.01})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  zIndex: s.depth,
                }}>
                  <span style={{ fontFamily: "'Figtree', sans-serif", fontSize: '8px', fontWeight: 500, color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Keywords — diagonal band */}
          <div style={{
            position: 'absolute', bottom: '100px', left: '0', right: '0',
            display: 'flex', justifyContent: 'center', gap: '20px',
            transform: 'rotate(-2deg)',
            padding: '10px 0',
          }}>
            {[
              { text: 'Evidence Fusion', color: terracotta },
              { text: 'Machine Learning', color: sage },
              { text: 'Belief Functions', color: indigo },
              { text: 'AI Pipeline', color: terracotta },
            ].map((kw, i) => (
              <span key={i} style={{
                fontFamily: "'Fraunces', serif", fontSize: '11px', fontWeight: 800,
                color: kw.color, letterSpacing: '1px', textTransform: 'uppercase',
              }}>
                {kw.text}
              </span>
            ))}
          </div>

          {/* Tech */}
          <div style={{
            position: 'absolute', bottom: '62px', left: '40px', right: '40px',
            display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <span style={{ fontFamily: "'Fraunces', serif", fontSize: '10px', fontWeight: 800, color: charcoal, letterSpacing: '2px', textTransform: 'uppercase' }}>
              Tech:
            </span>
            <div style={{ height: '1px', width: '20px', background: '#ccc' }} />
            {['React', 'FastAPI', 'Python', 'scikit-learn', 'NumPy', 'Tailwind', 'Vite'].map(t => (
              <span key={t} style={{ fontFamily: "'Figtree', sans-serif", fontSize: '10px', fontWeight: 300, color: '#777' }}>
                {t}
              </span>
            ))}
          </div>

          {/* Footer */}
          <div style={{
            position: 'absolute', bottom: '20px', left: '40px', right: '40px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
            borderTop: '1px solid #e0dbd3', paddingTop: '10px',
          }}>
            <span style={{ fontFamily: "'Figtree', sans-serif", fontSize: '8px', fontWeight: 500, color: '#999' }}>
              Wydzial Informatyki
            </span>
            <span style={{ fontFamily: "'Figtree', sans-serif", fontSize: '7px', color: '#bbb' }}>
              Praca w ramach: Inzynierski Projekt Zespolowy
            </span>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontFamily: "'Figtree', sans-serif", fontSize: '8px', color: '#999', display: 'block' }}>Autorzy: _______________</span>
              <span style={{ fontFamily: "'Figtree', sans-serif", fontSize: '8px', color: '#999', display: 'block' }}>Opiekun: _______________</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
