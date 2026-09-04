"use client";

import { useEffect, useState } from "react";
import {
  livePortfolios,
} from "../lib/portfolio-config";
import { usePortfolioSelection } from "./portfolio-selection";

type Indicators = {
  symbol: string;
  asOf: string;
  barsUsed: number;
  rsi14: number | null;
  macd: number | null;
  macdSignal: number | null;
  macdHistogram: number | null;
  macdTrend: string;
  ema20: number | null;
  ema50: number | null;
  ema200: number | null;
  emaTrend: string;
  volume: number | null;
  averageVolume20: number | null;
  volumeRatio: number | null;
  atrPercent: number | null;
  adx14: number | null;
  obvChangePercent: number | null;
};
const format = (value: number | null, digits = 2) =>
  value === null ? "—" : value.toFixed(digits);

export default function LiveIndicators() {
  const { selectedPortfolio } = usePortfolioSelection();
  const portfolio = livePortfolios.find((item) => item.id === selectedPortfolio) ?? livePortfolios[0];
  const { selectedSymbol: symbol, setSelectedSymbol: setSymbol } = usePortfolioSelection();
  const activeSymbol = portfolio.assets.some((asset) => asset.symbol === symbol) ? symbol : portfolio.assets[0].symbol;
  const [data, setData] = useState<Indicators | null>(null);
  const [state, setState] = useState("loading");
  const [message, setMessage] = useState("");
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/market/indicators?symbol=${activeSymbol}`, { cache: "no-store" })
      .then(async (response) => {
        const payload = (await response.json()) as {
          ok?: boolean;
          indicators?: Indicators;
          error?: string;
        };
        if (!response.ok || !payload.ok || !payload.indicators)
          throw new Error(payload.error || "Indicator request failed");
        if (!cancelled) {
          setData(payload.indicators);
          setState("connected");
          setMessage("");
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState("error");
          setMessage(
            error instanceof Error ? error.message : "Indicator request failed",
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, [activeSymbol]);
  const cards = data
    ? [
        {
          label: "RSI 14",
          value: format(data.rsi14, 1),
          context:
            data.rsi14 === null
              ? "Not available"
              : data.rsi14 < 35
                ? "Oversold"
                : data.rsi14 > 70
                  ? "Overbought"
                  : "Neutral",
          tone: data.rsi14 !== null && data.rsi14 < 35 ? "positive" : "neutral",
        },
        {
          label: "MACD",
          value: format(data.macd),
          context: data.macdTrend.replace("-", " "),
          tone:
            data.macdTrend === "golden-cross"
              ? "positive"
              : data.macdTrend === "bearish-cross"
                ? "caution"
                : "neutral",
        },
        {
          label: "EMA20/50/200",
          value: data.emaTrend.replace("-", " "),
          context: data.ema200 === null ? "Need 200 bars" : "Trend stack",
          tone: data.emaTrend === "bullish-stack" ? "positive" : "neutral",
        },
        {
          label: "Volume",
          value:
            data.volumeRatio === null ? "—" : `${data.volumeRatio.toFixed(2)}×`,
          context:
            data.volumeRatio !== null && data.volumeRatio > 1
              ? "Above average"
              : "Below average",
          tone:
            data.volumeRatio !== null && data.volumeRatio > 1
              ? "positive"
              : "neutral",
        },
        {
          label: "ATR 14",
          value:
            data.atrPercent === null ? "—" : `${data.atrPercent.toFixed(2)}%`,
          context: "Average true range",
          tone: "neutral",
        },
        {
          label: "ADX 14",
          value: format(data.adx14, 1),
          context:
            data.adx14 !== null && data.adx14 >= 25
              ? "Trend active"
              : "Trend weak",
          tone:
            data.adx14 !== null && data.adx14 >= 25 ? "positive" : "neutral",
        },
        {
          label: "OBV",
          value:
            data.obvChangePercent === null
              ? "—"
              : `${data.obvChangePercent >= 0 ? "+" : ""}${data.obvChangePercent.toFixed(1)}%`,
          context: "20-bar flow",
          tone:
            data.obvChangePercent !== null && data.obvChangePercent >= 0
              ? "positive"
              : "caution",
        },
      ]
    : [];
  return (
    <>
      <div className="indicator-toolbar">
        <span className={`live-state ${state}`}>
          <i className="status-dot" />
          {state === "connected"
            ? `Daily indicators · ${data?.barsUsed ?? 0} bars`
            : state === "loading"
              ? "Calculating daily indicators"
              : "Daily indicator data unavailable"}
        </span>
        <select
          aria-label="Select symbol indicators"
          value={activeSymbol}
          onChange={(event) => {
            setState("loading");
            setMessage("");
            setSymbol(event.target.value);
          }}
        >
          {portfolio.assets.map((asset) => (
            <option key={asset.symbol}>{asset.symbol}</option>
          ))}
        </select>
      </div>
      {message ? (
        <div className="indicator-message">{message}</div>
      ) : (
        <div
          className="technical-grid"
          role="list"
          aria-label={`${activeSymbol} technical indicators`}
        >
          {cards.map((item) => (
            <article
              className="technical-card"
              role="listitem"
              key={item.label}
            >
              <div className="technical-card-top">
                <span>{item.label}</span>
                <i className={`legend-dot ${item.tone}`} />
              </div>
              <strong>{item.value}</strong>
              <span className={`technical-context ${item.tone}`}>
                {item.context}
              </span>
            </article>
          ))}
        </div>
      )}
    </>
  );
}

// จัดทำโดย: นายฐิติ เทอดพิทักษ์พงษ์ โดยใช้เทคโนโลยี AI จาก OpenAI · © 2026 Thiti Theadphitukphong · All Rights Reserved.
