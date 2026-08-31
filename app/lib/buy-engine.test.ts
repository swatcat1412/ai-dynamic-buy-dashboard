import assert from "node:assert/strict";
import test from "node:test";
import { calculateBuyEngine } from "./buy-engine.ts";
import type { IndicatorSnapshot } from "./indicators.ts";
import type { MacroSnapshot } from "./macro-data.ts";

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

test("keeps every dynamic accumulation zone strictly ordered", () => {
  const result = calculateBuyEngine("PG", 155, indicators, []);
  const [zoneB, zoneC, zoneD] = result.zones;

  assert.ok(zoneB.min! < zoneB.max!);
  assert.ok(zoneC.min! < zoneC.max!);
  assert.ok(zoneD.min! < zoneD.max!);
  assert.ok(zoneB.max! > zoneB.min!);
  assert.ok(zoneB.min! >= zoneC.max!);
  assert.ok(zoneC.min! >= zoneD.max!);
});

test("excludes unavailable rules from score maximum and confidence", () => {
  const vix: MacroSnapshot = {
    key: "vix",
    label: "VIX",
    seriesId: "VIXCLS",
    unit: "index",
    kind: "risk",
    value: 18,
    previousValue: 19,
    change: -1,
    changePercent: -5.26,
    date: "2026-08-21",
    status: "ok",
  };
  const result = calculateBuyEngine("PG", 144.68, indicators, [vix]);

  assert.equal(result.maximum, 80);
  assert.equal(result.confidence, 80);
  assert.equal(result.normalizedScore, Math.round((result.score / result.maximum) * 100));
});

// จัดทำโดย: นายฐิติ เทอดพิทักษ์พงษ์ โดยใช้เทคโนโลยี AI จาก OpenAI · © 2026 Thiti Theadphitukphong · All Rights Reserved.
