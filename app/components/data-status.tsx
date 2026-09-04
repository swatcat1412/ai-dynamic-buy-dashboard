"use client";

import { useEffect, useState } from "react";

type ConnectionState =
  | "checking"
  | "configured"
  | "connected"
  | "degraded"
  | "unconfigured"
  | "error";

type Status = {
  provider: string;
  connectionState: ConnectionState;
  lastUpdated: string | null;
  persistentCache?: {
    freshCoverageCount: number;
    expectedEntryCount: number;
  };
  runtime?: {
    quota: { used: number; left: number; limit: number } | null;
  };
};

const stateLabels: Record<ConnectionState, string> = {
  checking: "Checking",
  configured: "Configured · waiting for data",
  connected: "Connected",
  degraded: "Degraded · fallback active",
  unconfigured: "Not configured",
  error: "Unavailable · retrying",
};

function formatTimestamp(value: string | null) {
  if (!value) return "Waiting for cache";
  const timestamp = new Date(value);
  if (Number.isNaN(timestamp.getTime())) return "Unavailable";
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Bangkok",
  }).format(timestamp);
}

export default function DataStatus() {
  const [status, setStatus] = useState<Status>({
    provider: "checking",
    connectionState: "checking",
    lastUpdated: null,
  });

  useEffect(() => {
    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    const load = async () => {
      if (retryTimer) {
        clearTimeout(retryTimer);
        retryTimer = undefined;
      }
      try {
        const response = await fetch("/api/market/status", {
          cache: "no-store",
          signal: AbortSignal.timeout(10_000),
        });
        if (!response.ok)
          throw new Error(`Status request failed (${response.status})`);
        const payload = (await response.json()) as Status;
        if (!cancelled) setStatus(payload);
      } catch {
        if (!cancelled) {
          setStatus((current) => ({ ...current, connectionState: "error" }));
          retryTimer = setTimeout(load, 5_000);
        }
      }
    };
    void load();
    const interval = setInterval(load, 60_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, []);

  const cacheCoverage = status.persistentCache
    ? `${status.persistentCache.freshCoverageCount}/${status.persistentCache.expectedEntryCount} fresh`
    : "Checking";
  const quota = status.runtime?.quota;

  return (
    <div className="data-status-bar" role="status" aria-label="Dashboard data status">
      <div className="data-status-intro">
        <span className="status-dot" />
        <span>Data pipeline</span>
      </div>
      <div className="data-status-items">
        <span>Source <strong>{status.provider}</strong></span>
        <span>Cache updated <strong>{formatTimestamp(status.lastUpdated)}</strong></span>
        <span>Cache coverage <strong>{cacheCoverage}</strong></span>
        <span className={`live-feed ${status.connectionState}`}>
          <i /> Daily data <strong>{stateLabels[status.connectionState]}</strong>
        </span>
        {quota ? (
          <span>API quota <strong>{quota.left}/{quota.limit} left</strong></span>
        ) : null}
      </div>
    </div>
  );
}

// จัดทำโดย: นายฐิติ เทอดพิทักษ์พงษ์ โดยใช้เทคโนโลยี AI จาก OpenAI · © 2026 Thiti Theadphitukphong · All Rights Reserved.
