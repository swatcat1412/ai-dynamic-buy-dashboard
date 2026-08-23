import { portfolioSymbols, type PortfolioSymbol } from "./portfolio-config";

export type MarketNewsItem = {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  sentiment: number | null;
  sentimentLabel: "Positive" | "Negative" | "Neutral";
  symbols: string[];
};

type MarketauxEntity = { symbol?: string; sentiment_score?: number };
type MarketauxArticle = { title?: string; url?: string; source?: string; published_at?: string; entities?: MarketauxEntity[] };
type MarketauxResponse = { data?: MarketauxArticle[]; error?: string; detail?: string };

let cachedNews: { expiresAt: number; value: MarketNewsItem[] } | null = null;
const CACHE_TTL_MS = 30 * 60 * 1000;

function sentimentLabel(value: number | null): MarketNewsItem["sentimentLabel"] {
  if (value === null || Math.abs(value) < 0.12) return "Neutral";
  return value > 0 ? "Positive" : "Negative";
}

export async function getMarketNews(symbols: readonly PortfolioSymbol[] = portfolioSymbols) {
  const token = process.env.MARKETAUX_API_TOKEN;
  if (!token) return [];

  if (cachedNews && cachedNews.expiresAt > Date.now()) return cachedNews.value;

  const url = new URL("https://api.marketaux.com/v1/news/all");
  url.searchParams.set("api_token", token);
  url.searchParams.set("symbols", symbols.join(","));
  url.searchParams.set("language", "en");
  url.searchParams.set("filter_entities", "true");
  url.searchParams.set("limit", "5");

  const response = await fetch(url, { next: { revalidate: 1800 } });
  const payload = await response.json() as MarketauxResponse;
  if (!response.ok || !payload.data) throw new Error(payload.detail || payload.error || "Market news request failed");

  const value = payload.data.filter((item) => item.title && item.url).map((item) => {
    const sentiment = item.entities?.find((entity) => entity.sentiment_score !== undefined)?.sentiment_score ?? null;
    return {
      title: item.title as string,
      url: item.url as string,
      source: item.source || "Market news",
      publishedAt: item.published_at || "",
      sentiment,
      sentimentLabel: sentimentLabel(sentiment),
      symbols: (item.entities || []).map((entity) => entity.symbol).filter((symbol): symbol is string => Boolean(symbol)),
    };
  });

  cachedNews = { expiresAt: Date.now() + CACHE_TTL_MS, value };
  return value;
}

// จัดทำโดย: นายฐิติ เทอดพิทักษ์พงษ์ โดยใช้เทคโนโลยี AI จาก OpenAI · © 2026 Thiti Theadphitukphong · All Rights Reserved.
