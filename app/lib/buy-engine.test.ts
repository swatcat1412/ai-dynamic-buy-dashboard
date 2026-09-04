import assert from "node:assert/strict";
import test from "node:test";
import { calculateBuyEngine } from "./buy-engine.ts";
import type { IndicatorSnapshot } from "./indicators.ts";

const indicators: IndicatorSnapshot = {
  symbol: "PG",
  asOf: "2026-08-21",
  barsUsed: 260,
  rsi14: 50,
  macd: 0,
  macdSignal: 0,
  macdHistogram: 0,
  macdTrend: "neutral",
  ema20: 150,
  ema50: 145,
  ema200: 140,
  emaTrend: "bullish-stack",
  volume: 1_000,
  averageVolume20: 1_000,
  volumeRatio: 1,
  atr14: 4,
  atrPercent: 2.5,
  adx14: 20,
  obv: 1_000,
  obvChangePercent: 0,
  support20: 140.2,
  resistance20: 153.68,
  support60: 138.86,
  resistance60: 154.32,
};

test("normalizes sub-cent prices before building and matching dynamic zones", () => {
  const result = calculateBuyEngine("PG", 144.67999, indicators, []);
  const boundedZones = result.zones.filter(
    (zone) => zone.min !== null && zone.max !== null,
  );

  assert.equal(result.currentZone, "B");
  assert.equal(result.zones[1].range, "142.68–144.68");
  assert.ok(result.zones[1].min! < result.zones[1].max!);
  assert.ok(boundedZones.every((zone) => zone.min! <= zone.max!));
});

// จัดทำโดย: นายฐิติ เทอดพิทักษ์พงษ์ โดยใช้เทคโนโลยี AI จาก OpenAI · © 2026 Thiti Theadphitukphong · All Rights Reserved.
