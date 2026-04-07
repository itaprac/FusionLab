import { useEffect } from 'react'

const FONTS_URL = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Source+Sans+3:wght@300;400;600;700&display=swap'

function Poster1() {
  useEffect(() => {
    const link = document.createElement('link')
    link.href = FONTS_URL
    link.rel = 'stylesheet'
    document.head.appendChild(link)
    return () => document.head.removeChild(link)
  }, [])

  return (
    <div style={styles.page}>
      <div style={styles.poster}>
        {/* Top bar */}
        <div style={styles.topBar}>
          <span style={styles.topBarLeft}>Inżynierski Projekt Zespołowy</span>
          <span style={styles.topBarRight}>2025</span>
        </div>

        {/* Header section */}
        <header style={styles.header}>
          <div style={styles.logoMark}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="18" cy="24" r="14" stroke="#1a1a1a" strokeWidth="2.5" fill="none" />
              <circle cx="30" cy="24" r="14" stroke="#1a1a1a" strokeWidth="2.5" fill="none" />
              <path d="M24 13.5C26.5 16.5 28 20 28 24s-1.5 7.5-4 10.5C21.5 31.5 20 28 20 24s1.5-7.5 4-10.5z" fill="#c45a3c" opacity="0.7" />
            </svg>
          </div>
          <h1 style={styles.title}>FusionLab</h1>
          <div style={styles.dividerThick} />
          <p style={styles.subtitle}>
            Matematyka fuzji dowodów — <em style={styles.em}>prosta w użyciu</em>
          </p>
        </header>

        {/* What is it */}
        <section style={styles.sectionIntro}>
          <div style={styles.introGrid}>
            <div style={styles.introLeft}>
              <h2 style={styles.sectionTitle}>Czym jest FusionLab?</h2>
              <p style={styles.bodyText}>
                Interaktywna platforma webowa, która przekształca złożoną teorię fuzji
                dowodów — Dempster-Shafer i DSmT (PCR5/6) — w intuicyjne,
                wizualne narzędzie. Dwa tryby pracy: ręczny Kalkulator Fuzji
                oraz automatyczny Pipeline Machine Learning.
              </p>
              <div style={styles.tagRow}>
                <span style={styles.tag}>Evidence Fusion</span>
                <span style={styles.tag}>Machine Learning</span>
                <span style={styles.tag}>AI Pipeline</span>
                <span style={styles.tag}>Belief Functions</span>
              </div>
            </div>
            <div style={styles.introRight}>
              <div style={styles.quoteBlock}>
                <span style={styles.quoteMark}>"</span>
                <p style={styles.quoteText}>
                  Łączymy niepewne źródła danych w jedno spójne wnioskowanie
                  — i&nbsp;pokazujemy jak to działa, krok po kroku.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div style={styles.dividerThin} />

        {/* How it works */}
        <section style={styles.sectionHow}>
          <h2 style={styles.sectionTitle}>Jak to działa?</h2>
          <div style={styles.stepsRow}>
            {[
              { num: '01', label: 'Źródła', desc: 'Wprowadź masy przekonań z wielu ekspertów lub czujników' },
              { num: '02', label: 'Metoda', desc: 'Wybierz regułę: Dempster, PCR5 lub PCR6' },
              { num: '03', label: 'Fuzja', desc: 'System łączy dowody i rozwiązuje konflikty' },
              { num: '04', label: 'Wynik', desc: 'Wizualizacja wyników z pełną analizą konfliktu' },
            ].map((step) => (
              <div key={step.num} style={styles.stepCard}>
                <span style={styles.stepNum}>{step.num}</span>
                <h3 style={styles.stepLabel}>{step.label}</h3>
                <p style={styles.stepDesc}>{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Screenshots */}
        <section style={styles.sectionScreens}>
          <h2 style={styles.sectionTitle}>Aplikacja w akcji</h2>
          <div style={styles.screensGrid}>
            <div style={styles.screenLarge}>
              <div style={styles.screenPlaceholder}>
                <span style={styles.placeholderLabel}>Screenshot 1 — Kalkulator Fuzji</span>
              </div>
            </div>
            <div style={styles.screenSmallCol}>
              <div style={styles.screenSmall}>
                <div style={styles.screenPlaceholder}>
                  <span style={styles.placeholderLabel}>Screenshot 2 — ML Pipeline</span>
                </div>
              </div>
              <div style={styles.screenSmall}>
                <div style={styles.screenPlaceholder}>
                  <span style={styles.placeholderLabel}>Screenshot 3 — Wyniki fuzji</span>
                </div>
              </div>
            </div>
          </div>
          <div style={styles.screensRowBottom}>
            <div style={styles.screenBottom}>
              <div style={styles.screenPlaceholder}>
                <span style={styles.placeholderLabel}>Screenshot 4 — Porównanie DST vs DSmT</span>
              </div>
            </div>
            <div style={styles.screenBottom}>
              <div style={styles.screenPlaceholder}>
                <span style={styles.placeholderLabel}>Screenshot 5 — Przykłady</span>
              </div>
            </div>
          </div>
        </section>

        <div style={styles.dividerThin} />

        {/* For whom + what's unique */}
        <section style={styles.sectionDual}>
          <div style={styles.dualLeft}>
            <h2 style={styles.sectionTitle}>Dla kogo?</h2>
            <ul style={styles.audienceList}>
              <li style={styles.audienceItem}>
                <strong>Badacze</strong> — szybkie prototypowanie reguł fuzji
              </li>
              <li style={styles.audienceItem}>
                <strong>Studenci</strong> — nauka teorii Dempster-Shafer i DSmT w praktyce
              </li>
              <li style={styles.audienceItem}>
                <strong>Data Scientists</strong> — ensemble learning z zaawansowaną fuzją klasyfikatorów
              </li>
            </ul>
          </div>
          <div style={styles.dualRight}>
            <h2 style={styles.sectionTitle}>Co wyróżnia?</h2>
            <ul style={styles.featureList}>
              <li style={styles.featureItem}>Porównanie DST i DSmT obok siebie</li>
              <li style={styles.featureItem}>Wizualna analiza konfliktów między źródłami</li>
              <li style={styles.featureItem}>Dwa tryby: ręczny kalkulator + ML Pipeline</li>
              <li style={styles.featureItem}>Gotowe przykłady (np. ocena zagrożenia lawinowego)</li>
              <li style={styles.featureItem}>Wyniki w czasie rzeczywistym</li>
            </ul>
          </div>
        </section>

        <div style={styles.dividerThin} />

        {/* Tech */}
        <section style={styles.sectionTech}>
          <h2 style={styles.sectionTitle}>Użyte technologie</h2>
          <div style={styles.techGrid}>
            {['React', 'FastAPI', 'Python', 'scikit-learn', 'NumPy', 'Tailwind CSS', 'Vite'].map((t) => (
              <div key={t} style={styles.techPill}>{t}</div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer style={styles.footer}>
          <div style={styles.footerLeft}>
            <span style={styles.footerLabel}>Wydział Informatyki</span>
          </div>
          <div style={styles.footerCenter}>
            <span style={styles.footerSmall}>Praca wykonana w ramach przedmiotu: Inżynierski Projekt Zespołowy</span>
          </div>
          <div style={styles.footerRight}>
            <span style={styles.footerLabel}>Autorzy: _______________</span>
            <span style={styles.footerLabel}>Opiekun: _______________</span>
          </div>
        </footer>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: '2rem',
    background: '#e8e4df',
    fontFamily: "'Source Sans 3', 'Georgia', serif",
  },
  poster: {
    width: '700px',
    minHeight: '980px',
    aspectRatio: '5 / 7',
    background: '#faf8f5',
    padding: '48px 44px',
    display: 'flex',
    flexDirection: 'column',
    gap: '28px',
    boxShadow: '0 8px 60px rgba(0,0,0,0.12)',
    position: 'relative',
    overflow: 'hidden',
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    fontFamily: "'Source Sans 3', sans-serif",
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '2px',
    textTransform: 'uppercase',
    color: '#888',
  },
  topBarLeft: {},
  topBarRight: {},
  header: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },
  logoMark: {
    marginBottom: '4px',
  },
  title: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: '56px',
    fontWeight: 900,
    color: '#1a1a1a',
    letterSpacing: '-1px',
    lineHeight: 1,
    margin: 0,
  },
  dividerThick: {
    width: '80px',
    height: '3px',
    background: '#c45a3c',
    alignSelf: 'center',
  },
  subtitle: {
    fontFamily: "'Source Sans 3', sans-serif",
    fontSize: '17px',
    fontWeight: 300,
    color: '#444',
    maxWidth: '420px',
    lineHeight: 1.5,
    margin: 0,
  },
  em: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontStyle: 'italic',
    fontWeight: 400,
    color: '#c45a3c',
  },
  sectionIntro: {
    marginTop: '4px',
  },
  introGrid: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr',
    gap: '28px',
    alignItems: 'start',
  },
  introLeft: {},
  introRight: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: '20px',
    fontWeight: 700,
    color: '#1a1a1a',
    marginBottom: '10px',
    marginTop: 0,
  },
  bodyText: {
    fontFamily: "'Source Sans 3', sans-serif",
    fontSize: '13px',
    lineHeight: 1.65,
    color: '#333',
    margin: '0 0 12px 0',
  },
  tagRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
  },
  tag: {
    fontFamily: "'Source Sans 3', sans-serif",
    fontSize: '10px',
    fontWeight: 600,
    letterSpacing: '1px',
    textTransform: 'uppercase',
    padding: '4px 10px',
    border: '1px solid #c45a3c',
    color: '#c45a3c',
    borderRadius: '2px',
  },
  quoteBlock: {
    borderLeft: '3px solid #c45a3c',
    paddingLeft: '16px',
    position: 'relative',
  },
  quoteMark: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: '48px',
    color: '#c45a3c',
    opacity: 0.3,
    position: 'absolute',
    top: '-18px',
    left: '4px',
    lineHeight: 1,
  },
  quoteText: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: '14px',
    fontStyle: 'italic',
    color: '#444',
    lineHeight: 1.6,
    margin: 0,
  },
  dividerThin: {
    width: '100%',
    height: '1px',
    background: '#ddd',
  },
  sectionHow: {},
  stepsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
  },
  stepCard: {
    textAlign: 'center',
  },
  stepNum: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: '28px',
    fontWeight: 900,
    color: '#c45a3c',
    display: 'block',
    marginBottom: '4px',
  },
  stepLabel: {
    fontFamily: "'Source Sans 3', sans-serif",
    fontSize: '14px',
    fontWeight: 700,
    color: '#1a1a1a',
    margin: '0 0 4px 0',
  },
  stepDesc: {
    fontFamily: "'Source Sans 3', sans-serif",
    fontSize: '11px',
    color: '#666',
    lineHeight: 1.5,
    margin: 0,
  },
  sectionScreens: {},
  screensGrid: {
    display: 'grid',
    gridTemplateColumns: '1.6fr 1fr',
    gap: '12px',
    marginBottom: '12px',
  },
  screenLarge: { minHeight: '140px' },
  screenSmallCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  screenSmall: { flex: 1, minHeight: '60px' },
  screensRowBottom: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  screenBottom: { minHeight: '80px' },
  screenPlaceholder: {
    width: '100%',
    height: '100%',
    minHeight: 'inherit',
    background: '#eee',
    border: '1px dashed #ccc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '2px',
  },
  placeholderLabel: {
    fontFamily: "'Source Sans 3', sans-serif",
    fontSize: '11px',
    color: '#999',
    fontWeight: 600,
  },
  sectionDual: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '32px',
  },
  dualLeft: {},
  dualRight: {},
  audienceList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  audienceItem: {
    fontFamily: "'Source Sans 3', sans-serif",
    fontSize: '12px',
    color: '#333',
    lineHeight: 1.5,
    paddingLeft: '12px',
    borderLeft: '2px solid #c45a3c',
  },
  featureList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  featureItem: {
    fontFamily: "'Source Sans 3', sans-serif",
    fontSize: '12px',
    color: '#333',
    lineHeight: 1.5,
    paddingLeft: '16px',
    position: 'relative',
  },
  sectionTech: {},
  techGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  techPill: {
    fontFamily: "'Source Sans 3', sans-serif",
    fontSize: '11px',
    fontWeight: 600,
    padding: '5px 14px',
    background: '#1a1a1a',
    color: '#faf8f5',
    borderRadius: '2px',
    letterSpacing: '0.5px',
  },
  footer: {
    marginTop: 'auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: '16px',
    borderTop: '1px solid #ddd',
  },
  footerLeft: {},
  footerCenter: { textAlign: 'center', flex: 1 },
  footerRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '2px',
  },
  footerLabel: {
    fontFamily: "'Source Sans 3', sans-serif",
    fontSize: '10px',
    fontWeight: 600,
    color: '#666',
    letterSpacing: '0.5px',
  },
  footerSmall: {
    fontFamily: "'Source Sans 3', sans-serif",
    fontSize: '9px',
    color: '#999',
  },
}

export default Poster1
