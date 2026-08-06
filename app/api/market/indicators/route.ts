import { NextRequest, NextResponse } from "next/server";
import { createMarketDataProvider, MarketDataError, portfolioSymbols, type PortfolioSymbol } from "../../../lib/market-data";
import { calculateIndicators } from "../../../lib/indicators";

function isPortfolioSymbol(value: string): value is PortfolioSymbol {
  return (portfolioSymbols as readonly string[]).includes(value);
}

export async function GET(request: NextRequest) {
  const symbol = request.nextUrl.searchParams.get("symbol") || "";
  if (!isPortfolioSymbol(symbol)) return NextResponse.json({ ok: false, error: "Unsupported portfolio symbol" }, { status: 400 });
  try {
    const bars = await createMarketDataProvider().getHistory(symbol, 260);
    if (bars.length < 30) return NextResponse.json({ ok: false, error: "Not enough historical data to calculate indicators" }, { status: 422 });
    return NextResponse.json({ ok: true, indicators: calculateIndicators(symbol, bars) });
  } catch (error) {
    const status = error instanceof MarketDataError ? error.status : 502;
    const message = error instanceof Error ? error.message : "Indicator request failed";
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}

