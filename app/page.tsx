import DataStatus from "./components/data-status";
import LivePortfolio from "./components/live-portfolio";
import LiveIndicators from "./components/live-indicators";
import LiveBuyEngine from "./components/live-buy-engine";
import LiveMacro from "./components/live-macro";
import MarketNews from "./components/market-news";
import LiveBuyZones from "./components/live-buy-zones";
import PriceHistory from "./components/price-history";
import V2StrategyFoundation from "./components/v2-strategy-foundation";
import LiveMarketOpportunity from "./components/live-market-opportunity";

const navigation = [
  { label: "Overview", href: "#overview" },
  { label: "Monthly Plan", href: "#monthly-plan" },
  { label: "Market Opportunity", href: "#market-opportunity" },
  { label: "Buy Zones", href: "#buy-zones" },
  { label: "Indicators", href: "#technical-indicators" },
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
            <p className="eyebrow">AI Dynamic Buy Dashboard · V2 Foundation</p>
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

        <div className="section-heading" id="monthly-plan">
          <div>
            <p className="section-kicker">V2 Phase 1 · Strategy foundation</p>
            <h3>Two portfolios · Three bullets per month</h3>
          </div>
          <span className="pill">Correction multiplier · 0.5×–2×</span>
        </div>

        <V2StrategyFoundation />

        <div className="section-heading" id="portfolio">
          <div>
            <p className="section-kicker">Phase 2 · Portfolio</p>
            <h3>Portfolio overview</h3>
          </div>
          <span className="pill">Allocation · 100%</span>
        </div>

        <LivePortfolio />

        <div className="section-heading market-heading" id="market-opportunity">
          <div>
            <p className="section-kicker">V2 Phase 2 · Market context</p>
            <h3>Market opportunity</h3>
          </div>
          <span className="pill">FRED · Nasdaq Composite daily</span>
        </div>

        <LiveMarketOpportunity />

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
