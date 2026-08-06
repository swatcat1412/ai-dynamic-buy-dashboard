export const portfolioSymbols = ["RKLB", "GOOGL", "LLY", "JEPQ"] as const;

export type PortfolioSymbol = (typeof portfolioSymbols)[number];

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

type TwelveDataQuote = {
  symbol?: string;
  close?: string;
  price?: string;
  change?: string;
  percent_change?: string;
  currency?: string;
  datetime?: string;
  status?: string;
  message?: string;
};

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
  constructor(message: string, public readonly status = 502) {
    super(message);
    this.name = "MarketDataError";
  }
}

async function twelveDataRequest<T>(path: string, params: Record<string, string>) {
  const apiKey = process.env.TWELVE_DATA_API_KEY;
  if (!apiKey) {
    throw new MarketDataError("TWELVE_DATA_API_KEY is not configured", 503);
  }

  const url = new URL(`${TWELVE_DATA_URL}${path}`);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));

  const response = await fetch(url, {
    headers: { Authorization: `apikey ${apiKey}` },
    next: { revalidate: 900 },
  });

  const payload = (await response.json()) as T & { status?: string; message?: string };
  if (!response.ok || payload.status === "error") {
    throw new MarketDataError(payload.message || `Twelve Data request failed (${response.status})`, response.status);
  }

  return payload;
}

export class TwelveDataProvider implements MarketDataProvider {
  async getQuotes(symbols: readonly PortfolioSymbol[]): Promise<QuoteSnapshot[]> {
    return Promise.all(symbols.map(async (symbol) => {
      const quote = await twelveDataRequest<TwelveDataQuote>("/quote", { symbol });
      const price = Number(quote.close ?? quote.price);
      if (!Number.isFinite(price)) {
        throw new MarketDataError(`No valid price returned for ${symbol}`);
      }

      return {
        symbol,
        price,
        change: quote.change ? Number(quote.change) : null,
        changePercent: quote.percent_change ? Number(quote.percent_change) : null,
        currency: quote.currency || "USD",
        asOf: quote.datetime || new Date().toISOString(),
      };
    }));
  }

  async getHistory(symbol: PortfolioSymbol, outputSize = 120): Promise<OhlcvBar[]> {
    const series = await twelveDataRequest<TwelveDataTimeSeries>("/time_series", {
      symbol,
      interval: "1day",
      outputsize: String(outputSize),
      order: "ASC",
    });

    return (series.values || []).map((bar) => ({
      time: bar.datetime,
      open: Number(bar.open),
      high: Number(bar.high),
      low: Number(bar.low),
      close: Number(bar.close),
      volume: Number(bar.volume || 0),
    }));
  }
}

export function createMarketDataProvider(): MarketDataProvider {
  const config = getProviderConfig();
  if (config.provider === "twelve-data") {
    return new TwelveDataProvider();
  }

  throw new MarketDataError("No live market data provider is configured", 503);
}

