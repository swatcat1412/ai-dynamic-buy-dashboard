import type { PortfolioSymbol } from "./portfolio-config";
import { getPersistentCache, setPersistentCache } from "./persistent-cache";
import { runWithTwelveDataRateLimit } from "./api-rate-limiter";
export { portfolioSymbols } from "./portfolio-config";
export type { PortfolioSymbol } from "./portfolio-config";

export interface QuoteSnapshot {
  symbol: PortfolioSymbol;
  price: number;
  change: number | null;
  changePercent: number | null;
  currency: string;
  asOf: string;
}

export interface OhlcvBar {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketDataProvider {
  getQuotes(symbols: readonly PortfolioSymbol[]): Promise<QuoteSnapshot[]>;
  getHistory(symbol: PortfolioSymbol, outputSize?: number): Promise<OhlcvBar[]>;
}

export interface ProviderConfig {
  provider: "twelve-data" | "static";
  hasApiKey: boolean;
}

export function getProviderConfig(): ProviderConfig {
  return {
    provider: process.env.TWELVE_DATA_API_KEY ? "twelve-data" : "static",
    hasApiKey: Boolean(process.env.TWELVE_DATA_API_KEY),
  };
}

type TwelveDataTimeSeries = {
  values?: Array<{
    datetime: string;
    open: string;
    high: string;
    low: string;
    close: string;
    volume?: string;
  }>;
  status?: string;
  message?: string;
};

const TWELVE_DATA_URL = "https://api.twelvedata.com";

export class MarketDataError extends Error {
  constructor(
    message: string,
    public readonly status = 502,
  ) {
    super(message);
    this.name = "MarketDataError";
  }
}

type CachedPayload<T> = { expiresAt: number; value: T };
const requestCache = new Map<string, Promise<CachedPayload<unknown>>>();
const DAILY_HISTORY_BARS = 260;
export const DAILY_MARKET_CACHE_TTL_MS = 30 * 60 * 1000;

async function twelveDataRequest<T>(
  path: string,
  params: Record<string, string>,
) {
  const apiKey = process.env.TWELVE_DATA_API_KEY;
  if (!apiKey)
    throw new MarketDataError("TWELVE_DATA_API_KEY is not configured", 503);

  const cacheKey = `${path}?${Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("&")}`;
  const cached = requestCache.get(cacheKey) as
    Promise<CachedPayload<T>> | undefined;
  if (cached) {
    const result = await cached;
    if (result.expiresAt > Date.now()) return result.value;
    requestCache.delete(cacheKey);
  }

  const value = (async () => {
    const persisted = await getPersistentCache<T>(cacheKey);
    if (persisted) return persisted;

    const payload = await runWithTwelveDataRateLimit(async () => {
      const url = new URL(`${TWELVE_DATA_URL}${path}`);
      Object.entries(params).forEach(([key, value]) =>
        url.searchParams.set(key, value),
      );
      const response = await fetch(url, {
        headers: { Authorization: `apikey ${apiKey}` },
        next: { revalidate: DAILY_MARKET_CACHE_TTL_MS / 1000 },
      });
      const data = (await response.json()) as T & {
        status?: string;
        message?: string;
      };
      if (!response.ok || data.status === "error")
        throw new MarketDataError(
          data.message || `Twelve Data request failed (${response.status})`,
          response.status,
        );
      return data;
    });

    const expiresAt = Date.now() + DAILY_MARKET_CACHE_TTL_MS;
    await setPersistentCache(cacheKey, payload, expiresAt);
    return { value: payload, expiresAt };
  })();

  requestCache.set(cacheKey, value);
  try {
    return (await value).value;
  } catch (error) {
    requestCache.delete(cacheKey);
    throw error;
  }
}

export class TwelveDataProvider implements MarketDataProvider {
  async getQuotes(
    symbols: readonly PortfolioSymbol[],
  ): Promise<QuoteSnapshot[]> {
    const snapshots = await Promise.all(
      symbols.map(async (symbol) => {
        const bars = await this.getHistory(symbol, 260);
        const latest = bars.at(-1);
        const previous = bars.at(-2);
        if (!latest) return null;
        return {
          symbol,
          price: latest.close,
          change: previous ? latest.close - previous.close : null,
          changePercent: previous?.close
            ? ((latest.close - previous.close) / previous.close) * 100
            : null,
          currency: "USD",
          asOf: latest.time,
        };
      }),
    );
    return snapshots.filter((quote): quote is QuoteSnapshot => quote !== null);
  }

  async getHistory(
    symbol: PortfolioSymbol,
    outputSize = 120,
  ): Promise<OhlcvBar[]> {
    const series = await twelveDataRequest<TwelveDataTimeSeries>(
      "/time_series",
      {
        symbol,
        interval: "1day",
        outputsize: String(DAILY_HISTORY_BARS),
        order: "ASC",
      },
    );
    const bars = (series.values || []).map((bar) => ({
      time: bar.datetime,
      open: Number(bar.open),
      high: Number(bar.high),
      low: Number(bar.low),
      close: Number(bar.close),
      volume: Number(bar.volume || 0),
    }));
    const requestedBars = Math.max(
      1,
      Math.min(Math.trunc(outputSize), DAILY_HISTORY_BARS),
    );
    return bars.slice(-requestedBars);
  }
}

export function createMarketDataProvider(): MarketDataProvider {
  const config = getProviderConfig();
  if (config.provider === "twelve-data") return new TwelveDataProvider();
  throw new MarketDataError("No live market data provider is configured", 503);
}

// จัดทำโดย: นายฐิติ เทอดพิทักษ์พงษ์ โดยใช้เทคโนโลยี AI จาก OpenAI · © 2026 Thiti Theadphitukphong · All Rights Reserved.
