import { useEffect } from 'react'

const FONTS = 'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Instrument+Serif:ital@0;1&family=Figtree:wght@300;600&display=swap'

export default function Poster6() {
  useEffect(() => {
    const l = document.createElement('link'); l.href = FONTS; l.rel = 'stylesheet'
    document.head.appendChild(l); return () => document.head.removeChild(l)
  }, [])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '2rem', background: '#1a1716' }}>
      <div style={{
        width: '700px', height: '980px', background: '#f4f0e8',
        position: 'relative', overflow: 'hidden',
      }}>

        {/* Giant diagonal accent slab */}
        <div style={{
          position: 'absolute', top: '-80px', left: '-60px',
          width: '500px', height: '260px',
          background: '#d1432a', transform: 'rotate(-8deg)',
          transformOrigin: 'top left', zIndex: 1,
        }} />

        {/* Merging circles — the fusion metaphor */}
        <svg style={{ position: 'absolute', top: '60px', right: '-20px', zIndex: 2 }} width="380" height="380" viewBox="0 0 380 380">
          <circle cx="140" cy="190" r="130" fill="none" stroke="#1a1716" strokeWidth="3" />
          <circle cx="240" cy="190" r="130" fill="none" stroke="#d1432a" strokeWidth="3" />
          <circle cx="190" cy="140" r="130" fill="none" stroke="#2a6e4d" strokeWidth="3" opacity="0.6" />
          {/* Intersection fill */}
          <circle cx="190" cy="180" r="40" fill="#d1432a" opacity="0.12" />
        </svg>

        {/* Title on the diagonal slab */}
        <div style={{
          position: 'absolute', top: '28px', left: '36px', zIndex: 3,
          transform: 'rotate(-8deg)', transformOrigin: 'top left',
        }}>
          <h1 style={{
            fontFamily: "'Bebas Neue', sans-serif", fontSize: '120px',
            color: '#f4f0e8', margin: 0, lineHeight: 0.85, letterSpacing: '4px',
          }}>
            FUSION
          </h1>
          <h1 style={{
            fontFamily: "'Bebas Neue', sans-serif", fontSize: '120px',
            color: '#f4f0e8', margin: 0, lineHeight: 0.85, letterSpacing: '4px',
            opacity: 0.4,
          }}>
            LAB
          </h1>
        </div>

        {/* Small rotated label top-right */}
        <div style={{
          position: 'absolute', top: '16px', right: '24px', zIndex: 4,
          transform: 'rotate(90deg)', transformOrigin: 'top right',
        }}>
          <span style={{ fontFamily: "'Figtree', sans-serif", fontSize: '9px', fontWeight: 600, letterSpacing: '3px', textTransform: 'uppercase', color: '#888' }}>
            Inzynierski Projekt Zespolowy 2025
          </span>
        </div>

        {/* Main content area — positioned absolutely, free-form */}

        {/* Tagline — italic, placed across the middle-left */}
        <div style={{
          position: 'absolute', top: '310px', left: '40px', zIndex: 4, maxWidth: '300px',
        }}>
          <p style={{
            fontFamily: "'Instrument Serif', serif", fontSize: '26px', fontStyle: 'italic',
            color: '#1a1716', lineHeight: 1.3, margin: 0,
          }}>
            Zlozoną teorie matematyczną zamieniamy w&nbsp;proste, wizualne narzedzie.
          </p>
          <div style={{ width: '50px', height: '3px', background: '#d1432a', marginTop: '14px' }} />
        </div>

        {/* "What" block — floating right side */}
        <div style={{
          position: 'absolute', top: '440px', right: '32px', zIndex: 4,
          maxWidth: '260px', textAlign: 'right',
        }}>
          <h2 style={{
            fontFamily: "'Bebas Neue', sans-serif", fontSize: '28px',
            color: '#d1432a', margin: '0 0 8px 0', letterSpacing: '2px',
          }}>
            CO ROBIMY?
          </h2>
          <p style={{
            fontFamily: "'Figtree', sans-serif", fontSize: '12px', fontWeight: 300,
            color: '#3a3632', lineHeight: 1.65, margin: 0,
          }}>
            Platforma do fuzji dowodów: Dempster-Shafer i&nbsp;DSmT&nbsp;(PCR5/6).
            Kalkulator Fuzji + Pipeline Machine Learning
            w jednym intuicyjnym interfejsie.
          </p>
        </div>

        {/* Screenshots — scattered, overlapping, with shadows */}
        <div style={{
          position: 'absolute', top: '430px', left: '32px', zIndex: 3,
          width: '200px', height: '120px', background: '#ddd8ce',
          border: '2px solid #1a1716', boxShadow: '6px 6px 0 #1a1716',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transform: 'rotate(-3deg)',
        }}>
          <span style={{ fontFamily: "'Figtree', sans-serif", fontSize: '9px', fontWeight: 600, color: '#999', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Screenshot 1 — Kalkulator
          </span>
        </div>

        <div style={{
          position: 'absolute', top: '505px', left: '110px', zIndex: 5,
          width: '175px', height: '105px', background: '#ddd8ce',
          border: '2px solid #1a1716', boxShadow: '6px 6px 0 #d1432a',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transform: 'rotate(2deg)',
        }}>
          <span style={{ fontFamily: "'Figtree', sans-serif", fontSize: '9px', fontWeight: 600, color: '#999', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Screenshot 2 — ML Pipeline
          </span>
        </div>

        <div style={{
          position: 'absolute', top: '570px', left: '20px', zIndex: 4,
          width: '155px', height: '95px', background: '#ddd8ce',
          border: '2px solid #1a1716', boxShadow: '4px 4px 0 #2a6e4d',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transform: 'rotate(-1deg)',
        }}>
          <span style={{ fontFamily: "'Figtree', sans-serif", fontSize: '8px', fontWeight: 600, color: '#999', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Screenshot 3 — Wyniki
          </span>
        </div>

        <div style={{
          position: 'absolute', top: '630px', right: '40px', zIndex: 4,
          width: '240px', height: '100px', background: '#ddd8ce',
          border: '2px solid #1a1716', boxShadow: '6px 6px 0 #1a1716',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transform: 'rotate(1.5deg)',
        }}>
          <span style={{ fontFamily: "'Figtree', sans-serif", fontSize: '9px', fontWeight: 600, color: '#999', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Screenshot 4 — DST vs DSmT
          </span>
        </div>

        <div style={{
          position: 'absolute', top: '700px', left: '60px', zIndex: 5,
          width: '200px', height: '90px', background: '#ddd8ce',
          border: '2px solid #d1432a', boxShadow: '5px 5px 0 #1a1716',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transform: 'rotate(-2deg)',
        }}>
          <span style={{ fontFamily: "'Figtree', sans-serif", fontSize: '8px', fontWeight: 600, color: '#999', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Screenshot 5 — Przyklady
          </span>
        </div>

        {/* Audience — vertical text along left edge */}
        <div style={{
          position: 'absolute', bottom: '200px', left: '12px', zIndex: 4,
          transform: 'rotate(-90deg)', transformOrigin: 'bottom left',
          whiteSpace: 'nowrap',
        }}>
          <span style={{
            fontFamily: "'Bebas Neue', sans-serif", fontSize: '14px',
            color: '#888', letterSpacing: '4px',
          }}>
            BADACZE / STUDENCI / DATA SCIENTISTS
          </span>
        </div>

        {/* Keywords — scattered at angles */}
        {[
          { text: 'EVIDENCE FUSION', top: '385px', left: '40px', rot: '-2deg', color: '#d1432a' },
          { text: 'MACHINE LEARNING', top: '400px', left: '200px', rot: '1deg', color: '#2a6e4d' },
          { text: 'BELIEF FUNCTIONS', top: '810px', right: '30px', rot: '3deg', color: '#1a1716' },
          { text: 'AI PIPELINE', top: '795px', right: '220px', rot: '-1deg', color: '#d1432a' },
        ].map((kw, i) => (
          <span key={i} style={{
            position: 'absolute', top: kw.top, left: kw.left, right: kw.right,
            zIndex: 6, transform: `rotate(${kw.rot})`,
            fontFamily: "'Bebas Neue', sans-serif", fontSize: '13px',
            color: kw.color, letterSpacing: '3px',
            background: kw.color === '#d1432a' ? 'rgba(209,67,42,0.08)' : kw.color === '#2a6e4d' ? 'rgba(42,110,77,0.08)' : 'rgba(26,23,22,0.06)',
            padding: '3px 8px',
          }}>
            {kw.text}
          </span>
        ))}

        {/* Tech stack — horizontal bar near bottom */}
        <div style={{
          position: 'absolute', bottom: '70px', left: '0', right: '0', zIndex: 6,
          background: '#1a1716', padding: '12px 40px',
          display: 'flex', alignItems: 'center', gap: '18px',
        }}>
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '16px', color: '#d1432a', letterSpacing: '3px' }}>
            TECH:
          </span>
          {['React', 'FastAPI', 'Python', 'scikit-learn', 'NumPy', 'Tailwind', 'Vite'].map(t => (
            <span key={t} style={{ fontFamily: "'Figtree', sans-serif", fontSize: '11px', fontWeight: 600, color: '#f4f0e8' }}>
              {t}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          position: 'absolute', bottom: '16px', left: '40px', right: '40px', zIndex: 6,
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
        }}>
          <span style={{ fontFamily: "'Figtree', sans-serif", fontSize: '8px', fontWeight: 600, color: '#999' }}>
            Wydzial Informatyki
          </span>
          <span style={{ fontFamily: "'Figtree', sans-serif", fontSize: '7px', color: '#bbb' }}>
            Inzynierski Projekt Zespolowy, 2025
          </span>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontFamily: "'Figtree', sans-serif", fontSize: '8px', color: '#999', display: 'block' }}>Autorzy: _______________</span>
            <span style={{ fontFamily: "'Figtree', sans-serif", fontSize: '8px', color: '#999', display: 'block' }}>Opiekun: _______________</span>
          </div>
        </div>

      </div>
    </div>
  )
}
