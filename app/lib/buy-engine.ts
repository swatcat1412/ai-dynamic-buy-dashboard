import type { IndicatorSnapshot } from "./indicators";
import type { MacroSnapshot } from "./macro-data";
import type { PortfolioSymbol } from "./market-data";

export type BuyZone = "A" | "B" | "C" | "D" | "E" | "unmapped";
export type BuyAction = "WAIT" | "WATCH" | "BUY";

type ZoneDefinition = { zone: BuyZone; min: number | null; max: number | null; allocation: string; action: BuyAction };
type RuleResult = { key: string; rule: string; signal: string; points: number; maximum: number; tone: "positive" | "neutral" | "caution"; reason: string };

const zoneDefinitions: Record<PortfolioSymbol, ZoneDefinition[]> = {
  RKLB: [
    { zone: "A", min: 75, max: null, allocation: "—", action: "WAIT" },
    { zone: "B", min: 68, max: 72, allocation: "20%", action: "BUY" },
    { zone: "C", min: 62, max: 67, allocation: "35%", action: "BUY" },
    { zone: "D", min: 56, max: 61, allocation: "30%", action: "BUY" },
    { zone: "E", min: null, max: 56, allocation: "Remaining", action: "BUY" },
  ],
  GOOGL: [
    { zone: "A", min: 205, max: null, allocation: "—", action: "WAIT" },
    { zone: "B", min: 195, max: 205, allocation: "20%", action: "BUY" },
    { zone: "C", min: 185, max: 195, allocation: "35%", action: "BUY" },
    { zone: "D", min: 175, max: 185, allocation: "30%", action: "BUY" },
    { zone: "E", min: null, max: 175, allocation: "Remaining", action: "BUY" },
  ],
  LLY: [
    { zone: "A", min: 900, max: null, allocation: "—", action: "WAIT" },
    { zone: "B", min: 850, max: 900, allocation: "20%", action: "BUY" },
    { zone: "C", min: 800, max: 850, allocation: "35%", action: "BUY" },
    { zone: "D", min: 740, max: 800, allocation: "30%", action: "BUY" },
    { zone: "E", min: null, max: 740, allocation: "Remaining", action: "BUY" },
  ],
  JEPQ: [
    { zone: "A", min: 58, max: null, allocation: "—", action: "WAIT" },
    { zone: "B", min: 57, max: 58, allocation: "20%", action: "BUY" },
    { zone: "C", min: 55, max: 56, allocation: "35%", action: "BUY" },
    { zone: "D", min: 53, max: 54, allocation: "30%", action: "BUY" },
    { zone: "E", min: null, max: 52, allocation: "Remaining", action: "BUY" },
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

export function getZoneDefinitions(symbol: PortfolioSymbol) {
  return zoneDefinitions[symbol].map((zone) => ({ ...zone, range: formatRange(zone) }));
}

export function calculateBuyEngine(symbol: PortfolioSymbol, price: number, indicators: IndicatorSnapshot, macro: MacroSnapshot[]) {
  const vix = macro.find((item) => item.key === "vix");
  const currentZone = zoneDefinitions[symbol].find((zone) => inZone(price, zone))?.zone ?? "unmapped";
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
  const action: BuyAction = !dataAvailable || currentZone === "A" ? "WAIT" : score >= 60 ? "BUY" : score >= 30 ? "WATCH" : "WAIT";
  const reasons = rules.filter((rule) => rule.points > 0).map((rule) => rule.reason);
  if (currentZone === "A") reasons.unshift("Current price is above the defined buy range");
  if (!reasons.length) reasons.push("No buy rule is currently triggered");
  return { symbol, price, currentZone, score, maximum: 100, confidence: Math.round(score), action, dataAvailable, rules, zones: getZoneDefinitions(symbol), reasons };
}