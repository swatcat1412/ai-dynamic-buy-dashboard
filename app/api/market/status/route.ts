import { NextResponse } from "next/server";
import { dashboardDataStatus } from "../../../lib/data-source";
import { getProviderConfig } from "../../../lib/market-data";

export async function GET() {
  const provider = getProviderConfig();

  return NextResponse.json({
    ok: true,
    mode: provider.hasApiKey ? "api-ready" : dashboardDataStatus.mode,
    provider: provider.provider,
    hasApiKey: provider.hasApiKey,
    liveDataAvailable: provider.hasApiKey,
    lastUpdated: dashboardDataStatus.lastUpdated,
  });
}

