import { useEffect } from 'react'

const FONTS = 'https://fonts.googleapis.com/css2?family=Archivo+Black&family=Lora:ital,wght@0,400;0,700;1,400&family=Urbanist:wght@300;500&display=swap'

export default function Poster8() {
  useEffect(() => {
    const l = document.createElement('link'); l.href = FONTS; l.rel = 'stylesheet'
    document.head.appendChild(l); return () => document.head.removeChild(l)
  }, [])

  const raw = '#e8e2d8'
  const ink = '#1c1a17'
  const red = '#c43322'
  const blue = '#264d8c'

  return (
    <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '2rem', background: '#2a2724' }}>
      <div style={{
        width: '700px', height: '980px', background: raw,
        position: 'relative', overflow: 'hidden',
      }}>

        {/* Torn/broken grid blocks */}
        {/* Big red block — top right, slightly off-canvas */}
        <div style={{
          position: 'absolute', top: '-20px', right: '-30px',
          width: '320px', height: '200px', background: red,
          transform: 'rotate(3deg)', zIndex: 1,
        }} />

        {/* Blue block — mid left, overlapping */}
        <div style={{
          position: 'absolute', top: '360px', left: '-40px',
          width: '280px', height: '160px', background: blue,
          transform: 'rotate(-5deg)', zIndex: 1,
        }} />

        {/* Dark block — bottom right */}
        <div style={{
          position: 'absolute', bottom: '60px', right: '-20px',
          width: '350px', height: '140px', background: ink,
          transform: 'rotate(2deg)', zIndex: 1,
        }} />

        {/* Thick crossed lines */}
        <div style={{
          position: 'absolute', top: '180px', left: '0', right: '0',
          height: '4px', background: ink, zIndex: 2,
          transform: 'rotate(-1deg)',
        }} />
        <div style={{
          position: 'absolute', top: '0', bottom: '0', left: '260px',
          width: '3px', background: ink, zIndex: 2,
          transform: 'rotate(2deg)',
        }} />

        {/* Content — placed freely across broken grid */}

        {/* Title — huge, breaking across the red block */}
        <div style={{ position: 'absolute', top: '20px', left: '32px', zIndex: 5 }}>
          <h1 style={{
            fontFamily: "'Archivo Black', sans-serif", fontSize: '84px',
            color: raw, margin: 0, lineHeight: 0.9, letterSpacing: '-2px',
            mixBlendMode: 'difference',
          }}>
            FUS
          </h1>
          <h1 style={{
            fontFamily: "'Archivo Black', sans-serif", fontSize: '84px',
            color: ink, margin: 0, lineHeight: 0.9, letterSpacing: '-2px',
          }}>
            ION
          </h1>
        </div>

        <div style={{
          position: 'absolute', top: '22px', right: '50px', zIndex: 5,
          transform: 'rotate(3deg)',
        }}>
          <h1 style={{
            fontFamily: "'Archivo Black', sans-serif", fontSize: '56px',
            color: raw, margin: 0, lineHeight: 1,
            textShadow: `2px 2px 0 ${ink}`,
          }}>
            LAB
          </h1>
        </div>

        {/* Subtitle — italic, placed at an angle across the divider line */}
        <div style={{
          position: 'absolute', top: '195px', left: '40px', zIndex: 5,
          transform: 'rotate(-1deg)', maxWidth: '400px',
        }}>
          <p style={{
            fontFamily: "'Lora', serif", fontSize: '19px', fontStyle: 'italic',
            color: ink, lineHeight: 1.4, margin: 0,
          }}>
            Teoria fuzji dowodow — Dempster-Shafer & DSmT — <span style={{ color: red, fontWeight: 700, fontStyle: 'normal', fontFamily: "'Archivo Black', sans-serif", fontSize: '16px' }}>w Twoich rekach.</span>
          </p>
        </div>

        {/* Info block — sitting on the blue block */}
        <div style={{
          position: 'absolute', top: '295px', left: '280px', zIndex: 5,
          maxWidth: '370px',
        }}>
          <h2 style={{
            fontFamily: "'Archivo Black', sans-serif", fontSize: '22px',
            color: ink, margin: '0 0 8px', letterSpacing: '1px',
          }}>
            CO ROBIMY?
          </h2>
          <p style={{
            fontFamily: "'Urbanist', sans-serif", fontSize: '12px', fontWeight: 300,
            color: '#3a3632', lineHeight: 1.7, margin: '0 0 10px',
          }}>
            Platforma webowa do fuzji dowodow. Dwa tryby:
            reczny Kalkulator Fuzji oraz automatyczny
            Pipeline Machine Learning z ensemble classifiers.
          </p>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {['Evidence Fusion', 'Machine Learning', 'AI', 'Belief Functions'].map(k => (
              <span key={k} style={{
                fontFamily: "'Archivo Black', sans-serif", fontSize: '9px',
                color: red, letterSpacing: '1px', textTransform: 'uppercase',
                padding: '2px 6px', border: `2px solid ${red}`,
              }}>
                {k}
              </span>
            ))}
          </div>
        </div>

        {/* Audience — on the blue block, white text, rotated */}
        <div style={{
          position: 'absolute', top: '380px', left: '20px', zIndex: 5,
          transform: 'rotate(-5deg)', maxWidth: '220px',
        }}>
          <h3 style={{
            fontFamily: "'Archivo Black', sans-serif", fontSize: '14px',
            color: raw, margin: '0 0 8px', letterSpacing: '2px',
          }}>
            DLA KOGO?
          </h3>
          {['BADACZE', 'STUDENCI', 'DATA SCIENTISTS'].map(a => (
            <span key={a} style={{
              fontFamily: "'Archivo Black', sans-serif", fontSize: '11px',
              color: raw, display: 'block', marginBottom: '3px',
              letterSpacing: '2px', opacity: 0.85,
            }}>
              → {a}
            </span>
          ))}
        </div>

        {/* Screenshots — raw, stacked, overlapping with rough borders */}
        {[
          { w: 230, h: 130, t: 500, l: 30, rot: -3, z: 4, label: 'Screenshot 1 — Kalkulator', shadow: ink },
          { w: 200, h: 115, t: 530, l: 220, rot: 2, z: 5, label: 'Screenshot 2 — ML Pipeline', shadow: red },
          { w: 190, h: 110, t: 560, l: 440, rot: -1.5, z: 4, label: 'Screenshot 3 — Wyniki', shadow: blue },
          { w: 250, h: 105, t: 640, l: 60, rot: 1.5, z: 6, label: 'Screenshot 4 — DST vs DSmT', shadow: ink },
          { w: 210, h: 100, t: 660, l: 350, rot: -2.5, z: 5, label: 'Screenshot 5 — Przyklady', shadow: red },
        ].map((s, i) => (
          <div key={i} style={{
            position: 'absolute', top: s.t, left: s.l,
            width: s.w, height: s.h,
            transform: `rotate(${s.rot}deg)`, zIndex: s.z,
            background: '#d8d2c6', border: `3px solid ${ink}`,
            boxShadow: `5px 5px 0 ${s.shadow}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{
              fontFamily: "'Urbanist', sans-serif", fontSize: '9px', fontWeight: 500,
              color: '#999', letterSpacing: '0.5px', textTransform: 'uppercase',
            }}>
              {s.label}
            </span>
          </div>
        ))}

        {/* Features — scattered text at angles */}
        {[
          { text: 'DST VS DSmT', t: '770px', l: '30px', rot: '-4deg', size: '16px' },
          { text: 'WIZUALIZACJA KONFLIKTOW', t: '790px', l: '180px', rot: '1deg', size: '12px' },
          { text: 'KALKULATOR + ML', t: '812px', l: '40px', rot: '2deg', size: '14px' },
          { text: 'REAL-TIME', t: '808px', l: '390px', rot: '-3deg', size: '18px' },
          { text: 'GOTOWE SCENARIUSZE', t: '835px', l: '200px', rot: '-1deg', size: '11px' },
        ].map((f, i) => (
          <span key={i} style={{
            position: 'absolute', top: f.t, left: f.l, zIndex: 7,
            transform: `rotate(${f.rot})`,
            fontFamily: "'Archivo Black', sans-serif", fontSize: f.size,
            color: i % 2 === 0 ? ink : red, letterSpacing: '1px',
          }}>
            {f.text}
          </span>
        ))}

        {/* Tech — on the dark block, bottom right */}
        <div style={{
          position: 'absolute', bottom: '78px', right: '20px', zIndex: 5,
          transform: 'rotate(2deg)', display: 'flex', gap: '10px', alignItems: 'center',
        }}>
          <span style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '10px', color: red, letterSpacing: '2px' }}>
            TECH:
          </span>
          {['React', 'FastAPI', 'Python', 'scikit-learn', 'NumPy'].map(t => (
            <span key={t} style={{ fontFamily: "'Urbanist', sans-serif", fontSize: '10px', fontWeight: 300, color: raw }}>
              {t}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          position: 'absolute', bottom: '12px', left: '32px', right: '32px', zIndex: 8,
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
        }}>
          <span style={{ fontFamily: "'Urbanist', sans-serif", fontSize: '8px', fontWeight: 500, color: '#999' }}>
            Wydzial Informatyki
          </span>
          <span style={{ fontFamily: "'Urbanist', sans-serif", fontSize: '7px', color: '#bbb' }}>
            Inzynierski Projekt Zespolowy, 2025
          </span>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontFamily: "'Urbanist', sans-serif", fontSize: '8px', color: '#999', display: 'block' }}>Autorzy: _______________</span>
            <span style={{ fontFamily: "'Urbanist', sans-serif", fontSize: '8px', color: '#999', display: 'block' }}>Opiekun: _______________</span>
          </div>
        </div>

      </div>
    </div>
  )
}
