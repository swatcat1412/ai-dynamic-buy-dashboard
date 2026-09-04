"use client";

import { useEffect, useMemo, useState } from "react";
import {
  livePortfolios,
  type LivePortfolioId,
} from "../lib/portfolio-config";
import { usePortfolioSelection } from "./portfolio-selection";

type Quote = {
  symbol: string;
  price: number;
  changePercent: number | null;
  currency: string;
};
type HistoryBar = { time: string; close: number };
export default function LivePortfolio() {
  const { selectedPortfolio, setSelectedPortfolio, selectedSymbol, setSelectedSymbol } = usePortfolioSelection();
  const portfolio = livePortfolios.find((item) => item.id === selectedPortfolio) ?? livePortfolios[0];
  const assets = portfolio.assets;
  const activeSymbol = assets.some((asset) => asset.symbol === selectedSymbol) ? selectedSymbol : assets[0].symbol;
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [history, setHistory] = useState<HistoryBar[]>([]);
  const [state, setState] = useState("loading");
  const [message, setMessage] = useState("");
  const quoteMap = useMemo(
    () => new Map(quotes.map((quote) => [quote.symbol, quote])),
    [quotes],
  );
  const selectedHistory = history[history.length - 1];

  useEffect(() => {
    let cancelled = false;
    async function loadQuotes() {
      try {
        const statusResponse = await fetch("/api/market/status", {
          cache: "no-store",
        });
        const status = (await statusResponse.json()) as { hasApiKey?: boolean };
        if (!status.hasApiKey) {
          if (!cancelled) {
            setState("fallback");
            setMessage("Add TWELVE_DATA_API_KEY to enable live quotes.");
          }
          return;
        }
        const response = await fetch(`/api/market/quotes?portfolioId=${selectedPortfolio}`, {
          cache: "no-store",
        });
        const payload = (await response.json()) as {
          ok?: boolean;
          quotes?: Quote[];
          error?: string;
        };
        if (!response.ok || !payload.ok || !payload.quotes)
          throw new Error(payload.error || "Quote request failed");
        if (!cancelled) {
          setQuotes(payload.quotes);
          setState("connected");
          setMessage("");
        }
      } catch (error) {
        if (!cancelled) {
          setState("error");
          setMessage(
            error instanceof Error
              ? error.message
              : "Daily price request failed",
          );
        }
      }
    }
    void loadQuotes();
    return () => {
      cancelled = true;
    };
  }, [selectedPortfolio]);

  useEffect(() => {
    let cancelled = false;
    async function loadHistory() {
      setHistory([]);
      try {
        const response = await fetch(
          `/api/market/history?symbol=${activeSymbol}`,
          { cache: "no-store" },
        );
        const payload = (await response.json()) as {
          ok?: boolean;
          history?: HistoryBar[];
        };
        if (!response.ok || !payload.ok || !payload.history) return;
        if (!cancelled) setHistory(payload.history);
      } catch {
        if (!cancelled) setHistory([]);
      }
    }
    void loadHistory();
    return () => {
      cancelled = true;
    };
  }, [activeSymbol]);

  const stateLabel =
    state === "connected"
      ? "Daily prices connected"
      : state === "loading"
        ? "Loading daily prices"
        : state === "fallback"
          ? "Static data mode"
          : "Daily price data unavailable";
  const totalWeight = assets.reduce((sum, asset) => sum + asset.weight, 0);

  return (
    <>
      <div className="portfolio-live-toolbar">
        <span className={`live-state ${state}`}>
          <i className="status-dot" />
          {stateLabel}
        </span>
        <label className="portfolio-selector">Portfolio
          <select aria-label="Select portfolio" value={selectedPortfolio} onChange={(event) => setSelectedPortfolio(event.target.value as LivePortfolioId)}>
            {livePortfolios.map((item) => <option key={item.id} value={item.id}>{item.label} · {item.name}</option>)}
          </select>
        </label>
      </div>
      <div className="portfolio-layout">
        <article className="portfolio-summary">
          <div className="summary-topline">
            <span className="summary-label">{portfolio.label} · Target allocation</span>
            <span className="summary-status">
              <span className="status-dot" /> Balanced
            </span>
          </div>
          <div className="allocation-total">
            {totalWeight}
            <span>%</span>
          </div>
          <p>
            Target weights come from the centralized portfolio registry while
            daily prices are loaded from the configured market-data provider.
          </p>
          <div
            className="allocation-stack"
            aria-label="Portfolio allocation breakdown"
          >
            {assets.map((asset) => (
              <span
                className={`allocation-segment ${asset.tone}`}
                key={asset.symbol}
                style={{ width: `${asset.weight}%` }}
              />
            ))}
          </div>
          <div className="allocation-legend">
            {assets.map((asset) => (
              <span key={asset.symbol}>
                <i className={`legend-dot ${asset.tone}`} />
                {asset.symbol}
              </span>
            ))}
          </div>
          <div className="history-preview">
            <div className="summary-topline">
              <span>Historical data</span>
              <select
                aria-label="Select symbol history"
                value={activeSymbol}
                onChange={(event) => setSelectedSymbol(event.target.value)}
              >
                {assets.map((asset) => (
                  <option key={asset.symbol}>{asset.symbol}</option>
                ))}
              </select>
            </div>
            <strong>
              {history.length
                ? `${history.length} daily bars loaded`
                : "Waiting for history"}
            </strong>
            <span>
              {selectedHistory
                ? `Latest close ${selectedHistory.close.toFixed(2)} · ${selectedHistory.time}`
                : "Select a symbol to check /history"}
            </span>
          </div>
        </article>
        <div
          className="portfolio-table"
          role="table"
          aria-label="Portfolio allocation and live quotes"
        >
          <div className="portfolio-row portfolio-header" role="row">
            <span>Symbol</span>
            <span>Asset / Daily price</span>
            <span>Target weight</span>
          </div>
          {assets.map((asset, index) => {
            const quote = quoteMap.get(asset.symbol);
            const change = quote?.changePercent;
            return (
              <div className="portfolio-row" role="row" key={asset.symbol}>
                <span className="symbol-cell">
                  <i className={`legend-dot ${asset.tone}`} />
                  {asset.symbol}
                </span>
                <span className="asset-name">
                  <strong>
                    {quote
                      ? new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: quote.currency || "USD",
                        }).format(quote.price)
                      : "—"}
                  </strong>
                  <small
                    className={
                      change !== undefined && change !== null && change >= 0
                        ? "positive"
                        : "caution"
                    }
                  >
                    {change === null || change === undefined
                      ? "No quote"
                      : `${change >= 0 ? "+" : ""}${change.toFixed(2)}% today`}
                  </small>
                </span>
                <span className="weight-cell">
                  <strong>{asset.weight}%</strong>
                  <small>{String(index + 1).padStart(2, "0")}</small>
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="foundation-note">
        <span>Data mode</span>
        <p>
          {message ||
            (state === "connected"
              ? "Portfolio quotes and history are connected. Macro, indicators, and Buy Engine load from their live endpoints."
              : "Target allocation is available; waiting for daily market data.")}
        </p>
      </div>
    </>
  );
}

// จัดทำโดย: นายฐิติ เทอดพิทักษ์พงษ์ โดยใช้เทคโนโลยี AI จาก OpenAI · © 2026 Thiti Theadphitukphong · All Rights Reserved.
