import type { IndicatorSnapshot } from "./indicators";
import type { MacroSnapshot } from "./macro-data";
import type { PortfolioSymbol } from "./market-data";

export type BuyZone = "A" | "B" | "C" | "D" | "E" | "unmapped";
export type BuyAction = "WAIT" | "WATCH" | "ACCUMULATE";

type ZoneDefinition = { zone: BuyZone; min: number | null; max: number | null; allocation: string; action: BuyAction };
type RuleResult = { key: string; rule: string; signal: string; points: number; maximum: number; tone: "positive" | "neutral" | "caution"; reason: string };

const zoneDefinitions: Partial<Record<PortfolioSymbol, ZoneDefinition[]>> = {
  RKLB: [
    { zone: "A", min: 75, max: null, allocation: "—", action: "WAIT" },
    { zone: "B", min: 68, max: 72, allocation: "20%", action: "ACCUMULATE" },
    { zone: "C", min: 62, max: 67, allocation: "35%", action: "ACCUMULATE" },
    { zone: "D", min: 56, max: 61, allocation: "30%", action: "ACCUMULATE" },
    { zone: "E", min: null, max: 56, allocation: "Remaining", action: "ACCUMULATE" },
  ],
  GOOGL: [
    { zone: "A", min: 205, max: null, allocation: "—", action: "WAIT" },
    { zone: "B", min: 195, max: 205, allocation: "20%", action: "ACCUMULATE" },
    { zone: "C", min: 185, max: 195, allocation: "35%", action: "ACCUMULATE" },
    { zone: "D", min: 175, max: 185, allocation: "30%", action: "ACCUMULATE" },
    { zone: "E", min: null, max: 175, allocation: "Remaining", action: "ACCUMULATE" },
  ],
  LLY: [
    { zone: "A", min: 900, max: null, allocation: "—", action: "WAIT" },
    { zone: "B", min: 850, max: 900, allocation: "20%", action: "ACCUMULATE" },
    { zone: "C", min: 800, max: 850, allocation: "35%", action: "ACCUMULATE" },
    { zone: "D", min: 740, max: 800, allocation: "30%", action: "ACCUMULATE" },
    { zone: "E", min: null, max: 740, allocation: "Remaining", action: "ACCUMULATE" },
  ],
  JEPQ: [
    { zone: "A", min: 58, max: null, allocation: "—", action: "WAIT" },
    { zone: "B", min: 57, max: 58, allocation: "20%", action: "ACCUMULATE" },
    { zone: "C", min: 55, max: 56, allocation: "35%", action: "ACCUMULATE" },
    { zone: "D", min: 53, max: 54, allocation: "30%", action: "ACCUMULATE" },
    { zone: "E", min: null, max: 52, allocation: "Remaining", action: "ACCUMULATE" },
  ],
};

function inZone(price: number, zone: ZoneDefinition) {
  if (zone.zone === "A") return price > (zone.min ?? Number.POSITIVE_INFINITY);
  if (zone.zone === "E") return price < (zone.max ?? Number.NEGATIVE_INFINITY);
  return price >= (zone.min ?? Number.NEGATIVE_INFINITY) && price <= (zone.max ?? Number.POSITIVE_INFINITY);
}

function formatRange(zone: ZoneDefinition) {
  if (zone.zone === "A") return `>${zone.min}`;
  if (zone.zone === "E") return `<${zone.max}`;
  return `${zone.min}–${zone.max}`;
}

function getDynamicLevels(price: number, indicators: IndicatorSnapshot) {
  const step = indicators.atr14 ?? price * 0.03;
  const minimumStep = Math.max(step * 0.5, price * 0.01);
  const first = indicators.ema20 !== null && indicators.ema20 < price
    ? indicators.ema20
    : price - minimumStep;
  const second = Math.min(first - Math.max(step * 0.5, price * 0.01), indicators.support20 ?? first - step);
  const third = Math.min(second - Math.max(step * 0.5, price * 0.01), indicators.support60 ?? second - step);
  return {
    first: Number(Math.max(third, first).toFixed(2)),
    second: Number(Math.max(third, second).toFixed(2)),
    third: Number(Math.max(0, third).toFixed(2)),
  };
}

function getDynamicZoneDefinitions(symbol: PortfolioSymbol, price: number, indicators: IndicatorSnapshot) {
  const normalizedPrice = Number(price.toFixed(2));
  const levels = getDynamicLevels(normalizedPrice, indicators);
  return [
    { zone: "A" as const, min: normalizedPrice, max: null, allocation: "—", action: "WAIT" as const, range: `>${normalizedPrice.toFixed(2)}` },
    { zone: "B" as const, min: levels.first, max: normalizedPrice, allocation: "20%", action: "ACCUMULATE" as const, range: `${levels.first.toFixed(2)}–${normalizedPrice.toFixed(2)}` },
    { zone: "C" as const, min: levels.second, max: levels.first, allocation: "35%", action: "ACCUMULATE" as const, range: `${levels.second.toFixed(2)}–${levels.first.toFixed(2)}` },
    { zone: "D" as const, min: levels.third, max: levels.second, allocation: "30%", action: "ACCUMULATE" as const, range: `${levels.third.toFixed(2)}–${levels.second.toFixed(2)}` },
    { zone: "E" as const, min: null, max: levels.third, allocation: "Remaining", action: "ACCUMULATE" as const, range: `<${levels.third.toFixed(2)}` },
  ].map((zone) => ({ ...zone, symbol }));
}

export function getZoneDefinitions(symbol: PortfolioSymbol) {
  return (zoneDefinitions[symbol] ?? []).map((zone) => ({ ...zone, range: formatRange(zone) }));
}
export function calculateBuyEngine(symbol: PortfolioSymbol, price: number, indicators: IndicatorSnapshot, macro: MacroSnapshot[]) {
  const vix = macro.find((item) => item.key === "vix");
  const normalizedPrice = Number(price.toFixed(2));
  const levels = getDynamicLevels(normalizedPrice, indicators);
  const dynamicZones = getDynamicZoneDefinitions(symbol, price, indicators);
  const currentZone = dynamicZones.find((zone) => inZone(normalizedPrice, zone))?.zone ?? "unmapped";
  const rules: RuleResult[] = [
    { key: "rsi", rule: "RSI <35", signal: indicators.rsi14 !== null && indicators.rsi14 < 35 ? "Triggered" : "Not triggered", points: indicators.rsi14 !== null && indicators.rsi14 < 35 ? 20 : 0, maximum: 20, tone: indicators.rsi14 !== null && indicators.rsi14 < 35 ? "positive" : "neutral", reason: indicators.rsi14 !== null && indicators.rsi14 < 35 ? "RSI is in oversold territory" : "RSI is not below 35" },
    { key: "macd", rule: "MACD Golden Cross", signal: indicators.macdTrend === "golden-cross" ? "Triggered" : "Not triggered", points: indicators.macdTrend === "golden-cross" ? 20 : 0, maximum: 20, tone: indicators.macdTrend === "golden-cross" ? "positive" : "neutral", reason: indicators.macdTrend === "golden-cross" ? "MACD crossed above its signal" : "No fresh bullish MACD cross" },
    { key: "volume", rule: "Volume > Avg", signal: indicators.volumeRatio !== null && indicators.volumeRatio > 1 ? "Triggered" : "Not triggered", points: indicators.volumeRatio !== null && indicators.volumeRatio > 1 ? 10 : 0, maximum: 10, tone: indicators.volumeRatio !== null && indicators.volumeRatio > 1 ? "positive" : "neutral", reason: indicators.volumeRatio !== null && indicators.volumeRatio > 1 ? "Volume is above its 20-day average" : "Volume is not above its 20-day average" },
    { key: "fear-greed", rule: "Fear & Greed <25", signal: "Unavailable", points: 0, maximum: 20, tone: "caution", reason: "Fear & Greed provider is not configured; no points awarded" },
    { key: "vix", rule: "VIX >22", signal: vix?.value !== null && vix?.value !== undefined && vix.value > 22 ? "Triggered" : vix?.status === "ok" ? "Not triggered" : "Unavailable", points: vix?.value !== null && vix?.value !== undefined && vix.value > 22 ? 15 : 0, maximum: 15, tone: vix?.value !== null && vix?.value !== undefined && vix.value > 22 ? "positive" : vix?.status === "ok" ? "neutral" : "caution", reason: vix?.value !== null && vix?.value !== undefined ? `VIX is ${vix.value.toFixed(2)}` : "VIX data is unavailable" },
    { key: "support", rule: "Price at Support", signal: indicators.ema20 !== null && price <= indicators.ema20 ? "Triggered" : "Not triggered", points: indicators.ema20 !== null && price <= indicators.ema20 ? 15 : 0, maximum: 15, tone: indicators.ema20 !== null && price <= indicators.ema20 ? "positive" : "neutral", reason: indicators.ema20 !== null && price <= indicators.ema20 ? "Price is at or below EMA20 support reference" : "Price is above EMA20 support reference" },
  ];
  const score = rules.reduce((total, rule) => total + rule.points, 0);
  const dataAvailable = indicators.rsi14 !== null && indicators.ema20 !== null;
  const action: BuyAction = !dataAvailable || currentZone === "A" ? "WAIT" : score >= 60 ? "ACCUMULATE" : score >= 30 ? "WATCH" : "WAIT";
  const round = (value: number | null) => value === null ? null : Number(value.toFixed(2));
  const firstEntry = levels.first;
  const secondEntry = levels.second;
  const thirdEntry = levels.third;
  const entryLevels = [
    { label: "เริ่มสะสม", price: round(firstEntry), allocation: "20%" },
    { label: "แนวรับ 20 วัน", price: round(secondEntry), allocation: "35%" },
    { label: "แนวรับ 60 วัน", price: round(thirdEntry), allocation: "30%" },
  ];
  const preferredEntry = round(secondEntry);
  const reasons = rules.filter((rule) => rule.points > 0).map((rule) => rule.reason);
  if (currentZone === "A") reasons.unshift("Current price is above the defined accumulation range");
  if (indicators.support20 !== null) reasons.push(`20-day support is ${indicators.support20.toFixed(2)}`);
  if (!reasons.length) reasons.push("No accumulation rule is currently triggered");
  return { symbol, price, currentZone, score, maximum: 100, confidence: Math.round(score), action, dataAvailable, preferredEntry, entryLevels, support20: indicators.support20, resistance20: indicators.resistance20, support60: indicators.support60, resistance60: indicators.resistance60, rules, zones: dynamicZones, reasons };
}

// จัดทำโดย: นายฐิติ เทอดพิทักษ์พงษ์ โดยใช้เทคโนโลยี AI จาก OpenAI · © 2026 Thiti Theadphitukphong · All Rights Reserved.
