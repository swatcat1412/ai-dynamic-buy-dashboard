import { NextRequest, NextResponse } from "next/server";
import { calculateBuyEngine } from "../../../lib/buy-engine";
import { calculateIndicators } from "../../../lib/indicators";
import { getMacroSeriesHistory, getMacroSnapshots } from "../../../lib/macro-data";
import { createMarketDataProvider, MarketDataError, allPortfolioSymbols, type PortfolioSymbol } from "../../../lib/market-data";
import { calculateMarketOpportunity } from "../../../lib/market-opportunity";
import { calculateStockOpportunity } from "../../../lib/stock-opportunity";

function isPortfolioSymbol(value: string): value is PortfolioSymbol {
  return (allPortfolioSymbols as readonly string[]).includes(value);
}

export async function GET(request: NextRequest) {
  const symbol = request.nextUrl.searchParams.get("symbol") || "";
  if (!isPortfolioSymbol(symbol)) return NextResponse.json({ ok: false, error: "Unsupported portfolio symbol" }, { status: 400 });

  try {
    const provider = createMarketDataProvider();
    const [bars, macro, marketHistory] = await Promise.all([
      provider.getHistory(symbol, 260),
      getMacroSnapshots(),
      getMacroSeriesHistory("nasdaq", 120).catch(() => null),
    ]);
    const latest = bars.at(-1);
    if (!latest || bars.length < 30) return NextResponse.json({ ok: false, error: "Not enough market data for buy engine" }, { status: 422 });

    const market = marketHistory ? calculateMarketOpportunity(marketHistory) : null;
    const engine = calculateBuyEngine(symbol, latest.close, calculateIndicators(symbol, bars), macro);
    const stockOpportunity = calculateStockOpportunity({
      stockScore: engine.score,
      marketMultiplier: market?.multiplier ?? null,
    });

    return NextResponse.json({
      ok: true,
      engine: { ...engine, stockOpportunity, marketOpportunity: market },
    });
  } catch (error) {
    const status = error instanceof MarketDataError ? error.status : 502;
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Buy engine request failed" }, { status });
  }
}

// จัดทำโดย: นายฐิติ เทอดพิทักษ์พงษ์ โดยใช้เทคโนโลยี AI จาก OpenAI · © 2026 Thiti Theadphitukphong · All Rights Reserved.
