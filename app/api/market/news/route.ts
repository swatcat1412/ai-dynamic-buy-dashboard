import { NextResponse } from "next/server";
import { getMarketNews } from "../../../lib/news-data";

export async function GET() {
  try {
    const news = await getMarketNews();
    return NextResponse.json({ ok: true, available: Boolean(process.env.MARKETAUX_API_TOKEN), news });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Market news request failed" }, { status: 502 });
  }
}

// จัดทำโดย: นายฐิติ เทอดพิทักษ์พงษ์ โดยใช้ Claude AI · © 2026 Thiti Theadphitukphong · All Rights Reserved.
