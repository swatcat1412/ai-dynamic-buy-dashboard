import {
  monthlyPurchasePolicy,
  v2StrategyPortfolios,
} from "../lib/v2-strategy";

export default function V2StrategyFoundation() {
  return (
    <div className="v2-foundation" aria-label="V2 monthly investment framework">
      <div className="v2-portfolio-grid">
        {v2StrategyPortfolios.map((portfolio) => (
          <article className="v2-portfolio-card" key={portfolio.id}>
            <div className="v2-card-topline">
              <span>{portfolio.label}</span>
              <small>{portfolio.symbols.length} assets</small>
            </div>
            <h4>{portfolio.name}</h4>
            <p>{portfolio.objective}</p>
            <div className="v2-symbol-list">
              {portfolio.symbols.map((symbol) => (
                <span key={symbol}>{symbol}</span>
              ))}
            </div>
          </article>
        ))}
      </div>

      <article className="monthly-policy-card">
        <div className="monthly-policy-heading">
          <div>
            <span className="section-kicker">Monthly execution policy</span>
            <h4>Three bullets. Larger only when opportunity improves.</h4>
          </div>
          <strong>{monthlyPurchasePolicy.maximumPurchases}× max / month</strong>
        </div>
        <div className="monthly-bullet-grid">
          {monthlyPurchasePolicy.bullets.map((bullet, index) => (
            <div className="monthly-bullet" key={bullet.id}>
              <span className="bullet-index">0{index + 1}</span>
              <div>
                <strong>{bullet.label}</strong>
                <small>{bullet.purpose}</small>
              </div>
              <b>{bullet.budgetShare}%</b>
            </div>
          ))}
        </div>
        <p className="monthly-policy-note">
          เงินที่ยังไม่ถูกใช้จะคงเป็น Correction Reserve สำหรับเดือนถัดไป
          โดย Phase นี้ยังไม่บันทึกธุรกรรมและยังไม่เพิ่ม API calls สำหรับหุ้นใหม่
        </p>
      </article>
    </div>
  );
}

// จัดทำโดย: นายฐิติ เทอดพิทักษ์พงษ์ โดยใช้ OpenAI Codex | © 2026 Thiti Theadphitukphong · All Rights Reserved.
