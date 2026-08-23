import { NextResponse } from "next/server";
import { dashboardDataStatus } from "../../../lib/data-source";
import { getProviderConfig } from "../../../lib/market-data";
import { getPersistentCacheHealth } from "../../../lib/persistent-cache";

export async function GET() {
  const provider = getProviderConfig();
  const persistentCache = await getPersistentCacheHealth();

  return NextResponse.json({
    ok: true,
    mode: provider.hasApiKey ? "api-ready" : dashboardDataStatus.mode,
    provider: provider.provider === "twelve-data" ? "twelve-data / daily" : provider.provider,
    hasApiKey: provider.hasApiKey,
    liveDataAvailable: provider.hasApiKey,
    persistentCache,
    lastUpdated: persistentCache.latestUpdatedAt ?? dashboardDataStatus.lastUpdated,
    generatedAt: new Date().toISOString(),
  });
}

// จัดทำโดย: นายฐิติ เทอดพิทักษ์พงษ์ โดยใช้เทคโนโลยี AI จาก OpenAI · © 2026 Thiti Theadphitukphong · All Rights Reserved.
