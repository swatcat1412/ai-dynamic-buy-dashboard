import { getCorrectionContext, type MarketOpportunity } from "./v2-strategy";
import type { MacroHistoryPoint } from "./macro-data";

export type DrawdownWindow = {
  sessions: 20 | 60 | 120;
  high: number;
  drawdownPercent: number;
};

export type MarketOpportunitySnapshot = {
  benchmark: "NASDAQCOM";
  label: "Nasdaq Composite";
  asOf: string;
  currentValue: number;
  barsUsed: number;
  partialHistory: boolean;
  primaryWindow: 120;
  opportunity: MarketOpportunity;
  multiplier: number;
  drawdowns: DrawdownWindow[];
};

function round(value: number, digits = 2) {
  return Number(value.toFixed(digits));
}

function normalizeHistory(history: readonly MacroHistoryPoint[]) {
  const unique = new Map<string, MacroHistoryPoint>();

  for (const point of history) {
    if (
      typeof point.date === "string" &&
      Number.isFinite(point.value) &&
      point.value > 0
    ) {
      unique.set(point.date, point);
    }
  }

  return [...unique.values()].sort((a, b) => b.date.localeCompare(a.date));
}

export function calculateMarketOpportunity(
  history: readonly MacroHistoryPoint[],
): MarketOpportunitySnapshot {
  const normalized = normalizeHistory(history);
  if (normalized.length < 20) {
    throw new RangeError("At least 20 valid Nasdaq observations are required");
  }

  const current = normalized[0];
  const windows = [20, 60, 120] as const;
  const drawdowns = windows.map((sessions) => {
    const values = normalized.slice(0, sessions).map((point) => point.value);
    const high = Math.max(...values);
    const drawdownPercent = ((current.value - high) / high) * 100;

    return {
      sessions,
      high: round(high),
      drawdownPercent: round(Math.min(drawdownPercent, 0)),
    };
  });
  const primaryDrawdown = drawdowns.find(
    (window) => window.sessions === 120,
  )!.drawdownPercent;
  const context = getCorrectionContext(primaryDrawdown);

  return {
    benchmark: "NASDAQCOM",
    label: "Nasdaq Composite",
    asOf: current.date,
    currentValue: round(current.value),
    barsUsed: Math.min(normalized.length, 120),
    partialHistory: normalized.length < 120,
    primaryWindow: 120,
    opportunity: context.opportunity,
    multiplier: context.multiplier,
    drawdowns,
  };
}

// จัดทำโดย: นายฐิติ เทอดพิทักษ์พงษ์ โดยใช้ OpenAI Codex | © 2026 Thiti Theadphitukphong · All Rights Reserved.
