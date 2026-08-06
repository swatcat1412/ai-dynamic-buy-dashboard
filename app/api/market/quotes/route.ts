import { NextResponse } from "next/server";
import { createMarketDataProvider, MarketDataError, portfolioSymbols } from "../../../lib/market-data";

export async function GET() {
  try {
    const provider = createMarketDataProvider();
    const quotes = await provider.getQuotes(portfolioSymbols);
    return NextResponse.json({ ok: true, quotes });
  } catch (error) {
    const status = error instanceof MarketDataError ? error.status : 502;
    const message = error instanceof Error ? error.message : "Market data request failed";
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}

