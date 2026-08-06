import { NextResponse } from "next/server";
import { getMacroSnapshots } from "../../../lib/macro-data";

export async function GET() {
  if (!process.env.FRED_API_KEY) return NextResponse.json({ ok: false, error: "FRED_API_KEY is not configured" }, { status: 503 });
  try {
    const macro = await getMacroSnapshots();
    const available = macro.filter((item) => item.status === "ok").length;
    return NextResponse.json({ ok: available > 0, macro, available, total: macro.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Macro data request failed";
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }
}

