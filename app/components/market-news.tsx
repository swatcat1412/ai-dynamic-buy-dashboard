"use client";

import { useEffect, useState } from "react";

type NewsItem = { title: string; url: string; source: string; publishedAt: string; sentiment: number | null; sentimentLabel: "Positive" | "Negative" | "Neutral"; symbols: string[] };
const formatPublishedDate = (value: string) => value ? new Intl.DateTimeFormat("th-TH", { dateStyle: "medium", timeZone: "Asia/Bangkok" }).format(new Date(value)) : "";

export default function MarketNews() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [state, setState] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/market/news", { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json() as { ok?: boolean; available?: boolean; news?: NewsItem[]; error?: string };
        if (!response.ok || !payload.ok) throw new Error(payload.error || "Market news request failed");
        setNews(payload.news || []);
        setState("connected");
        if (!payload.available) setMessage("Add MARKETAUX_API_TOKEN to connect market news.");
      })
      .catch((error: unknown) => {
        setState("error");
        setMessage(error instanceof Error ? error.message : "Market news unavailable");
      });
  }, []);

  return <div className="news-panel">
    <div className="news-toolbar"><span className={`live-state ${state}`}><i className="status-dot" />{state === "connected" ? "News feed cached" : state === "loading" ? "Loading market news" : "News unavailable"}</span><span className="muted">Sentiment is a supporting signal, not a trading decision.</span></div>
    {message && <div className="indicator-message">{message}</div>}
    {news.length ? <div className="news-grid">{news.map((item) => <article className="news-card" key={item.url}><div className="news-card-top"><span>{item.source}</span><span className={item.sentimentLabel.toLowerCase()}>{item.sentimentLabel}</span></div><a href={item.url} target="_blank" rel="noreferrer">{item.title}</a><div className="news-card-meta">{item.symbols.join(" · ")}{item.publishedAt ? ` · ${formatPublishedDate(item.publishedAt)}` : ""}</div></article>)}</div> : !message && <div className="indicator-message">No cached market news is available.</div>}
  </div>;
}

// จัดทำโดย: นายฐิติ เทอดพิทักษ์พงษ์ โดยใช้เทคโนโลยี AI จาก OpenAI · © 2026 Thiti Theadphitukphong · All Rights Reserved.
