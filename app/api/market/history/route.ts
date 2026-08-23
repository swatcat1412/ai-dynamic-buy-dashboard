import { NextRequest, NextResponse } from "next/server";
import { createMarketDataProvider, MarketDataError, portfolioSymbols, type PortfolioSymbol } from "../../../lib/market-data";

function isPortfolioSymbol(value: string): value is PortfolioSymbol {
  return (portfolioSymbols as readonly string[]).includes(value);
}

export async function GET(request: NextRequest) {
  const symbol = request.nextUrl.searchParams.get("symbol") || "";
  if (!isPortfolioSymbol(symbol)) {
    return NextResponse.json({ ok: false, error: "Unsupported portfolio symbol" }, { status: 400 });
  }

  try {
    const requestedRange = Number(request.nextUrl.searchParams.get("range"));
    const outputSize = [5, 30, 60, 120].includes(requestedRange) ? requestedRange : 120;
    const provider = createMarketDataProvider();
    const history = await provider.getHistory(symbol, outputSize);
    return NextResponse.json({ ok: true, symbol, history });
  } catch (error) {
    const status = error instanceof MarketDataError ? error.status : 502;
    const message = error instanceof Error ? error.message : "Historical market data request failed";
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}

// จัดทำโดย: นายฐิติ เทอดพิทักษ์พงษ์ โดยใช้เทคโนโลยี AI จาก OpenAI · © 2026 Thiti Theadphitukphong · All Rights Reserved.
