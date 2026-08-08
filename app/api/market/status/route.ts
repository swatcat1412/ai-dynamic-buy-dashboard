import { NextResponse } from "next/server";
import { dashboardDataStatus } from "../../../lib/data-source";
import { getProviderConfig } from "../../../lib/market-data";

export async function GET() {
  const provider = getProviderConfig();

  return NextResponse.json({
    ok: true,
    mode: provider.hasApiKey ? "api-ready" : dashboardDataStatus.mode,
    provider: provider.provider === "twelve-data" ? "twelve-data · daily" : provider.provider,
    hasApiKey: provider.hasApiKey,
    liveDataAvailable: provider.hasApiKey,
    lastUpdated: dashboardDataStatus.lastUpdated,
  });
}

// จัดทำโดย: นายฐิติ เทอดพิทักษ์พงษ์ โดยใช้ Claude AI · © 2026 Thiti Theadphitukphong · All Rights Reserved.
