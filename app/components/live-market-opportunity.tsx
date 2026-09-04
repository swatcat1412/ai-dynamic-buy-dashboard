"use client";

import { useEffect, useState } from "react";

type MarketSnapshot = {
  label: string;
  asOf: string;
  currentValue: number;
  barsUsed: number;
  partialHistory: boolean;
  opportunity: string;
  multiplier: number;
  drawdowns: Array<{
    sessions: number;
    high: number;
    drawdownPercent: number;
  }>;
};

const opportunityLabels: Record<string, string> = {
  normal: "Normal",
  pullback: "Pullback",
  correction: "Correction",
  "major-correction": "Major correction",
  panic: "Panic opportunity",
};

export default function LiveMarketOpportunity() {
  const [market, setMarket] = useState<MarketSnapshot | null>(null);
  const [state, setState] = useState<"loading" | "connected" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 12_000);

    fetch("/api/market/opportunity", {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        const payload = (await response.json()) as {
          ok?: boolean;
          market?: MarketSnapshot;
          error?: string;
        };
        if (!response.ok || !payload.ok || !payload.market) {
          throw new Error(payload.error || "Market opportunity request failed");
        }
        setMarket(payload.market);
        setState("connected");
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) {
          setMessage("Market opportunity request timed out");
        } else {
          setMessage(
            error instanceof Error
              ? error.message
              : "Market opportunity request failed",
          );
        }
        setState("error");
      })
      .finally(() => window.clearTimeout(timeout));

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  if (!market) {
    return (
      <div className="market-opportunity-empty">
        <span className={`live-state ${state}`}>
          <i className="status-dot" />
          {state === "loading"
            ? "Calculating Nasdaq drawdown"
            : "Market opportunity unavailable"}
        </span>
        <p>{message || "Waiting for 120 daily Nasdaq observations from FRED."}</p>
      </div>
    );
  }

  const opportunityLabel =
    opportunityLabels[market.opportunity] ?? market.opportunity;

  return (
    <div className="market-opportunity-layout">
      <article className={`market-opportunity-card ${market.opportunity}`}>
        <div className="score-card-header">
          <span>{market.label}</span>
          <span className="score-date">{market.asOf}</span>
        </div>
        <div className="market-multiplier">
          {market.multiplier.toFixed(2).replace(/\.00$/, "")}×
        </div>
        <p>
          <strong>{opportunityLabel}</strong> · Correction multiplier based on
          the drawdown from the 120-session high.
        </p>
        <div className="market-opportunity-meta">
          <span>Latest</span>
          <strong>{market.currentValue.toLocaleString("en-US")}</strong>
          <span>History</span>
          <strong>
            {market.barsUsed}/120{market.partialHistory ? " partial" : " sessions"}
          </strong>
        </div>
      </article>

      <div className="drawdown-grid" role="list" aria-label="Nasdaq drawdown windows">
        {market.drawdowns.map((window) => (
          <article className="drawdown-card" role="listitem" key={window.sessions}>
            <span>{window.sessions}-session drawdown</span>
            <strong>{window.drawdownPercent.toFixed(2)}%</strong>
            <small>
              High {window.high.toLocaleString("en-US", { maximumFractionDigits: 2 })}
            </small>
          </article>
        ))}
      </div>
    </div>
  );
}

// จัดทำโดย: นายฐิติ เทอดพิทักษ์พงษ์ โดยใช้ OpenAI Codex | © 2026 Thiti Theadphitukphong · All Rights Reserved.
