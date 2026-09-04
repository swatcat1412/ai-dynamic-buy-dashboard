import { NextRequest, NextResponse } from "next/server";
import { getMarketNews } from "../../../lib/news-data";
import { livePortfolios, type LivePortfolioId } from "../../../lib/portfolio-config";

function isPortfolioId(value: string): value is LivePortfolioId { return livePortfolios.some((portfolio) => portfolio.id === value); }

export async function GET(request: NextRequest) {
  try {
    const requestedId = request.nextUrl.searchParams.get("portfolioId") || "growth-income";
    const portfolio = isPortfolioId(requestedId) ? livePortfolios.find((item) => item.id === requestedId)! : livePortfolios[0];
    const news = await getMarketNews(portfolio.assets.map((asset) => asset.symbol));
    return NextResponse.json({ ok: true, portfolioId: portfolio.id, available: Boolean(process.env.MARKETAUX_API_TOKEN), news });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Market news request failed" }, { status: 502 });
  }
}

// จัดทำโดย: นายฐิติ เทอดพิทักษ์พงษ์ โดยใช้เทคโนโลยี AI จาก OpenAI · © 2026 Thiti Theadphitukphong · All Rights Reserved.
