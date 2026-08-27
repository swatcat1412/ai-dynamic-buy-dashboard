import DataStatus from "./components/data-status";
import LivePortfolio from "./components/live-portfolio";
import LiveIndicators from "./components/live-indicators";
import LiveBuyEngine from "./components/live-buy-engine";
import LiveMacro from "./components/live-macro";
import MarketNews from "./components/market-news";
import LiveBuyZones from "./components/live-buy-zones";
import PriceHistory from "./components/price-history";

const navigation = [
  { label: "Overview", href: "#overview" },
  { label: "Market Score", href: "#market-score" },
  { label: "Buy Zones", href: "#buy-zones" },
  { label: "Indicators", href: "#technical-indicators" },
];

const marketScore = [
  { label: "Fed", score: 62, status: "Supportive", tone: "positive" },
  { label: "Inflation", score: 48, status: "Watching", tone: "caution" },
  { label: "AI Trend", score: 86, status: "Strong", tone: "positive" },
  { label: "VIX", score: 58, status: "Calm", tone: "neutral" },
  { label: "Nasdaq", score: 74, status: "Healthy", tone: "positive" },
  { label: "Bond Yield", score: 43, status: "Pressure", tone: "caution" },
];

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
            <a className={index === 0 ? "nav-item active" : "nav-item"} href={item.href} key={item.label}>
              <span className="nav-index">0{index + 1}</span>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="sidebar-footer">
          <span className="status-dot" />
          <span>Daily data mode</span>
        </div>
      </aside>

      <section className="content-area">
        <header className="topbar">
          <div>
            <p className="eyebrow">AI Dynamic Buy Dashboard · v1.0</p>
            <p className="muted">ระบบช่วยวิเคราะห์จังหวะทยอยสะสมหุ้นสหรัฐฯ</p>
          </div>
          <div className="date-chip">LIVE DAILY DATA</div>
        </header>

        <DataStatus />

        <div className="hero-panel" id="overview">
          <div>
            <p className="section-kicker">Dashboard foundation</p>
            <h2>Build conviction. Buy with a plan.</h2>
            <p className="hero-copy">
              Dashboard สำหรับติดตาม Portfolio เป้าหมาย ข้อมูลตลาดรายวัน และ Dynamic Buy Zones จากแหล่งข้อมูลจริง
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
              <span className="score-date">MODEL</span>
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
          <span className="muted">7 FRED series · Latest observations</span>
        </div>

        <LiveMacro />

        <div className="section-heading news-heading" id="market-news"><div><p className="section-kicker">Phase 3 · News & catalysts</p><h3>Market news</h3></div><span className="pill">Cached sentiment</span></div>
        <MarketNews />

        <div className="section-heading zone-heading" id="buy-zones">
          <div>
            <p className="section-kicker">Phase 4 · Entry framework</p>
            <h3>Dynamic buy zones</h3>
          </div>
          <span className="pill">Daily dynamic levels</span>
        </div>

        <LiveBuyZones />

        <div className="zone-note">
          <span>Threshold note</span>
          <p>ระดับราคาคำนวณจากราคาปิดรายวัน, EMA20, แนวรับ 20/60 วัน และ ATR โดยใช้ API cache 30 นาที</p>
        </div>

        <div className="section-heading technical-heading" id="technical-indicators">
          <div>
            <p className="section-kicker">Phase 5 · Signal layer</p>
            <h3>Technical indicators</h3>
          </div>
          <span className="pill">7 indicators · Live daily data</span>
        </div>

        <LiveIndicators />

        <LiveBuyEngine />

        <div className="section-heading history-heading" id="price-history"><div><p className="section-kicker">Phase 6 · History</p><h3>Price history</h3></div><span className="pill">Daily OHLCV · EMA20</span></div>
        <PriceHistory />

        <footer className="site-footer">
          <p>จัดทำโดย: นายฐิติ เทอดพิทักษ์พงษ์ โดยใช้เทคโนโลยี AI จาก OpenAI · © 2026 Thiti Theadphitukphong · All Rights Reserved.</p>
        </footer>

      </section>
    </main>
  );
}

// จัดทำโดย: นายฐิติ เทอดพิทักษ์พงษ์ โดยใช้เทคโนโลยี AI จาก OpenAI · © 2026 Thiti Theadphitukphong · All Rights Reserved.
