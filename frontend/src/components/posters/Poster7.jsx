import { useEffect } from 'react'

const FONTS = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,700;1,400&family=Onest:wght@300;500;700;900&display=swap'

export default function Poster7() {
  useEffect(() => {
    const l = document.createElement('link'); l.href = FONTS; l.rel = 'stylesheet'
    document.head.appendChild(l); return () => document.head.removeChild(l)
  }, [])

  const deepBlue = '#0b1d3a'
  const coral = '#e05c45'
  const sand = '#f0e6d3'
  const mint = '#5dbda4'

  return (
    <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '2rem', background: '#080e18' }}>
      <div style={{
        width: '700px', height: '980px', background: deepBlue,
        position: 'relative', overflow: 'hidden',
      }}>

        {/* Flowing wave layers — SVG curves */}
        <svg style={{ position: 'absolute', inset: 0, zIndex: 0 }} viewBox="0 0 700 980" preserveAspectRatio="none">
          <path d="M0,200 C150,120 350,320 700,180 L700,980 L0,980 Z" fill={coral} opacity="0.06" />
          <path d="M0,400 C200,320 400,500 700,360 L700,980 L0,980 Z" fill={mint} opacity="0.06" />
          <path d="M0,600 C180,540 500,680 700,560 L700,980 L0,980 Z" fill={sand} opacity="0.04" />

          {/* Flowing lines */}
          <path d="M-20,250 C160,180 340,350 720,220" fill="none" stroke={coral} strokeWidth="1.5" opacity="0.3" />
          <path d="M-20,270 C180,200 360,370 720,240" fill="none" stroke={coral} strokeWidth="0.5" opacity="0.2" />
          <path d="M-20,450 C200,380 420,530 720,400" fill="none" stroke={mint} strokeWidth="1.5" opacity="0.3" />
          <path d="M-20,470 C220,400 440,550 720,420" fill="none" stroke={mint} strokeWidth="0.5" opacity="0.2" />
          <path d="M-20,650 C170,590 490,710 720,600" fill="none" stroke={sand} strokeWidth="1" opacity="0.2" />
        </svg>

        {/* Floating orbs */}
        <div style={{
          position: 'absolute', top: '120px', right: '80px', width: '180px', height: '180px',
          borderRadius: '50%', background: `radial-gradient(circle at 40% 40%, ${coral}30, transparent 70%)`,
          border: `1px solid ${coral}30`, zIndex: 1,
        }} />
        <div style={{
          position: 'absolute', top: '200px', right: '160px', width: '120px', height: '120px',
          borderRadius: '50%', background: `radial-gradient(circle at 40% 40%, ${mint}25, transparent 70%)`,
          border: `1px solid ${mint}25`, zIndex: 1,
        }} />
        <div style={{
          position: 'absolute', top: '160px', right: '50px', width: '80px', height: '80px',
          borderRadius: '50%', background: `radial-gradient(circle at 40% 40%, ${sand}20, transparent 70%)`,
          border: `1px solid ${sand}20`, zIndex: 1,
        }} />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>

          {/* Top label */}
          <div style={{ padding: '28px 40px 0', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: "'Onest', sans-serif", fontSize: '9px', fontWeight: 500, letterSpacing: '3px', textTransform: 'uppercase', color: `${sand}80` }}>
              Inzynierski Projekt Zespolowy
            </span>
            <span style={{ fontFamily: "'Onest', sans-serif", fontSize: '9px', fontWeight: 500, letterSpacing: '3px', color: `${coral}aa` }}>
              2025
            </span>
          </div>

          {/* Title — large, left-aligned, organic spacing */}
          <div style={{ padding: '50px 40px 0' }}>
            <h1 style={{
              fontFamily: "'Onest', sans-serif", fontSize: '72px', fontWeight: 900,
              color: sand, margin: 0, lineHeight: 0.9, letterSpacing: '-3px',
            }}>
              Fusion
            </h1>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px' }}>
              <h1 style={{
                fontFamily: "'Onest', sans-serif", fontSize: '72px', fontWeight: 900,
                color: coral, margin: 0, lineHeight: 0.9, letterSpacing: '-3px',
              }}>
                Lab
              </h1>
              <span style={{
                fontFamily: "'Cormorant Garamond', serif", fontSize: '20px', fontStyle: 'italic',
                color: `${sand}99`,
              }}>
                evidence fusion workspace
              </span>
            </div>
          </div>

          {/* Tagline — flowing across the wave area */}
          <div style={{ padding: '40px 40px 0', maxWidth: '380px' }}>
            <p style={{
              fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', fontStyle: 'italic',
              color: sand, lineHeight: 1.4, margin: 0,
            }}>
              Matematyka fuzji dowodow staje sie prosta,
              wizualna i&nbsp;<span style={{ color: coral }}>dostepna.</span>
            </p>
          </div>

          {/* Mid section — floating info blocks on the waves */}
          <div style={{ padding: '36px 40px 0', display: 'flex', gap: '16px' }}>
            {/* Left block */}
            <div style={{
              flex: 1, padding: '20px', borderRadius: '16px',
              background: 'rgba(240,230,211,0.06)', backdropFilter: 'blur(10px)',
              border: '1px solid rgba(240,230,211,0.1)',
            }}>
              <h3 style={{ fontFamily: "'Onest', sans-serif", fontSize: '12px', fontWeight: 700, color: coral, margin: '0 0 10px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                Czym jest?
              </h3>
              <p style={{ fontFamily: "'Onest', sans-serif", fontSize: '11px', fontWeight: 300, color: `${sand}cc`, lineHeight: 1.6, margin: 0 }}>
                Platforma webowa upraszczajaca teorie
                Dempster-Shafer i&nbsp;DSmT (PCR5/6).
                Kalkulator Fuzji + ML Pipeline.
              </p>
            </div>
            {/* Right block */}
            <div style={{
              flex: 1, padding: '20px', borderRadius: '16px',
              background: 'rgba(93,189,164,0.06)', backdropFilter: 'blur(10px)',
              border: '1px solid rgba(93,189,164,0.1)',
            }}>
              <h3 style={{ fontFamily: "'Onest', sans-serif", fontSize: '12px', fontWeight: 700, color: mint, margin: '0 0 10px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                Dla kogo?
              </h3>
              <p style={{ fontFamily: "'Onest', sans-serif", fontSize: '11px', fontWeight: 300, color: `${sand}cc`, lineHeight: 1.6, margin: 0 }}>
                Badacze, studenci, data scientists —
                kazdy, kto pracuje z niepewnymi
                danymi i potrzebuje fuzji dowodow.
              </p>
            </div>
          </div>

          {/* How it works — curved flow */}
          <div style={{ padding: '24px 40px 0' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              padding: '14px 20px', borderRadius: '40px',
              background: 'rgba(240,230,211,0.04)', border: '1px solid rgba(240,230,211,0.08)',
            }}>
              {['Zrodla', 'Metoda', 'Fuzja', 'Wynik'].map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <div style={{ textAlign: 'center', width: '100%' }}>
                    <span style={{
                      fontFamily: "'Onest', sans-serif", fontSize: '11px', fontWeight: 700,
                      color: i === 2 ? coral : sand,
                    }}>
                      {s}
                    </span>
                  </div>
                  {i < 3 && (
                    <svg width="24" height="12" viewBox="0 0 24 12" style={{ flexShrink: 0, opacity: 0.3 }}>
                      <path d="M0,6 C8,2 16,2 24,6" fill="none" stroke={sand} strokeWidth="1" />
                      <path d="M18,2 L24,6 L18,10" fill="none" stroke={sand} strokeWidth="1" />
                    </svg>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Screenshots — organic scattered layout */}
          <div style={{ padding: '24px 40px 0', position: 'relative', height: '190px' }}>
            {[
              { w: 200, h: 110, t: 0, l: 0, rot: -2, label: 'Screenshot 1 — Kalkulator' },
              { w: 180, h: 100, t: 10, l: 190, rot: 1.5, label: 'Screenshot 2 — ML Pipeline' },
              { w: 160, h: 90, t: 80, l: 380, rot: -1, label: 'Screenshot 3 — Wyniki' },
              { w: 170, h: 85, t: 110, l: 100, rot: 2, label: 'Screenshot 4 — DST vs DSmT' },
              { w: 150, h: 80, t: 105, l: 440, rot: -1.5, label: 'Screenshot 5' },
            ].map((s, i) => (
              <div key={i} style={{
                position: 'absolute', top: s.t, left: s.l,
                width: s.w, height: s.h, transform: `rotate(${s.rot}deg)`,
                background: 'rgba(240,230,211,0.05)', border: '1px solid rgba(240,230,211,0.12)',
                borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontFamily: "'Onest', sans-serif", fontSize: '8px', fontWeight: 500, color: `${sand}60`, letterSpacing: '0.5px' }}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>

          {/* Features — flowing text */}
          <div style={{ padding: '20px 40px 0' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {[
                'DST vs DSmT side-by-side',
                'Analiza konfliktow',
                'Kalkulator + ML Pipeline',
                'Gotowe scenariusze',
                'Real-time results',
              ].map((f, i) => (
                <span key={i} style={{
                  fontFamily: "'Onest', sans-serif", fontSize: '10px', fontWeight: 500,
                  color: i % 2 === 0 ? coral : mint,
                  padding: '4px 12px', borderRadius: '20px',
                  border: `1px solid ${i % 2 === 0 ? coral : mint}30`,
                  background: `${i % 2 === 0 ? coral : mint}08`,
                }}>
                  {f}
                </span>
              ))}
            </div>
          </div>

          {/* Buzzwords — large, overlapping, low opacity */}
          <div style={{ padding: '16px 40px 0', position: 'relative', height: '50px' }}>
            <span style={{ position: 'absolute', left: '40px', top: '0', fontFamily: "'Onest', sans-serif", fontSize: '32px', fontWeight: 900, color: `${coral}0d`, letterSpacing: '-1px' }}>
              EVIDENCE FUSION
            </span>
            <span style={{ position: 'absolute', left: '180px', top: '18px', fontFamily: "'Onest', sans-serif", fontSize: '28px', fontWeight: 900, color: `${mint}0d`, letterSpacing: '-1px' }}>
              MACHINE LEARNING
            </span>
          </div>

          {/* Tech stack */}
          <div style={{ padding: '8px 40px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontFamily: "'Onest', sans-serif", fontSize: '9px', fontWeight: 700, color: `${sand}60`, letterSpacing: '2px', textTransform: 'uppercase' }}>
              Tech
            </span>
            {['React', 'FastAPI', 'Python', 'scikit-learn', 'NumPy', 'Tailwind', 'Vite'].map(t => (
              <span key={t} style={{ fontFamily: "'Onest', sans-serif", fontSize: '10px', fontWeight: 300, color: `${sand}99` }}>
                {t}
              </span>
            ))}
          </div>

          {/* Footer */}
          <div style={{
            marginTop: 'auto', padding: '14px 40px 24px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
            borderTop: `1px solid ${sand}15`,
          }}>
            <span style={{ fontFamily: "'Onest', sans-serif", fontSize: '8px', fontWeight: 500, color: `${sand}60` }}>
              Wydzial Informatyki
            </span>
            <span style={{ fontFamily: "'Onest', sans-serif", fontSize: '7px', color: `${sand}40` }}>
              Praca w ramach: Inzynierski Projekt Zespolowy
            </span>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontFamily: "'Onest', sans-serif", fontSize: '8px', color: `${sand}60`, display: 'block' }}>Autorzy: _______________</span>
              <span style={{ fontFamily: "'Onest', sans-serif", fontSize: '8px', color: `${sand}60`, display: 'block' }}>Opiekun: _______________</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
