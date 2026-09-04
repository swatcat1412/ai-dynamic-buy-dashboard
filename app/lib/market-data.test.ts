import assert from "node:assert/strict";
import test, { after } from "node:test";
import {
  DAILY_MARKET_CACHE_TTL_MS,
  MAX_STALE_MARKET_CACHE_AGE_MS,
  TwelveDataProvider,
} from "./market-data.ts";
import {
  getMarketRuntimeSnapshot,
  resetMarketObservabilityForTests,
} from "./market-observability.ts";
import { defaultPortfolioSymbol } from "./portfolio-config.ts";

const originalFetch = globalThis.fetch;
const originalApiKey = process.env.TWELVE_DATA_API_KEY;
const originalSupabaseUrl = process.env.SUPABASE_URL;
const originalSupabaseSecret = process.env.SUPABASE_SECRET_KEY;

after(() => {
  globalThis.fetch = originalFetch;
  if (originalApiKey === undefined) delete process.env.TWELVE_DATA_API_KEY;
  else process.env.TWELVE_DATA_API_KEY = originalApiKey;
  if (originalSupabaseUrl === undefined) delete process.env.SUPABASE_URL;
  else process.env.SUPABASE_URL = originalSupabaseUrl;
  if (originalSupabaseSecret === undefined) delete process.env.SUPABASE_SECRET_KEY;
  else process.env.SUPABASE_SECRET_KEY = originalSupabaseSecret;
  resetMarketObservabilityForTests();
});

test("shares one normalized 260-bar upstream request across history ranges", async () => {
  process.env.TWELVE_DATA_API_KEY = "test-api-key";
  let upstreamRequests = 0;
  const values = Array.from({ length: 260 }, (_, index) => ({
    datetime: `2026-01-${String(index + 1).padStart(3, "0")}`,
    open: String(index + 1),
    high: String(index + 2),
    low: String(index),
    close: String(index + 1.5),
    volume: String(1_000 + index),
  }));

  globalThis.fetch = async (input, init) => {
    upstreamRequests += 1;
    const url = new URL(input.toString());
    assert.equal(url.searchParams.get("outputsize"), "260");
    assert.equal(
      (init as { next?: { revalidate?: number } } | undefined)?.next?.revalidate,
      DAILY_MARKET_CACHE_TTL_MS / 1000,
    );
    return Response.json(
      { values },
      { headers: { "api-credits-used": "3", "api-credits-left": "5" } },
    );
  };

  const provider = new TwelveDataProvider();
  const [fiveBars, oneHundredTwentyBars] = await Promise.all([
    provider.getHistory(defaultPortfolioSymbol, 5),
    provider.getHistory(defaultPortfolioSymbol, 120),
  ]);

  assert.equal(upstreamRequests, 1);
  assert.equal(fiveBars.length, 5);
  assert.equal(oneHundredTwentyBars.length, 120);
  assert.equal(fiveBars.at(-1)?.close, oneHundredTwentyBars.at(-1)?.close);
  assert.equal(getMarketRuntimeSnapshot().quota?.left, 5);
});

test("serves expired Supabase cache when Twelve Data is temporarily unavailable", async () => {
  process.env.TWELVE_DATA_API_KEY = "test-api-key";
  process.env.SUPABASE_URL = "https://project.supabase.co";
  process.env.SUPABASE_SECRET_KEY = "test-secret-key";
  const values = Array.from({ length: 5 }, (_, index) => ({
    datetime: `2026-09-0${index + 1}`,
    open: String(index + 1),
    high: String(index + 2),
    low: String(index),
    close: String(index + 1.5),
    volume: String(1_000 + index),
  }));
  let upstreamAttempts = 0;

  globalThis.fetch = async (input) => {
    const url = new URL(input.toString());
    if (url.hostname === "project.supabase.co") {
      return Response.json([{
        cache_key: "stale",
        payload: { values },
        expires_at: new Date(Date.now() - 60_000).toISOString(),
        updated_at: "2026-09-04T00:00:00.000Z",
      }]);
    }
    upstreamAttempts += 1;
    throw new DOMException("Timed out", "TimeoutError");
  };

  const bars = await new TwelveDataProvider().getHistory("RKLB", 5);
  assert.equal(bars.length, 5);
  assert.equal(upstreamAttempts, 2);
  assert.equal(getMarketRuntimeSnapshot().servingStale, true);
  assert.equal(getMarketRuntimeSnapshot().lastErrorCode, "upstream-timeout");
});

test("caps stale market data fallback at seven days", () => {
  assert.equal(MAX_STALE_MARKET_CACHE_AGE_MS, 7 * 24 * 60 * 60 * 1000);
});

test("rejects stale market data older than the safety window", async () => {
  process.env.TWELVE_DATA_API_KEY = "test-api-key";
  process.env.SUPABASE_URL = "https://project.supabase.co";
  process.env.SUPABASE_SECRET_KEY = "test-secret-key";

  globalThis.fetch = async (input) => {
    const url = new URL(input.toString());
    if (url.hostname === "project.supabase.co") {
      return Response.json([{
        cache_key: "too-old",
        payload: { values: [] },
        expires_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      }]);
    }
    return Response.json(
      { status: "error", message: "Provider unavailable" },
      { status: 503 },
    );
  };

  await assert.rejects(
    () => new TwelveDataProvider().getHistory("TSM", 5),
    /Provider unavailable/,
  );
});

// จัดทำโดย: นายฐิติ เทอดพิทักษ์พงษ์ โดยใช้เทคโนโลยี AI จาก OpenAI · © 2026 Thiti Theadphitukphong · All Rights Reserved.
