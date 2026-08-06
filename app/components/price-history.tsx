"use client";

import { useEffect, useMemo, useState } from "react";

type Bar = { time: string; close: number };
const symbols = ["RKLB", "GOOGL", "LLY", "JEPQ"];

function ema(values: number[], period: number) {
  if (values.length < period) return values.map(() => null as number | null);
  const result: (number | null)[] = Array(period - 1).fill(null);
  const multiplier = 2 / (period + 1);
  let current = values.slice(0, period).reduce((sum, value) => sum + value, 0) / period;
  result.push(current);
  for (const value of values.slice(period)) { current = (value - current) * multiplier + current; result.push(current); }
  return result;
}

export default function PriceHistory() {
  const [symbol, setSymbol] = useState("RKLB");
  const [range, setRange] = useState("120");
  const [bars, setBars] = useState<Bar[]>([]);
  const [state, setState] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    setState("loading");
    fetch(`/api/market/history?symbol=${symbol}&range=${range}`, { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json() as { ok?: boolean; history?: Bar[]; error?: string };
        if (!response.ok || !payload.history) throw new Error(payload.error || "History request failed");
        if (!cancelled) { setBars(payload.history); setState("connected"); setMessage(""); }
      })
      .catch((error: unknown) => { if (!cancelled) { setState("error"); setMessage(error instanceof Error ? error.message : "History request failed"); } });
    return () => { cancelled = true; };
  }, [symbol, range]);

  const points = useMemo(() => {
    if (!bars.length) return { close: "", ema: "", min: 0, max: 0, last: null as number | null };
    const values = bars.map((bar) => bar.close);
    const emaValues = ema(values, 20);
    const all = values.concat(emaValues.filter((value): value is number => value !== null));
    const min = Math.min(...all);
    const max = Math.max(...all);
    const height = 190;
    const width = 760;
    const x = (index: number) => bars.length === 1 ? width / 2 : (index / (bars.length - 1)) * width;
    const y = (value: number) => height - ((value - min) / Math.max(max - min, 0.0001)) * height;
    const path = (series: (number | null)[]) => series.map((value, index) => value === null ? "" : `${index ? "L" : "M"} ${x(index).toFixed(1)} ${y(value).toFixed(1)}`).filter(Boolean).join(" ");
    return { close: path(values), ema: path(emaValues), min, max, last: values.at(-1) ?? null, firstDate: bars[0].time, lastDate: bars.at(-1)?.time };
  }, [bars]);

  return <div className="history-panel">
    <div className="history-toolbar"><div className={`live-state ${state}`}><i className="status-dot" />{state === "connected" ? `${bars.length} daily bars` : state === "loading" ? "Loading price history" : "History unavailable"}</div><div className="history-controls"><label>Symbol <select value={symbol} onChange={(event) => setSymbol(event.target.value)}>{symbols.map((item) => <option key={item}>{item}</option>)}</select></label><label>Range <select value={range} onChange={(event) => setRange(event.target.value)}><option value="60">60 days</option><option value="120">120 days</option><option value="260">260 days</option></select></label></div></div>
    {message ? <div className="indicator-message">{message}</div> : <div className="history-chart-wrap"><svg className="history-chart" viewBox="0 0 800 240" role="img" aria-label={`${symbol} closing price and EMA20 history chart`} preserveAspectRatio="none"><title>{symbol} price history</title><desc>Closing price line with 20-day exponential moving average.</desc><line x1="0" y1="210" x2="800" y2="210" className="chart-axis" /><line x1="0" y1="20" x2="0" y2="210" className="chart-axis" /><path d={points.close} className="chart-line close-line" /><path d={points.ema} className="chart-line ema-line" /></svg><div className="history-axis"><span>{points.firstDate || "—"}</span><span>Close <i className="chart-key close-key" /> EMA20 <i className="chart-key ema-key" /></span><span>{points.lastDate || "—"}</span></div><div className="history-last">Latest close: <strong>{points.last === null ? "—" : points.last.toFixed(2)}</strong> · Range: {points.min ? `${points.min.toFixed(2)} – ${points.max.toFixed(2)}` : "—"}</div></div>}
  </div>;
}

