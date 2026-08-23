"use client";

import { useEffect, useMemo, useState } from "react";
import {
  defaultPortfolioSymbol,
  portfolioSymbols,
} from "../lib/portfolio-config";

type Bar = { time: string; close: number };
const formatPrice = (value: number) =>
  value >= 100 ? value.toFixed(0) : value.toFixed(2);
function ema(values: number[], period: number) {
  if (values.length < period) return values.map(() => null as number | null);
  const result: (number | null)[] = Array(period - 1).fill(null);
  const multiplier = 2 / (period + 1);
  let current =
    values.slice(0, period).reduce((sum, value) => sum + value, 0) / period;
  result.push(current);
  for (const value of values.slice(period)) {
    current = (value - current) * multiplier + current;
    result.push(current);
  }
  return result;
}

export default function PriceHistory() {
  const [symbol, setSymbol] = useState<string>(defaultPortfolioSymbol);
  const [range, setRange] = useState("120");
  const [bars, setBars] = useState<Bar[]>([]);
  const [state, setState] = useState("loading");
  const [message, setMessage] = useState("");
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/market/history?symbol=${symbol}&range=${range}`, {
      cache: "no-store",
    })
      .then(async (response) => {
        const payload = (await response.json()) as {
          ok?: boolean;
          history?: Bar[];
          error?: string;
        };
        if (!response.ok || !payload.history)
          throw new Error(payload.error || "History request failed");
        if (!cancelled) {
          setBars(payload.history);
          setState("connected");
          setMessage("");
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState("error");
          setMessage(
            error instanceof Error ? error.message : "History request failed",
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, [symbol, range]);
  const points = useMemo(() => {
    const width = 724,
      left = 56,
      right = 780,
      top = 18,
      bottom = 210;
    if (!bars.length)
      return {
        close: "",
        ema: "",
        min: 0,
        max: 0,
        last: null as number | null,
        firstDate: "",
        lastDate: "",
        grid: [] as Array<{ y: number; value: number; label: string }>,
        emaAvailable: false,
      };
    const values = bars.map((bar) => bar.close);
    const emaValues = ema(values, 20);
    const all = values.concat(
      emaValues.filter((value): value is number => value !== null),
    );
    const min = Math.min(...all),
      max = Math.max(...all),
      spread = Math.max(max - min, 0.0001);
    const x = (index: number) =>
      bars.length === 1
        ? (left + right) / 2
        : left + (index / (bars.length - 1)) * width;
    const y = (value: number) =>
      bottom - ((value - min) / spread) * (bottom - top);
    const path = (series: (number | null)[]) =>
      series
        .map((value, index) =>
          value === null
            ? ""
            : `${index ? "L" : "M"} ${x(index).toFixed(1)} ${y(value).toFixed(1)}`,
        )
        .filter(Boolean)
        .join(" ");
    const grid = Array.from({ length: 5 }, (_, index) => {
      const ratio = index / 4;
      const value = max - ratio * spread;
      return {
        y: top + ratio * (bottom - top),
        value,
        label: formatPrice(value),
      };
    });
    return {
      close: path(values),
      ema: path(emaValues),
      min,
      max,
      last: values.at(-1) ?? null,
      firstDate: bars[0].time,
      lastDate: bars.at(-1)?.time ?? "",
      grid,
      emaAvailable: emaValues.some((value) => value !== null),
    };
  }, [bars]);
  return (
    <div className="history-panel">
      <div className="history-toolbar">
        <div className={`live-state ${state}`}>
          <i className="status-dot" />
          {state === "connected"
            ? `${bars.length} daily bars`
            : state === "loading"
              ? "Loading price history"
              : "History unavailable"}
        </div>
        <div className="history-controls">
          <label>
            Symbol{" "}
            <select
              value={symbol}
              onChange={(event) => {
                setState("loading");
                setMessage("");
                setSymbol(event.target.value);
              }}
            >
              {portfolioSymbols.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label>
            Range{" "}
            <select
              value={range}
              onChange={(event) => {
                setState("loading");
                setMessage("");
                setRange(event.target.value);
              }}
            >
              <option value="5">5 days</option>
              <option value="30">30 days · 1 month</option>
              <option value="60">60 days</option>
              <option value="120">120 days</option>
            </select>
          </label>
        </div>
      </div>
      {message ? (
        <div className="indicator-message">{message}</div>
      ) : (
        <div className="history-chart-wrap">
          <svg
            className="history-chart"
            viewBox="0 0 800 240"
            role="img"
            aria-label={`${symbol} closing price history with price scale`}
            preserveAspectRatio="none"
          >
            <title>{symbol} price history</title>
            <desc>
              Closing price line with a 20-day exponential moving average and
              price labels.
            </desc>
            {points.grid.map((tick) => (
              <g key={tick.label}>
                <line
                  x1="56"
                  y1={tick.y}
                  x2="780"
                  y2={tick.y}
                  className="chart-grid"
                />
                <text
                  x="48"
                  y={tick.y + 3}
                  textAnchor="end"
                  className="chart-price-label"
                >
                  {tick.label}
                </text>
              </g>
            ))}
            <line x1="56" y1="210" x2="780" y2="210" className="chart-axis" />
            <line x1="56" y1="18" x2="56" y2="210" className="chart-axis" />
            <path d={points.close} className="chart-line close-line" />
            {points.ema && (
              <path d={points.ema} className="chart-line ema-line" />
            )}
          </svg>
          <div className="history-axis">
            <span>{points.firstDate || "—"}</span>
            <span>
              Close <i className="chart-key close-key" /> EMA20{" "}
              <i className="chart-key ema-key" />
            </span>
            <span>{points.lastDate || "—"}</span>
          </div>
          <div className="history-last">
            Latest close:{" "}
            <strong>
              {points.last === null ? "—" : points.last.toFixed(2)}
            </strong>{" "}
            · Range:{" "}
            {points.min
              ? `${points.min.toFixed(2)} – ${points.max.toFixed(2)}`
              : "—"}
            {!points.emaAvailable && bars.length > 0
              ? " · EMA20 requires 20 days"
              : ""}
          </div>
        </div>
      )}
    </div>
  );
}

// จัดทำโดย: นายฐิติ เทอดพิทักษ์พงษ์ โดยใช้เทคโนโลยี AI จาก OpenAI · © 2026 Thiti Theadphitukphong · All Rights Reserved.
