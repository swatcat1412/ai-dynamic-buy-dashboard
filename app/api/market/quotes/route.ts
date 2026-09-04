import { NextRequest, NextResponse } from "next/server";
import { createMarketDataProvider, MarketDataError, portfolioSymbols } from "../../../lib/market-data";
import { livePortfolios, type LivePortfolioId } from "../../../lib/portfolio-config";

function isPortfolioId(value: string): value is LivePortfolioId {
  return livePortfolios.some((portfolio) => portfolio.id === value);
}

export async function GET(request: NextRequest) {
  try {
    const requestedId = request.nextUrl.searchParams.get("portfolioId") || "growth-income";
    const portfolio = isPortfolioId(requestedId) ? livePortfolios.find((item) => item.id === requestedId)! : livePortfolios[0];
    const provider = createMarketDataProvider();
    const symbols = portfolio.assets.map((asset) => asset.symbol);
    const quotes = await provider.getQuotes(symbols as typeof portfolioSymbols);
    return NextResponse.json({ ok: true, portfolioId: portfolio.id, quotes });
  } catch (error) {
    const status = error instanceof MarketDataError ? error.status : 502;
    const message = error instanceof Error ? error.message : "Market data request failed";
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}

