"use client";

import { useEffect, useState } from "react";

type Status = { provider: string; liveDataAvailable: boolean; lastUpdated: string };

export default function DataStatus() {
  const [status, setStatus] = useState<Status>({ provider: "static", liveDataAvailable: false, lastUpdated: "—" });

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
        <span>Snapshot <strong>{status.lastUpdated}</strong></span>
        <span className="live-feed"><i /> Daily data <strong>{status.liveDataAvailable ? "Configured" : "Not connected"}</strong></span>
      </div>
    </div>
  );
}

// จัดทำโดย: นายฐิติ เทอดพิทักษ์พงษ์ โดยใช้ Claude AI · © 2026 Thiti Theadphitukphong · All Rights Reserved.
