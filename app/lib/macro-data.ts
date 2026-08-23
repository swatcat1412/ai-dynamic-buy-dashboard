export const macroSeries = {
  fed: { label: "Fed funds", seriesId: "FEDFUNDS", unit: "%", kind: "rate" },
  inflation: { label: "Inflation", seriesId: "CPIAUCSL", unit: "index", kind: "index" },
  treasury10y: { label: "10Y Treasury", seriesId: "DGS10", unit: "%", kind: "rate" },
  dxy: { label: "DXY proxy", seriesId: "DTWEXBGS", unit: "index", kind: "index" },
  vix: { label: "VIX", seriesId: "VIXCLS", unit: "index", kind: "risk" },
  nasdaq: { label: "Nasdaq Composite", seriesId: "NASDAQCOM", unit: "index", kind: "market" },
  sp500: { label: "S&P 500", seriesId: "SP500", unit: "index", kind: "market" },
  nonfarm: { label: "Nonfarm Payrolls", seriesId: "PAYEMS", unit: "thousand", kind: "labor" },
  unemployment: { label: "Unemployment", seriesId: "UNRATE", unit: "%", kind: "labor" },
} as const;

export type MacroKey = keyof typeof macroSeries;
export type MacroSnapshot = { key: MacroKey; label: string; seriesId: string; unit: string; kind: string; value: number | null; previousValue: number | null; change: number | null; changePercent: number | null; date: string | null; status: "ok" | "unavailable"; error?: string };

type FredObservation = { date: string; value: string };
type FredResponse = { observations?: FredObservation[]; error_code?: string; error_message?: string };

export class MacroDataError extends Error {
  constructor(message: string, public readonly status = 502) { super(message); this.name = "MacroDataError"; }
}

async function fetchSeries(seriesId: string) {
  const apiKey = process.env.FRED_API_KEY;
  if (!apiKey) throw new MacroDataError("FRED_API_KEY is not configured", 503);
  const url = new URL("https://api.stlouisfed.org/fred/series/observations");
  url.searchParams.set("series_id", seriesId);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("file_type", "json");
  url.searchParams.set("limit", "2");
  url.searchParams.set("sort_order", "desc");
  const response = await fetch(url, { next: { revalidate: 900 } });
  const payload = await response.json() as FredResponse;
  if (!response.ok || payload.error_code || !payload.observations) throw new MacroDataError(payload.error_message || `FRED request failed (${response.status})`, response.status);
  const observations = payload.observations.map((observation) => ({ ...observation, numericValue: Number(observation.value) })).filter((observation) => Number.isFinite(observation.numericValue));
  if (!observations.length) throw new MacroDataError(`No current observation for ${seriesId}`, 502);
  return observations;
}

async function buildSnapshot(key: MacroKey): Promise<MacroSnapshot> {
  const definition = macroSeries[key];
  try {
    const observations = await fetchSeries(definition.seriesId);
    const current = observations[0];
    const previous = observations[1];
    const change = previous ? current.numericValue - previous.numericValue : null;
    return { key, ...definition, value: current.numericValue, previousValue: previous?.numericValue ?? null, change, changePercent: previous?.numericValue ? (change! / Math.abs(previous.numericValue)) * 100 : null, date: current.date, status: "ok" };
  } catch (error) {
    return { key, ...definition, value: null, previousValue: null, change: null, changePercent: null, date: null, status: "unavailable", error: error instanceof Error ? error.message : "Macro data request failed" };
  }
}

export async function getMacroSnapshots() {
  const keys = Object.keys(macroSeries) as MacroKey[];
  return Promise.all(keys.map(buildSnapshot));
}

// จัดทำโดย: นายฐิติ เทอดพิทักษ์พงษ์ โดยใช้เทคโนโลยี AI จาก OpenAI · © 2026 Thiti Theadphitukphong · All Rights Reserved.
