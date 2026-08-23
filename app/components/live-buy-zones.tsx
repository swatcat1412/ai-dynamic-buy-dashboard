"use client";

import { useEffect, useState } from "react";
import { portfolioSymbols } from "../lib/portfolio-config";

type Zone = { zone: string; range: string; action: string; allocation: string };
type Asset = {
  symbol: string;
  price: number;
  currentZone: string;
  zones: Zone[];
};
const zoneTone = (zone: string) =>
  zone === "A"
    ? "wait"
    : zone === "C"
      ? "buy-strong"
      : zone === "E"
        ? "buy-max"
        : "buy";

export default function LiveBuyZones() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [state, setState] = useState("loading");
  const [message, setMessage] = useState("");
  useEffect(() => {
    let cancelled = false;
    Promise.all(
      portfolioSymbols.map(async (symbol) => {
        const response = await fetch(
          `/api/market/buy-engine?symbol=${symbol}`,
          { cache: "no-store" },
        );
        const payload = (await response.json()) as {
          ok?: boolean;
          engine?: Asset;
          error?: string;
        };
        if (!response.ok || !payload.ok || !payload.engine)
          throw new Error(payload.error || `${symbol} data unavailable`);
        return payload.engine;
      }),
    )
      .then((nextAssets) => {
        if (!cancelled) {
          setAssets(nextAssets);
          setState("connected");
          setMessage("");
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState("error");
          setMessage(
            error instanceof Error
              ? error.message
              : "Dynamic levels unavailable",
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);
  if (message) return <div className="indicator-message">{message}</div>;
  return (
    <div className="zone-grid">
      {assets.map((asset) => (
        <article className="zone-card" key={asset.symbol}>
          <div className="zone-card-header">
            <div>
              <span className="zone-symbol">{asset.symbol}</span>
              <p>
                Daily close {asset.price.toFixed(2)} · Current zone{" "}
                {asset.currentZone}
              </p>
            </div>
            <span className={`zone-count ${state}`}>5 dynamic zones</span>
          </div>
          <div
            className="zone-table"
            role="table"
            aria-label={`${asset.symbol} dynamic buy zones`}
          >
            <div className="zone-row zone-header" role="row">
              <span>Zone</span>
              <span>Price range</span>
              <span>Action</span>
              <span>Buy</span>
            </div>
            {asset.zones.map((zone) => (
              <div className="zone-row" role="row" key={zone.zone}>
                <span className={`zone-badge ${zoneTone(zone.zone)}`}>
                  {zone.zone}
                </span>
                <span className="threshold">{zone.range}</span>
                <span className={`action-label ${zoneTone(zone.zone)}`}>
                  {zone.action}
                </span>
                <strong className="allocation-cell">{zone.allocation}</strong>
              </div>
            ))}
          </div>
        </article>
      ))}
      {state === "loading" && assets.length === 0 ? (
        <div className="indicator-message">
          กำลังคำนวณระดับราคาจากข้อมูลรายวัน...
        </div>
      ) : null}
    </div>
  );
}

// จัดทำโดย: นายฐิติ เทอดพิทักษ์พงษ์ โดยใช้เทคโนโลยี AI จาก OpenAI · © 2026 Thiti Theadphitukphong · All Rights Reserved.
