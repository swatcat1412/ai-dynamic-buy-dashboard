import DailyChecklist from "./components/daily-checklist";
import DataStatus from "./components/data-status";
import LivePortfolio from "./components/live-portfolio";
import LiveIndicators from "./components/live-indicators";
import LiveMacro from "./components/live-macro";
import PriceHistory from "./components/price-history";

const navigation = [
  "Overview",
  "Market Score",
  "Buy Zones",
  "Indicators",
  "Checklist",
];

const portfolio = [
  { symbol: "RKLB", name: "Rocket Lab", weight: 20, tone: "lime" },
  { symbol: "GOOGL", name: "Alphabet", weight: 35, tone: "warm" },
  { symbol: "LLY", name: "Eli Lilly", weight: 15, tone: "blue" },
  { symbol: "JEPQ", name: "JPMorgan Nasdaq Equity Premium Income", weight: 30, tone: "violet" },
];

const marketScore = [
  { label: "Fed", score: 62, status: "Supportive", tone: "positive" },
  { label: "Inflation", score: 48, status: "Watching", tone: "caution" },
  { label: "AI Trend", score: 86, status: "Strong", tone: "positive" },
  { label: "VIX", score: 58, status: "Calm", tone: "neutral" },
  { label: "Nasdaq", score: 74, status: "Healthy", tone: "positive" },
  { label: "Bond Yield", score: 43, status: "Pressure", tone: "caution" },
];

const macroIndicators = [
  { label: "Fed", value: "5.25%", trend: "Hold", tone: "neutral" },
  { label: "10Y Treasury", value: "4.22%", trend: "+0.04%", tone: "caution" },
  { label: "DXY", value: "103.8", trend: "-0.18%", tone: "positive" },
  { label: "VIX", value: "16.4", trend: "Low risk", tone: "positive" },
  { label: "Fear & Greed", value: "61", trend: "Greed", tone: "caution" },
  { label: "Nasdaq", value: "+0.72%", trend: "Up", tone: "positive" },
  { label: "S&P500", value: "+0.48%", trend: "Up", tone: "positive" },
];

const buyZones = [
  {
    symbol: "RKLB",
    name: "Rocket Lab",
    zones: [
      { zone: "A", threshold: ">75", action: "WAIT", allocation: "—", tone: "wait" },
      { zone: "B", threshold: "68–72", action: "BUY", allocation: "20%", tone: "buy" },
      { zone: "C", threshold: "62–67", action: "BUY", allocation: "35%", tone: "buy-strong" },
      { zone: "D", threshold: "56–61", action: "BUY", allocation: "30%", tone: "buy" },
      { zone: "E", threshold: "<56", action: "BUY", allocation: "Remaining", tone: "buy-max" },
    ],
  },
  {
    symbol: "GOOGL",
    name: "Alphabet",
    zones: [
      { zone: "A", threshold: ">205", action: "WAIT", allocation: "—", tone: "wait" },
      { zone: "B", threshold: "195–205", action: "BUY", allocation: "20%", tone: "buy" },
      { zone: "C", threshold: "185–195", action: "BUY", allocation: "35%", tone: "buy-strong" },
      { zone: "D", threshold: "175–185", action: "BUY", allocation: "30%", tone: "buy" },
      { zone: "E", threshold: "<175", action: "BUY", allocation: "Remaining", tone: "buy-max" },
    ],
  },
  {
    symbol: "LLY",
    name: "Eli Lilly",
    zones: [
      { zone: "A", threshold: ">900", action: "WAIT", allocation: "—", tone: "wait" },
      { zone: "B", threshold: "850–900", action: "BUY", allocation: "20%", tone: "buy" },
      { zone: "C", threshold: "800–850", action: "BUY", allocation: "35%", tone: "buy-strong" },
      { zone: "D", threshold: "740–800", action: "BUY", allocation: "30%", tone: "buy" },
      { zone: "E", threshold: "<740", action: "BUY", allocation: "Remaining", tone: "buy-max" },
    ],
  },
  {
    symbol: "JEPQ",
    name: "JPMorgan Nasdaq Equity Premium Income",
    zones: [
      { zone: "A", threshold: ">58", action: "WAIT", allocation: "—", tone: "wait" },
      { zone: "B", threshold: "57–58", action: "BUY", allocation: "20%", tone: "buy" },
      { zone: "C", threshold: "55–56", action: "BUY", allocation: "35%", tone: "buy-strong" },
      { zone: "D", threshold: "53–54", action: "BUY", allocation: "30%", tone: "buy" },
      { zone: "E", threshold: "<52", action: "BUY", allocation: "Remaining", tone: "buy-max" },
    ],
  },
];

const technicalIndicators = [
  { label: "RSI", value: "42.8", context: "Neutral", tone: "neutral" },
  { label: "MACD", value: "+1.24", context: "Golden cross", tone: "positive" },
  { label: "EMA20/50/200", value: "Above", context: "Bullish stack", tone: "positive" },
  { label: "Volume", value: "1.18×", context: "Above average", tone: "positive" },
  { label: "ATR", value: "3.6%", context: "Moderate range", tone: "neutral" },
  { label: "ADX", value: "27.4", context: "Trend active", tone: "positive" },
  { label: "OBV", value: "+4.2%", context: "Accumulation", tone: "positive" },
];

const buyEngine = [
  { rule: "RSI <35", signal: "Not triggered", points: 0, maximum: 20, tone: "neutral" },
  { rule: "MACD Golden Cross", signal: "Triggered", points: 20, maximum: 20, tone: "positive" },
  { rule: "Volume > Avg", signal: "Triggered", points: 10, maximum: 10, tone: "positive" },
  { rule: "Fear & Greed <25", signal: "Not triggered", points: 0, maximum: 20, tone: "neutral" },
  { rule: "VIX >22", signal: "Not triggered", points: 0, maximum: 15, tone: "neutral" },
  { rule: "Price at Support", signal: "Triggered", points: 15, maximum: 15, tone: "positive" },
];

const buyEngineScore = buyEngine.reduce((total, item) => total + item.points, 0);

export default function Home() {
  return (
    <main className="app-shell">
      <aside className="sidebar" aria-label="Main navigation">
        <div className="brand-block">
          <span className="brand-mark">AI</span>
          <div>
            <p className="eyebrow">Investment system</p>
            <h1>Dynamic Buy</h1>
          </div>
        </div>

        <nav className="nav-list">
          {navigation.map((item, index) => (
            <a className={index === 0 ? "nav-item active" : "nav-item"} href={index === 0 ? "#overview" : index === 1 ? "#market-score" : index === 2 ? "#buy-zones" : index === 3 ? "#technical-indicators" : "#checklist"} key={item}>
              <span className="nav-index">0{index + 1}</span>
              {item}
            </a>
          ))}
        </nav>

        <div className="sidebar-footer">
          <span className="status-dot" />
          <span>Static data mode</span>
        </div>
      </aside>

      <section className="content-area">
        <header className="topbar">
          <div>
            <p className="eyebrow">AI Dynamic Buy Dashboard · v1.0</p>
            <p className="muted">ระบบช่วยวิเคราะห์จังหวะทยอยสะสมหุ้นสหรัฐฯ</p>
          </div>
          <div className="date-chip">05 AUG 2026</div>
        </header>

        <DataStatus />

        <div className="hero-panel" id="overview">
          <div>
            <p className="section-kicker">Dashboard foundation</p>
            <h2>Build conviction. Buy with a plan.</h2>
            <p className="hero-copy">
              โครงสร้าง Dashboard พร้อมสำหรับเพิ่มข้อมูล Portfolio, Market Score และ Dynamic Buy Zones
            </p>
          </div>
          <div className="hero-orbit" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </div>

        <div className="section-heading" id="portfolio">
          <div>
            <p className="section-kicker">Phase 2 · Portfolio</p>
            <h3>Portfolio overview</h3>
          </div>
          <span className="pill">Allocation · 100%</span>
        </div>

        <LivePortfolio />

        <div className="legacy-portfolio">
        <div className="portfolio-layout">
          <article className="portfolio-summary">
            <div className="summary-topline">
              <span className="summary-label">Target allocation</span>
              <span className="summary-status"><span className="status-dot" /> Balanced</span>
            </div>
            <div className="allocation-total">100<span>%</span></div>
            <p>สัดส่วน Portfolio เป้าหมายจากเอกสาร v1.0 แบ่งตาม conviction และบทบาทของสินทรัพย์</p>
            <div className="allocation-stack" aria-label="Portfolio allocation breakdown">
              {portfolio.map((asset) => (
                <span className={`allocation-segment ${asset.tone}`} key={asset.symbol} style={{ width: `${asset.weight}%` }} />
              ))}
            </div>
            <div className="allocation-legend">
              {portfolio.map((asset) => (
                <span key={asset.symbol}><i className={`legend-dot ${asset.tone}`} />{asset.symbol}</span>
              ))}
            </div>
          </article>

          <div className="portfolio-table" role="table" aria-label="Portfolio allocation">
            <div className="portfolio-row portfolio-header" role="row">
              <span>Symbol</span><span>Asset</span><span>Weight</span>
            </div>
            {portfolio.map((asset, index) => (
              <div className="portfolio-row" role="row" key={asset.symbol}>
                <span className="symbol-cell"><i className={`legend-dot ${asset.tone}`} />{asset.symbol}</span>
                <span className="asset-name">{asset.name}</span>
                <span className="weight-cell"><strong>{asset.weight}%</strong><small>0{index + 1}</small></span>
              </div>
            ))}
          </div>
        </div>

        <div className="foundation-note">
          <span>Data mode</span>
          <p>Portfolio นี้ใช้ Static Data จาก Markdown และเตรียมโครงสร้างสำหรับเชื่อมข้อมูลจริงใน Phase หลัง</p>
        </div>

        </div>

        <div className="section-heading market-heading" id="market-score">
          <div>
            <p className="section-kicker">Phase 3 · Market context</p>
            <h3>Market score</h3>
          </div>
          <span className="pill">Simulated snapshot</span>
        </div>

        <div className="market-score-layout">
          <article className="market-score-card">
            <div className="score-card-header">
              <span>Composite score</span>
              <span className="score-date">05 AUG</span>
            </div>
            <div className="composite-score">64<span>/100</span></div>
            <p>ภาพรวมตลาดอยู่ในโหมดสะสมแบบเลือกจังหวะ โดย AI Trend และ Nasdaq ช่วยพยุง sentiment</p>
            <div className="score-meter"><span style={{ width: "64%" }} /></div>
            <div className="meter-labels"><span>Risk-off</span><span>Balanced</span><span>Risk-on</span></div>
          </article>

          <div className="score-list" role="list" aria-label="Market score indicators">
            {marketScore.map((item) => (
              <div className="score-row" role="listitem" key={item.label}>
                <span className="score-label">{item.label}</span>
                <span className="score-bar"><i className={item.tone} style={{ width: `${item.score}%` }} /></span>
                <strong>{item.score}</strong>
                <span className={`score-status ${item.tone}`}>{item.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="section-heading macro-heading" id="macro-indicators">
          <div>
            <p className="section-kicker">Macro dashboard</p>
            <h3>Macro indicators</h3>
          </div>
          <span className="muted">7 signals · Static snapshot</span>
        </div>

        <LiveMacro />

        <div className="legacy-macro">
        <div className="macro-grid" role="list" aria-label="Macro indicators">
          {macroIndicators.map((item) => (
            <article className="macro-card" role="listitem" key={item.label}>
              <div className="macro-card-top"><span>{item.label}</span><i className={`legend-dot ${item.tone}`} /></div>
              <strong>{item.value}</strong>
              <span className={`macro-trend ${item.tone}`}>{item.trend}</span>
            </article>
          ))}
        </div>
        </div>

        <div className="section-heading zone-heading" id="buy-zones">
          <div>
            <p className="section-kicker">Phase 4 · Entry framework</p>
            <h3>Dynamic buy zones</h3>
          </div>
          <span className="pill">Rules from Markdown v1.0</span>
        </div>

        <div className="zone-grid">
          {buyZones.map((asset) => (
            <article className="zone-card" key={asset.symbol}>
              <div className="zone-card-header">
                <div>
                  <span className="zone-symbol">{asset.symbol}</span>
                  <p>{asset.name}</p>
                </div>
                <span className="zone-count">5 zones</span>
              </div>
              <div className="zone-table" role="table" aria-label={`${asset.symbol} dynamic buy zones`}>
                <div className="zone-row zone-header" role="row">
                  <span>Zone</span><span>Price range</span><span>Action</span><span>Buy</span>
                </div>
                {asset.zones.map((zone) => (
                  <div className="zone-row" role="row" key={zone.zone}>
                    <span className={`zone-badge ${zone.tone}`}>{zone.zone}</span>
                    <span className="threshold">{zone.threshold}</span>
                    <span className={`action-label ${zone.tone}`}>{zone.action}</span>
                    <strong className="allocation-cell">{zone.allocation}</strong>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>

        <div className="zone-note">
          <span>Threshold note</span>
          <p>แสดงช่วงราคาตาม Markdown เดิม โดยช่วงที่ยังไม่ได้ระบุจะไม่ถูกตีความเพิ่มใน Phase นี้</p>
        </div>

        <div className="section-heading technical-heading" id="technical-indicators">
          <div>
            <p className="section-kicker">Phase 5 · Signal layer</p>
            <h3>Technical indicators</h3>
          </div>
          <span className="pill">7 signals · Simulated</span>
        </div>

        <LiveIndicators />

        <div className="legacy-technical">
        <div className="technical-grid" role="list" aria-label="Technical indicators">
          {technicalIndicators.map((item) => (
            <article className="technical-card" role="listitem" key={item.label}>
              <div className="technical-card-top"><span>{item.label}</span><i className={`legend-dot ${item.tone}`} /></div>
              <strong>{item.value}</strong>
              <span className={`technical-context ${item.tone}`}>{item.context}</span>
            </article>
          ))}
        </div>
        </div>

        <div className="engine-layout" id="buy-engine">
          <article className="engine-score-card">
            <div className="score-card-header"><span>Buy engine score</span><span className="score-date">MAX 100</span></div>
            <div className="engine-score">{buyEngineScore}<span>/100</span></div>
            <p>คะแนนจำลองจากสัญญาณ Technical และ Macro ตามกฎในเอกสาร</p>
            <div className="score-meter"><span style={{ width: `${buyEngineScore}%` }} /></div>
            <div className="engine-status">Selective accumulation</div>
          </article>

          <div className="engine-list" role="list" aria-label="Buy engine rules">
            <div className="engine-row engine-header" role="row"><span>Rule</span><span>Signal</span><span>Points</span></div>
            {buyEngine.map((item) => (
              <div className="engine-row" role="listitem" key={item.rule}>
                <span className="engine-rule">{item.rule}</span>
                <span className={`engine-signal ${item.tone}`}><i className={`status-dot ${item.tone}`} />{item.signal}</span>
                <strong>{item.points}<small>/{item.maximum}</small></strong>
              </div>
            ))}
          </div>
        </div>

        <div className="section-heading checklist-heading" id="checklist">
          <div>
            <p className="section-kicker">Phase 6 · Daily routine</p>
            <h3>Daily checklist</h3>
          </div>
          <span className="pill">8 checks · Interactive</span>
        </div>

        <div className="section-heading history-heading" id="price-history"><div><p className="section-kicker">Phase 6 · History</p><h3>Price history</h3></div><span className="pill">Live OHLCV · EMA20</span></div>
        <PriceHistory />

        <DailyChecklist />
      </section>
    </main>
  );
}

