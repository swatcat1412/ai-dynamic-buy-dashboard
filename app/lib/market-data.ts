import type { PortfolioSymbol } from "./portfolio-config";
import { getPersistentCacheEntry, setPersistentCache } from "./persistent-cache";
import { runWithTwelveDataRateLimit } from "./api-rate-limiter";
import {
  recordMarketAttempt,
  recordMarketFailure,
  recordMarketQuota,
  recordMarketSuccess,
} from "./market-observability";
export { portfolioSymbols, allPortfolioSymbols } from "./portfolio-config";
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
export const TWELVE_DATA_TIMEOUT_MS = 10_000;
const TWELVE_DATA_MAX_ATTEMPTS = 2;
const TWELVE_DATA_RETRY_DELAY_MS = 250;
const STALE_CACHE_RECHECK_MS = 60_000;
export const MAX_STALE_MARKET_CACHE_AGE_MS = 7 * 24 * 60 * 60 * 1000;

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

function buildCacheKey(path: string, params: Record<string, string>) {
  return `${path}?${Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("&")}`;
}

function dailyHistoryParams(symbol: PortfolioSymbol) {
  return {
    symbol,
    interval: "1day",
    outputsize: String(DAILY_HISTORY_BARS),
    order: "ASC",
  };
}

export function getDailyHistoryCacheKey(symbol: PortfolioSymbol) {
  return buildCacheKey("/time_series", dailyHistoryParams(symbol));
}

const delay = (milliseconds: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

async function fetchTwelveData(url: URL, apiKey: string) {
  let lastError: unknown;
  for (let attempt = 1; attempt <= TWELVE_DATA_MAX_ATTEMPTS; attempt += 1) {
    recordMarketAttempt();
    try {
      const response = await fetch(url, {
        headers: { Authorization: `apikey ${apiKey}` },
        next: { revalidate: DAILY_MARKET_CACHE_TTL_MS / 1000 },
        signal: AbortSignal.timeout(TWELVE_DATA_TIMEOUT_MS),
      });
      recordMarketQuota(response.headers);
      if (response.status < 500 || attempt === TWELVE_DATA_MAX_ATTEMPTS)
        return response;
    } catch (error) {
      lastError = error;
      if (attempt === TWELVE_DATA_MAX_ATTEMPTS) throw error;
    }
    await delay(TWELVE_DATA_RETRY_DELAY_MS);
  }
  throw lastError ?? new Error("Twelve Data request failed");
}

function marketFailureCode(error: unknown) {
  if (error instanceof MarketDataError) return `upstream-${error.status}`;
  if (
    error instanceof Error &&
    (error.name === "AbortError" || error.name === "TimeoutError")
  )
    return "upstream-timeout";
  return "upstream-network";
}

function isUsableStaleEntry(entry: {
  updatedAt: string | null;
  expiresAt: number;
}) {
  const updatedAt = entry.updatedAt ? Date.parse(entry.updatedAt) : Number.NaN;
  const referenceTime = Number.isFinite(updatedAt)
    ? updatedAt
    : entry.expiresAt - DAILY_MARKET_CACHE_TTL_MS;
  return Date.now() - referenceTime <= MAX_STALE_MARKET_CACHE_AGE_MS;
}

async function twelveDataRequest<T>(
  path: string,
  params: Record<string, string>,
) {
  const apiKey = process.env.TWELVE_DATA_API_KEY;
  if (!apiKey)
    throw new MarketDataError("TWELVE_DATA_API_KEY is not configured", 503);

  const cacheKey = buildCacheKey(path, params);
  const cached = requestCache.get(cacheKey) as
    Promise<CachedPayload<T>> | undefined;
  if (cached) {
    const result = await cached;
    if (result.expiresAt > Date.now()) return result.value;
    requestCache.delete(cacheKey);
  }

  const value = (async () => {
    const persisted = await getPersistentCacheEntry<T>(cacheKey);
    if (persisted && !persisted.isExpired)
      return { value: persisted.value, expiresAt: persisted.expiresAt };

    try {
      const payload = await runWithTwelveDataRateLimit(async () => {
        const url = new URL(`${TWELVE_DATA_URL}${path}`);
        Object.entries(params).forEach(([key, value]) =>
          url.searchParams.set(key, value),
        );
        // A retry stays inside one admitted logical request. Quota headers are
        // recorded so an unexpected provider charge remains observable.
        const response = await fetchTwelveData(url, apiKey);
        const data = (await response.json().catch(() => null)) as
          | (T & { status?: string; message?: string })
          | null;
        if (!response.ok || !data || data.status === "error")
          throw new MarketDataError(
            data?.message || `Twelve Data request failed (${response.status})`,
            response.status,
          );
        if (
          path === "/time_series" &&
          !Array.isArray((data as TwelveDataTimeSeries).values)
        )
          throw new MarketDataError(
            "Twelve Data returned no time-series values",
            502,
          );
        recordMarketSuccess(response.headers);
        return data;
      });

      const expiresAt = Date.now() + DAILY_MARKET_CACHE_TTL_MS;
      await setPersistentCache(cacheKey, payload, expiresAt);
      return { value: payload, expiresAt };
    } catch (error) {
      if (persisted && isUsableStaleEntry(persisted)) {
        recordMarketFailure(marketFailureCode(error), true);
        return {
          value: persisted.value,
          expiresAt: Date.now() + STALE_CACHE_RECHECK_MS,
        };
      }
      recordMarketFailure(marketFailureCode(error), false);
      throw error;
    }
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
      dailyHistoryParams(symbol),
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
