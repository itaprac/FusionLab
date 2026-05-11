import {
  AbsoluteFill,
  Easing,
  interpolate,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion'

const ease = Easing.bezier(0.16, 1, 0.3, 1)

const clamp = {
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
  easing: ease,
}

function seconds(value, fps) {
  return Math.round(value * fps)
}

function useInOut(start, end, fade = 0.55) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const fadeFrames = seconds(fade, fps)
  const opacityIn = interpolate(frame, [start, start + fadeFrames], [0, 1], clamp)
  const opacityOut = interpolate(frame, [end - fadeFrames, end], [1, 0], clamp)
  const y = interpolate(frame, [start, start + fadeFrames], [36, 0], clamp)
  return { opacity: Math.min(opacityIn, opacityOut), transform: `translateY(${y}px)` }
}

function Scene({ start, end, children, className = '' }) {
  const style = useInOut(start, end)
  return (
    <AbsoluteFill className={`scene ${className}`} style={style}>
      {children}
    </AbsoluteFill>
  )
}

function Shell({ active = 'Calculator', compact = false, children }) {
  return (
    <div className={`app-shell ${compact ? 'compact' : ''}`}>
      <div className="app-topbar">
        <div className="brand-mark">FL</div>
        <div className="brand-copy">
          <strong>Fusion Lab</strong>
          <span>Evidence fusion workspace</span>
        </div>
        <div className="nav-pills">
          {['Home', 'Calculator', 'ML Fusion', 'Docs'].map((item) => (
            <span key={item} className={item === active ? 'active' : ''}>{item}</span>
          ))}
        </div>
      </div>
      <div className="app-content">{children}</div>
    </div>
  )
}

function SourcePanel({ title, rows, delay = 0 }) {
  const frame = useCurrentFrame()
  const local = frame - delay
  const progress = interpolate(local, [0, 24], [0, 1], clamp)
  return (
    <div className="source-panel" style={{ opacity: progress, transform: `translateY(${(1 - progress) * 24}px)` }}>
      <div className="panel-title">{title}</div>
      {rows.map((row) => (
        <div className="mass-row" key={row.label}>
          <span>{row.label}</span>
          <div className="mass-track">
            <div style={{ width: `${row.value * 100}%` }} />
          </div>
          <strong>{row.value.toFixed(2)}</strong>
        </div>
      ))}
    </div>
  )
}

function FusionCore() {
  const frame = useCurrentFrame()
  const pulse = interpolate(frame % 54, [0, 27, 54], [0.7, 1, 0.7], clamp)
  return (
    <div className="fusion-core" style={{ transform: `scale(${pulse})` }}>
      <div className="orbit orbit-one" />
      <div className="orbit orbit-two" />
      <div className="core-inner">
        <span>Fuse</span>
        <strong>PCR5</strong>
      </div>
    </div>
  )
}

function EvidenceScene({ start, end }) {
  const { fps } = useVideoConfig()
  const base = start + seconds(0.6, fps)
  return (
    <Scene start={start} end={end}>
      <div className="scene-grid two-col">
        <div>
          <p className="eyebrow">Multiple uncertain sources</p>
          <h1>Turn disagreement into a readable belief distribution.</h1>
          <p className="lede">Define evidence by hand, choose a fusion rule, then inspect where conflict goes instead of hiding it.</p>
        </div>
        <div className="evidence-board">
          <SourcePanel
            title="Weather station"
            delay={base}
            rows={[
              { label: 'Low risk', value: 0.18 },
              { label: 'Moderate', value: 0.56 },
              { label: 'High risk', value: 0.26 },
            ]}
          />
          <SourcePanel
            title="Field report"
            delay={base + 14}
            rows={[
              { label: 'Low risk', value: 0.08 },
              { label: 'Moderate', value: 0.34 },
              { label: 'High risk', value: 0.58 },
            ]}
          />
          <FusionCore />
        </div>
      </div>
    </Scene>
  )
}

function HeroScene({ start, end }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const sweep = interpolate(frame, [start, start + seconds(4.5, fps)], [-240, 1840], clamp)
  return (
    <Scene start={start} end={end} className="hero-scene">
      <div className="signal-sweep" style={{ transform: `translateX(${sweep}px) rotate(-12deg)` }} />
      <div className="hero-copy">
        <p className="eyebrow">Launch video</p>
        <h1>Fusion Lab</h1>
        <p>Compare Dempster-Shafer, PCR5, and PCR6. Combine uncertain evidence. See the reasoning.</p>
      </div>
      <Shell active="Home" compact>
        <div className="hero-dashboard">
          <div className="hero-card wide">
            <span>Evidence Fusion Workspace</span>
            <strong>Combine uncertain evidence.</strong>
            <p>See the reasoning.</p>
          </div>
          <div className="hero-card">
            <span>Conflict</span>
            <strong>0.21</strong>
          </div>
          <div className="hero-card">
            <span>Dominant</span>
            <strong>Moderate</strong>
          </div>
        </div>
      </Shell>
    </Scene>
  )
}

function CalculatorScene({ start, end }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const result = interpolate(frame, [start + seconds(1.4, fps), start + seconds(2.6, fps)], [0, 1], clamp)
  const rows = [
    { label: 'Low risk', value: 0.10 },
    { label: 'Moderate', value: 0.49 },
    { label: 'High risk', value: 0.41 },
  ]
  return (
    <Scene start={start} end={end}>
      <div className="stack-title">
        <p className="eyebrow">Manual workflow</p>
        <h2>Fusion Calculator</h2>
      </div>
      <Shell active="Calculator">
        <div className="calculator-layout">
          <div className="method-column">
            <div className="step-label">1 Fusion method</div>
            <div className="method-chip active">Dempster-Shafer</div>
            <div className="method-chip">PCR5</div>
            <div className="method-chip">PCR6</div>
          </div>
          <div className="source-grid">
            <SourcePanel title="Source 1" rows={[{ label: 'A', value: 0.62 }, { label: 'B', value: 0.28 }, { label: 'C', value: 0.1 }]} />
            <SourcePanel title="Source 2" rows={[{ label: 'A', value: 0.16 }, { label: 'B', value: 0.55 }, { label: 'C', value: 0.29 }]} />
          </div>
          <div className="result-panel" style={{ opacity: result, transform: `translateY(${(1 - result) * 28}px)` }}>
            <div className="panel-title">Fusion Result</div>
            {rows.map((row) => (
              <div className="mass-row result" key={row.label}>
                <span>{row.label}</span>
                <div className="mass-track">
                  <div style={{ width: `${row.value * result * 100}%` }} />
                </div>
                <strong>{row.value.toFixed(2)}</strong>
              </div>
            ))}
          </div>
        </div>
      </Shell>
    </Scene>
  )
}

function MLScene({ start, end }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const bars = [
    { name: 'SVM', value: 0.944 },
    { name: 'Random Forest', value: 0.958 },
    { name: 'Logistic Reg.', value: 0.939 },
    { name: 'Fusion', value: 0.972 },
  ]
  return (
    <Scene start={start} end={end}>
      <div className="stack-title">
        <p className="eyebrow">Model workflow</p>
        <h2>ML Fusion Pipeline</h2>
      </div>
      <Shell active="ML Fusion">
        <div className="ml-layout">
          <div className="pipeline-steps">
            {['Dataset', 'ML Models', 'Fusion method', 'Evaluation'].map((item, idx) => (
              <div className="pipeline-step" key={item}>
                <span>{idx + 1}</span>
                <strong>{item}</strong>
              </div>
            ))}
          </div>
          <div className="chart-panel">
            <div className="panel-title">Detailed comparison</div>
            {bars.map((bar, idx) => {
              const local = frame - start - seconds(1.2 + idx * 0.18, fps)
              const width = interpolate(local, [0, 22], [0, bar.value * 100], clamp)
              return (
                <div className={`bar-row ${bar.name === 'Fusion' ? 'fusion' : ''}`} key={bar.name}>
                  <span>{bar.name}</span>
                  <div className="bar-track"><div style={{ width: `${width}%` }} /></div>
                  <strong>{(bar.value * 100).toFixed(1)}%</strong>
                </div>
              )
            })}
          </div>
          <div className="matrix-panel">
            <div className="panel-title">Fusion confusion matrix</div>
            <div className="matrix">
              {[36, 0, 1, 0, 33, 2, 0, 1, 35].map((value, idx) => (
                <div key={idx} className={idx % 4 === 0 ? 'hot' : ''}>{value}</div>
              ))}
            </div>
          </div>
        </div>
      </Shell>
    </Scene>
  )
}

function FinalScene({ start, end }) {
  return (
    <Scene start={start} end={end} className="final-scene">
      <div className="final-lockup">
        <div className="brand-mark large">FL</div>
        <p className="eyebrow">Fusion Lab</p>
        <h1>Evidence fusion, made inspectable.</h1>
        <p>Manual belief masses, classifier ensembles, conflict-aware rules, and clear results in one workspace.</p>
      </div>
    </Scene>
  )
}

export function LaunchVideo() {
  const { fps } = useVideoConfig()
  const total = seconds(36, fps)
  return (
    <AbsoluteFill className="video-root">
      <style>{styles}</style>
      <div className="background-grid" />
      <Sequence durationInFrames={total}>
        <HeroScene start={0} end={seconds(7.5, fps)} />
        <EvidenceScene start={seconds(6.8, fps)} end={seconds(16.2, fps)} />
        <CalculatorScene start={seconds(15.4, fps)} end={seconds(25.1, fps)} />
        <MLScene start={seconds(24.3, fps)} end={seconds(33.1, fps)} />
        <FinalScene start={seconds(32.4, fps)} end={total} />
      </Sequence>
    </AbsoluteFill>
  )
}

const styles = `
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap');

* { box-sizing: border-box; }

.video-root {
  background: #08130f;
  color: #f3f7f0;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  overflow: hidden;
}

.background-grid {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(90deg, rgba(129, 219, 171, 0.06) 1px, transparent 1px),
    linear-gradient(0deg, rgba(129, 219, 171, 0.06) 1px, transparent 1px),
    radial-gradient(circle at 72% 20%, rgba(94, 221, 158, 0.18), transparent 32%),
    radial-gradient(circle at 18% 88%, rgba(230, 206, 107, 0.12), transparent 24%),
    #08130f;
  background-size: 58px 58px, 58px 58px, auto, auto, auto;
}

.scene {
  padding: 96px 118px;
}

.hero-scene {
  justify-content: center;
}

.signal-sweep {
  position: absolute;
  top: -18%;
  left: 0;
  height: 150%;
  width: 260px;
  background: linear-gradient(90deg, transparent, rgba(118, 239, 180, 0.22), transparent);
  filter: blur(4px);
}

.hero-copy {
  position: relative;
  z-index: 2;
  width: 760px;
}

.eyebrow, .panel-title, .step-label {
  margin: 0;
  color: #73e3a8;
  font-family: 'JetBrains Mono', monospace;
  font-size: 21px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

h1, h2 {
  margin: 18px 0 0;
  color: #f7fff8;
  font-weight: 800;
  letter-spacing: 0;
  line-height: 0.98;
}

h1 { font-size: 128px; max-width: 1100px; }
h2 { font-size: 78px; }

.hero-copy p:last-child, .lede, .final-lockup p:last-child {
  margin: 28px 0 0;
  max-width: 770px;
  color: #bad0c2;
  font-size: 32px;
  line-height: 1.38;
}

.app-shell {
  position: absolute;
  right: 108px;
  bottom: 90px;
  width: 1120px;
  min-height: 620px;
  overflow: hidden;
  border: 1px solid rgba(124, 201, 163, 0.22);
  border-radius: 18px;
  background: rgba(18, 34, 27, 0.94);
  box-shadow: 0 40px 110px rgba(0, 0, 0, 0.42);
}

.app-shell.compact {
  right: 104px;
  top: 120px;
  width: 740px;
  min-height: 430px;
}

.app-topbar {
  display: flex;
  align-items: center;
  gap: 18px;
  height: 88px;
  padding: 0 28px;
  border-bottom: 1px solid rgba(124, 201, 163, 0.16);
}

.brand-mark {
  display: grid;
  place-items: center;
  width: 50px;
  height: 50px;
  border-radius: 14px;
  background: #55d98e;
  color: #06110d;
  font-weight: 800;
}

.brand-mark.large {
  width: 92px;
  height: 92px;
  margin: 0 auto 26px;
  border-radius: 24px;
  font-size: 34px;
}

.brand-copy {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 220px;
}

.brand-copy strong { color: #f4fff7; font-size: 19px; }
.brand-copy span { color: #84a392; font-size: 14px; }

.nav-pills {
  display: flex;
  gap: 10px;
  margin-left: auto;
}

.nav-pills span {
  border: 1px solid rgba(124, 201, 163, 0.13);
  border-radius: 999px;
  padding: 9px 13px;
  color: #9fb7aa;
  font-size: 14px;
  font-weight: 700;
}

.nav-pills .active {
  background: rgba(115, 227, 168, 0.16);
  color: #88f0b4;
}

.app-content { padding: 32px; }

.hero-dashboard {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}

.hero-card, .source-panel, .result-panel, .chart-panel, .matrix-panel, .pipeline-step {
  border: 1px solid rgba(124, 201, 163, 0.18);
  border-radius: 16px;
  background: #15281f;
}

.hero-card {
  min-height: 132px;
  padding: 24px;
}

.hero-card.wide {
  grid-column: 1 / -1;
  min-height: 180px;
}

.hero-card span {
  display: block;
  color: #80a794;
  font-size: 16px;
  font-weight: 700;
}

.hero-card strong {
  display: block;
  margin-top: 12px;
  color: #f5fff7;
  font-size: 35px;
  line-height: 1.05;
}

.hero-card p {
  margin: 10px 0 0;
  color: #94b9a5;
  font-size: 22px;
}

.scene-grid {
  position: relative;
  z-index: 1;
  display: grid;
  height: 100%;
  align-items: center;
  gap: 80px;
}

.two-col {
  grid-template-columns: 0.9fr 1.1fr;
}

.evidence-board {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 28px;
  min-height: 520px;
  align-items: center;
}

.source-panel {
  padding: 28px;
}

.panel-title {
  margin-bottom: 22px;
  font-size: 16px;
  color: #95f0bb;
}

.mass-row, .bar-row {
  display: grid;
  grid-template-columns: 130px 1fr 70px;
  gap: 16px;
  align-items: center;
  min-height: 48px;
  color: #d9eee2;
  font-size: 17px;
  font-weight: 700;
}

.mass-track, .bar-track {
  height: 12px;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(139, 181, 160, 0.16);
}

.mass-track div, .bar-track div {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #55d98e, #e0c95d);
}

.mass-row strong, .bar-row strong {
  color: #f6fff8;
  font-family: 'JetBrains Mono', monospace;
  font-size: 16px;
  text-align: right;
}

.fusion-core {
  position: absolute;
  left: 50%;
  top: 50%;
  display: grid;
  place-items: center;
  width: 220px;
  height: 220px;
  margin: -110px 0 0 -110px;
}

.orbit {
  position: absolute;
  border: 1px solid rgba(115, 227, 168, 0.38);
  border-radius: 50%;
}

.orbit-one { inset: 6px; }
.orbit-two { inset: 32px; border-color: rgba(224, 201, 93, 0.4); }

.core-inner {
  display: grid;
  place-items: center;
  width: 126px;
  height: 126px;
  border-radius: 50%;
  background: #6ee5a3;
  color: #07130e;
  box-shadow: 0 0 70px rgba(95, 229, 159, 0.42);
}

.core-inner span {
  font-size: 16px;
  font-weight: 800;
  text-transform: uppercase;
}

.core-inner strong {
  font-family: 'JetBrains Mono', monospace;
  font-size: 28px;
}

.stack-title {
  position: absolute;
  left: 118px;
  top: 92px;
  z-index: 2;
}

.calculator-layout {
  display: grid;
  grid-template-columns: 230px 1fr;
  grid-template-rows: auto auto;
  gap: 26px;
}

.method-column {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.method-chip {
  border: 1px solid rgba(124, 201, 163, 0.16);
  border-radius: 14px;
  padding: 16px 18px;
  color: #aec9b9;
  font-weight: 800;
}

.method-chip.active {
  border-color: rgba(115, 227, 168, 0.5);
  background: rgba(115, 227, 168, 0.13);
  color: #8bf0b7;
}

.source-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 22px;
}

.result-panel {
  grid-column: 1 / -1;
  padding: 26px 28px;
}

.result-panel .mass-row {
  grid-template-columns: 160px 1fr 80px;
}

.ml-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  grid-template-rows: auto auto;
  gap: 24px;
}

.pipeline-steps {
  display: grid;
  gap: 14px;
  grid-row: 1 / 3;
}

.pipeline-step {
  display: flex;
  align-items: center;
  gap: 18px;
  min-height: 86px;
  padding: 18px;
}

.pipeline-step span {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(115, 227, 168, 0.16);
  color: #84efb3;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 800;
}

.pipeline-step strong {
  color: #f2fff5;
  font-size: 18px;
}

.chart-panel, .matrix-panel {
  padding: 28px;
}

.bar-row {
  grid-template-columns: 160px 1fr 82px;
}

.bar-row.fusion span, .bar-row.fusion strong {
  color: #90f0ba;
}

.matrix {
  display: grid;
  grid-template-columns: repeat(3, 82px);
  gap: 8px;
}

.matrix div {
  display: grid;
  place-items: center;
  width: 82px;
  height: 62px;
  border-radius: 12px;
  background: rgba(139, 181, 160, 0.12);
  color: #d5eadf;
  font-family: 'JetBrains Mono', monospace;
  font-size: 20px;
  font-weight: 800;
}

.matrix .hot {
  background: rgba(115, 227, 168, 0.26);
  color: #f5fff8;
}

.final-scene {
  display: grid;
  place-items: center;
  text-align: center;
}

.final-lockup {
  max-width: 1120px;
}

.final-lockup h1 {
  margin-top: 18px;
  font-size: 96px;
}
`
