import { NextResponse } from "next/server";
import { TWELVE_DATA_REQUESTS_PER_MINUTE } from "../../../lib/api-rate-limiter";
import { dashboardDataStatus } from "../../../lib/data-source";
import {
  DAILY_MARKET_CACHE_TTL_MS,
  getDailyHistoryCacheKey,
  getProviderConfig,
  portfolioSymbols,
} from "../../../lib/market-data";
import {
  getMarketRuntimeSnapshot,
  type MarketConnectionState,
} from "../../../lib/market-observability";
import { getPersistentCacheHealth } from "../../../lib/persistent-cache";

type StatusInputs = {
  hasApiKey: boolean;
  cacheConfigured: boolean;
  cacheReachable: boolean;
  cacheHasEntries: boolean;
  freshCoverageCount: number;
  expectedEntryCount: number;
  runtimeSuccess: boolean;
  servingStale: boolean;
};

export function resolveMarketConnectionState(
  input: StatusInputs,
): MarketConnectionState {
  if (!input.hasApiKey) return "unconfigured";
  if (input.servingStale) return "degraded";
  if (input.cacheConfigured && !input.cacheReachable) return "degraded";
  if (
    input.expectedEntryCount > 0 &&
    input.freshCoverageCount === input.expectedEntryCount
  )
    return "connected";
  if (input.runtimeSuccess) return "connected";
  if (input.cacheHasEntries) return "degraded";
  return "configured";
}

export async function GET() {
  const provider = getProviderConfig();
  const expectedCacheKeys = portfolioSymbols.map(getDailyHistoryCacheKey);
  const persistentCache = await getPersistentCacheHealth(expectedCacheKeys);
  const runtime = getMarketRuntimeSnapshot();
  const lastSuccessMs = runtime.lastSuccessAt
    ? Date.parse(runtime.lastSuccessAt)
    : Number.NaN;
  const runtimeSuccessIsRecent =
    Number.isFinite(lastSuccessMs) &&
    Date.now() - lastSuccessMs <= DAILY_MARKET_CACHE_TTL_MS;
  const connectionState = resolveMarketConnectionState({
    hasApiKey: provider.hasApiKey,
    cacheConfigured: persistentCache.configured,
    cacheReachable: persistentCache.reachable,
    cacheHasEntries: persistentCache.hasEntries,
    freshCoverageCount: persistentCache.freshCoverageCount,
    expectedEntryCount: persistentCache.expectedEntryCount,
    runtimeSuccess: runtimeSuccessIsRecent,
    servingStale: runtime.servingStale,
  });

  return NextResponse.json({
    ok: true,
    mode: provider.hasApiKey ? "api-ready" : dashboardDataStatus.mode,
    provider: provider.provider === "twelve-data" ? "twelve-data / daily" : provider.provider,
    hasApiKey: provider.hasApiKey,
    connectionState,
    liveDataAvailable:
      connectionState === "connected" || connectionState === "degraded",
    portfolioSymbols,
    marketCacheTtlMinutes: DAILY_MARKET_CACHE_TTL_MS / 60_000,
    providerRequestLimitPerMinute: TWELVE_DATA_REQUESTS_PER_MINUTE,
    persistentCache,
    runtime,
    lastUpdated: persistentCache.latestUpdatedAt ?? dashboardDataStatus.lastUpdated,
    generatedAt: new Date().toISOString(),
  });
}

// จัดทำโดย: นายฐิติ เทอดพิทักษ์พงษ์ โดยใช้เทคโนโลยี AI จาก OpenAI · © 2026 Thiti Theadphitukphong · All Rights Reserved.
