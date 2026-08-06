Exit code: 0
Wall time: 0.7 seconds
Output:
"use client";

import { useEffect, useState } from "react";

type Engine = { symbol: string; price: number; currentZone: string; score: number; action: string; confidence: number; dataAvailable: boolean; reasons: string[]; rules: Array<{ key: string; rule: string; signal: string; points: number; maximum: number; tone: string }>; zones: Array<{ zone: string; range: string; action: string; allocation: string }> };
const symbols = ["RKLB", "GOOGL", "LLY", "JEPQ"];

export default function LiveBuyEngine() {
  const [symbol, setSymbol] = useState("RKLB");
  const [engine, setEngine] = useState<Engine | null>(null);
  const [state, setState] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    setState("loading");
    fetch(`/api/market/buy-engine?symbol=${symbol}`, { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json() as { ok?: boolean; engine?: Engine; error?: string };
        if (!response.ok || !payload.ok || !payload.engine) throw new Error(payload.error || "Buy engine request failed");
        if (!cancelled) { setEngine(payload.engine); setMessage(""); setState("connected"); }
      })
      .catch((error: unknown) => { if (!cancelled) { setState("error"); setMessage(error instanceof Error ? error.message : "Buy engine request failed"); } });
    return () => { cancelled = true; };
  }, [symbol]);

  return <>
    <div className="engine-toolbar"><span className={`live-state ${state}`}><i className="status-dot" />{state === "connected" ? "Live decision support" : state === "loading" ? "Evaluating buy rules" : "Buy engine unavailable"}</span><label>Symbol <select value={symbol} onChange={(event) => setSymbol(event.target.value)}>{symbols.map((item) => <option key={item}>{item}</option>)}</select></label></div>
    {message ? <div className="indicator-message">{message}</div> : engine ? <div className="dynamic-engine-layout">
      <article className="engine-score-card"><div className="score-card-header"><span>{engine.symbol} buy engine</span><span className="score-date">LIVE</span></div><div className="engine-score">{engine.score}<span>/100</span></div><p>Last price <strong>${engine.price.toFixed(2)}</strong> · Zone <strong>{engine.currentZone}</strong></p><div className="score-meter"><span style={{ width: `${engine.score}%` }} /></div><div className={`engine-status ${engine.action.toLowerCase()}`}>{engine.action} · {engine.confidence}% confidence</div><ul className="engine-reasons">{engine.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul></article>
      <div className="engine-list" role="list" aria-label={`${symbol} buy engine rules`}><div className="engine-row engine-header"><span>Rule</span><span>Signal</span><span>Points</span></div>{engine.rules.map((rule) => <div className="engine-row" role="listitem" key={rule.key}><span className="engine-rule">{rule.rule}</span><span className={`engine-signal ${rule.tone}`}><i className={`status-dot ${rule.tone}`} />{rule.signal}</span><strong>{rule.points}<small>/{rule.maximum}</small></strong></div>)}</div>
      <div className="dynamic-zones" role="table" aria-label={`${symbol} live buy zones`}><div className="dynamic-zone-row dynamic-zone-header"><span>Zone</span><span>Price range</span><span>Action</span><span>Allocation</span></div>{engine.zones.map((zone) => <div className={`dynamic-zone-row ${zone.zone === engine.currentZone ? "current" : ""}`} role="row" key={zone.zone}><strong>{zone.zone}</strong><span>{zone.range}</span><span>{zone.action}</span><span>{zone.allocation}</span></div>)}</div>
    </div> : null}
  </>;
}

