"use client";

import { useEffect, useState } from "react";
import { livePortfolios } from "../lib/portfolio-config";
import { usePortfolioSelection } from "./portfolio-selection";

type Engine = { symbol: string; price: number; currentZone: string; score: number; action: string; confidence: number; dataAvailable: boolean; preferredEntry: number | null; support20: number | null; resistance20: number | null; support60: number | null; resistance60: number | null; entryLevels: Array<{ label: string; price: number | null; allocation: string }>; reasons: string[]; rules: Array<{ key: string; rule: string; signal: string; points: number; maximum: number; tone: string }>; zones: Array<{ zone: string; range: string; action: string; allocation: string }>; stockOpportunity?: { stockScore: number; marketMultiplier: number | null; marketBonus: number; opportunityScore: number } };

export default function LiveBuyEngine() {
  const { selectedPortfolio } = usePortfolioSelection();
  const portfolio = livePortfolios.find((item) => item.id === selectedPortfolio) ?? livePortfolios[0];
  const [symbol, setSymbol] = useState<string>(portfolio.assets[0].symbol);
  const activeSymbol = portfolio.assets.some((asset) => asset.symbol === symbol) ? symbol : portfolio.assets[0].symbol;
  const [engine, setEngine] = useState<Engine | null>(null);
  const [state, setState] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/market/buy-engine?symbol=${activeSymbol}`, { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json() as { ok?: boolean; engine?: Engine; error?: string };
        if (!response.ok || !payload.ok || !payload.engine) throw new Error(payload.error || "Buy engine request failed");
        if (!cancelled) { setEngine(payload.engine); setMessage(""); setState("connected"); }
      })
      .catch((error: unknown) => { if (!cancelled) { setState("error"); setMessage(error instanceof Error ? error.message : "Buy engine request failed"); } });
    return () => { cancelled = true; };
  }, [activeSymbol]);

  return <>
    <div className="engine-toolbar"><span className={`live-state ${state}`}><i className="status-dot" />{state === "connected" ? "Stock opportunity connected" : state === "loading" ? "Calculating stock opportunity" : "Stock opportunity unavailable"}</span><label>Symbol <select value={activeSymbol} onChange={(event) => { setState("loading"); setMessage(""); setSymbol(event.target.value); }}>{portfolio.assets.map((asset) => <option key={asset.symbol}>{asset.symbol}</option>)}</select></label></div>
    {message ? <div className="indicator-message">{message}</div> : engine ? <div className="dynamic-engine-layout">
      <article className="engine-score-card"><div className="score-card-header"><span>{engine.symbol} stock opportunity</span><span className="score-date">DAILY</span></div><div className="engine-score">{engine.stockOpportunity?.opportunityScore ?? engine.score}<span>/100</span></div><p>Stock score <strong>{engine.stockOpportunity?.stockScore ?? engine.score}</strong> · Market multiplier <strong>{engine.stockOpportunity?.marketMultiplier ?? "—"}×</strong></p><p>Daily close <strong>${engine.price.toFixed(2)}</strong> · Zone <strong>{engine.currentZone}</strong></p><div className="entry-levels"><strong>ราคาที่คาดว่าน่าสนใจ</strong>{engine.entryLevels.map((level) => <span key={level.label}>{level.label} <b>{level.price === null ? "—" : `${level.price.toFixed(2)}`}</b> · {level.allocation}</span>)}</div><div className="score-meter"><span style={{ width: `${engine.stockOpportunity?.opportunityScore ?? engine.score}%` }} /></div><div className={`engine-status ${engine.action.toLowerCase()}`}>{engine.action} · {engine.confidence}% confidence</div><ul className="engine-reasons">{engine.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul></article>
      <div className="engine-list" role="list" aria-label={`${symbol} buy engine rules`}><div className="engine-row engine-header"><span>Rule</span><span>Signal</span><span>Points</span></div>{engine.rules.map((rule) => <div className="engine-row" role="listitem" key={rule.key}><span className="engine-rule">{rule.rule}</span><span className={`engine-signal ${rule.tone}`}><i className={`status-dot ${rule.tone}`} />{rule.signal}</span><strong>{rule.points}<small>/{rule.maximum}</small></strong></div>)}</div>
      <div className="dynamic-zones" role="table" aria-label={`${symbol} live buy zones`}><div className="dynamic-zone-row dynamic-zone-header"><span>Zone</span><span>Price range</span><span>Action</span><span>Allocation</span></div>{engine.zones.map((zone) => <div className={`dynamic-zone-row ${zone.zone === engine.currentZone ? "current" : ""}`} role="row" key={zone.zone}><strong>{zone.zone}</strong><span>{zone.range}</span><span>{zone.action}</span><span>{zone.allocation}</span></div>)}</div>
    </div> : null}
  </>;
}

// จัดทำโดย: นายฐิติ เทอดพิทักษ์พงษ์ โดยใช้เทคโนโลยี AI จาก OpenAI · © 2026 Thiti Theadphitukphong · All Rights Reserved.
