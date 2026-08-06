"use client";

import { useEffect, useState } from "react";

type Macro = { key: string; label: string; unit: string; kind: string; value: number | null; change: number | null; date: string | null; status: "ok" | "unavailable"; error?: string };
const formatValue = (item: Macro) => item.value === null ? "—" : `${item.value.toLocaleString("en-US", { maximumFractionDigits: 2 })}${item.unit === "%" ? "%" : ""}`;
const formatChange = (item: Macro) => item.change === null ? "No prior value" : `${item.change >= 0 ? "+" : ""}${item.change.toFixed(2)}${item.unit === "%" ? " pp" : ""}`;

export default function LiveMacro() {
  const [macro, setMacro] = useState<Macro[]>([]);
  const [state, setState] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/market/macro", { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json() as { ok?: boolean; macro?: Macro[]; error?: string; available?: number; total?: number };
        if (!response.ok || !payload.macro) throw new Error(payload.error || "Macro request failed");
        if (!cancelled) { setMacro(payload.macro); setState("connected"); setMessage(payload.available === payload.total ? "" : `${payload.available ?? 0}/${payload.total ?? 0} macro series available`); }
      })
      .catch((error: unknown) => { if (!cancelled) { setState("error"); setMessage(error instanceof Error ? error.message : "Macro request failed"); } });
    return () => { cancelled = true; };
  }, []);

  const items: Macro[] = macro.length ? macro : Array.from({ length: 7 }, (_, index) => ({ key: String(index), label: "Loading", unit: "", kind: "", value: null, change: null, date: null, status: "unavailable" as const }));
  return <>
    <div className="macro-live-toolbar"><span className={`live-state ${state}`}><i className="status-dot" />{state === "connected" ? "FRED macro feed connected" : state === "loading" ? "Loading macro data" : "Macro data unavailable"}</span><span className="muted">Latest available observation · FRED</span></div>
    {message && <div className="indicator-message">{message}</div>}
    <div className="macro-grid" role="list" aria-label="Live macro indicators">{items.map((item) => <article className="macro-card" role="listitem" key={item.key}><div className="macro-card-top"><span>{item.label}</span><i className={`legend-dot ${item.status === "ok" ? item.kind === "risk" ? "caution" : "positive" : "neutral"}`} /></div><strong>{formatValue(item)}</strong><span className={`macro-trend ${item.change !== null && item.change >= 0 ? "positive" : "neutral"}`}>{item.status === "ok" ? `${formatChange(item)} · ${item.date}` : item.error || "Waiting for data"}</span></article>)}</div>
  </>;
}

