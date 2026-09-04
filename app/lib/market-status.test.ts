import assert from "node:assert/strict";
import test, { after } from "node:test";
import {
  GET,
  resolveMarketConnectionState,
} from "../api/market/status/route.ts";
import { getDailyHistoryCacheKey } from "./market-data.ts";

const originalFetch = globalThis.fetch;
const originalEnvironment = {
  twelveData: process.env.TWELVE_DATA_API_KEY,
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseSecret: process.env.SUPABASE_SECRET_KEY,
};

after(() => {
  globalThis.fetch = originalFetch;
  const restore = (key: string, value: string | undefined) => {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  };
  restore("TWELVE_DATA_API_KEY", originalEnvironment.twelveData);
  restore("SUPABASE_URL", originalEnvironment.supabaseUrl);
  restore("SUPABASE_SECRET_KEY", originalEnvironment.supabaseSecret);
});

test("reports the latest persistent cache timestamp instead of a fixed snapshot date", async () => {
  const latestUpdatedAt = "2026-08-23T19:18:45.197+07:00";
  process.env.TWELVE_DATA_API_KEY = "test-market-key";
  process.env.SUPABASE_URL = "https://example.supabase.co";
  process.env.SUPABASE_SECRET_KEY = "test-secret-key";
  globalThis.fetch = async () => Response.json([{
    cache_key: getDailyHistoryCacheKey("GOOGL"),
    expires_at: new Date(Date.now() + 60_000).toISOString(),
    updated_at: latestUpdatedAt,
  }]);

  const response = await GET();
  const payload = await response.json();

  assert.equal(payload.ok, true);
  assert.equal(payload.provider, "twelve-data / daily");
  assert.deepEqual(payload.portfolioSymbols, ["GOOGL", "LLY", "JEPQ", "VRT", "RKLB"]);
  assert.equal(payload.marketCacheTtlMinutes, 30);
  assert.equal(payload.providerRequestLimitPerMinute, 8);
  assert.equal(payload.lastUpdated, latestUpdatedAt);
  assert.equal(payload.persistentCache.hasEntries, true);
  assert.equal(payload.persistentCache.freshCoverageCount, 1);
  assert.equal(payload.persistentCache.expectedEntryCount, 5);
  assert.equal(payload.connectionState, "degraded");
  assert.equal(payload.liveDataAvailable, true);
  assert.equal(Number.isNaN(Date.parse(payload.generatedAt)), false);
});

test("distinguishes configured, connected, degraded, and unconfigured states", () => {
  const base = {
    hasApiKey: true,
    cacheConfigured: true,
    cacheReachable: true,
    cacheHasEntries: false,
    freshCoverageCount: 0,
    expectedEntryCount: 8,
    runtimeSuccess: false,
    servingStale: false,
  };

  assert.equal(resolveMarketConnectionState(base), "configured");
  assert.equal(
    resolveMarketConnectionState({ ...base, freshCoverageCount: 8 }),
    "connected",
  );
  assert.equal(
    resolveMarketConnectionState({ ...base, servingStale: true }),
    "degraded",
  );
  assert.equal(
    resolveMarketConnectionState({ ...base, hasApiKey: false }),
    "unconfigured",
  );
});

// จัดทำโดย: นายฐิติ เทอดพิทักษ์พงษ์ โดยใช้เทคโนโลยี AI จาก OpenAI · © 2026 Thiti Theadphitukphong · All Rights Reserved.
