import { NextResponse } from "next/server";
import {
  getMacroSeriesHistory,
  MacroDataError,
} from "../../../lib/macro-data";
import { calculateMarketOpportunity } from "../../../lib/market-opportunity";

export async function GET() {
  if (!process.env.FRED_API_KEY) {
    return NextResponse.json(
      { ok: false, error: "FRED_API_KEY is not configured" },
      { status: 503 },
    );
  }

  try {
    const history = await getMacroSeriesHistory("nasdaq", 120);
    const market = calculateMarketOpportunity(history);
    return NextResponse.json({ ok: true, market });
  } catch (error) {
    const status = error instanceof MacroDataError ? error.status : 502;
    const message =
      error instanceof Error
        ? error.message
        : "Market opportunity request failed";
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}

// จัดทำโดย: นายฐิติ เทอดพิทักษ์พงษ์ โดยใช้ OpenAI Codex | © 2026 Thiti Theadphitukphong · All Rights Reserved.
