"use client";

import { useEffect, useState } from "react";

type Status = { provider: string; liveDataAvailable: boolean; lastUpdated: string | null };

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
  const [status, setStatus] = useState<Status>({ provider: "checking", liveDataAvailable: false, lastUpdated: null });

  useEffect(() => {
    fetch("/api/market/status", { cache: "no-store" })
      .then((response) => response.json() as Promise<Status>)
      .then(setStatus)
      .catch(() => undefined);
  }, []);

  return (
    <div className="data-status-bar" role="status" aria-label="Dashboard data status">
      <div className="data-status-intro">
        <span className="status-dot" />
        <span>Data pipeline</span>
      </div>
      <div className="data-status-items">
        <span>Source <strong>{status.provider}</strong></span>
        <span>Cache updated <strong>{formatTimestamp(status.lastUpdated)}</strong></span>
        <span className="live-feed"><i /> Daily data <strong>{status.liveDataAvailable ? "Configured" : "Not connected"}</strong></span>
      </div>
    </div>
  );
}

// จัดทำโดย: นายฐิติ เทอดพิทักษ์พงษ์ โดยใช้เทคโนโลยี AI จาก OpenAI · © 2026 Thiti Theadphitukphong · All Rights Reserved.
