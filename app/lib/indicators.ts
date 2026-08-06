import type { OhlcvBar } from "./market-data";

export type IndicatorSnapshot = {
  symbol: string;
  asOf: string;
  barsUsed: number;
  rsi14: number | null;
  macd: number | null;
  macdSignal: number | null;
  macdHistogram: number | null;
  macdTrend: "golden-cross" | "bearish-cross" | "neutral";
  ema20: number | null;
  ema50: number | null;
  ema200: number | null;
  emaTrend: "bullish-stack" | "bearish-stack" | "mixed" | "insufficient-data";
  volume: number | null;
  averageVolume20: number | null;
  volumeRatio: number | null;
  atr14: number | null;
  atrPercent: number | null;
  adx14: number | null;
  obv: number | null;
  obvChangePercent: number | null;
};

function average(values: number[]) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
}

function ema(values: number[], period: number) {
  if (values.length < period) return null;
  const multiplier = 2 / (period + 1);
  let result = values.slice(0, period).reduce((sum, value) => sum + value, 0) / period;
  for (const value of values.slice(period)) result = (value - result) * multiplier + result;
  return result;
}

function emaSeries(values: number[], period: number) {
  if (values.length < period) return [];
  const multiplier = 2 / (period + 1);
  const result = [values.slice(0, period).reduce((sum, value) => sum + value, 0) / period];
  for (const value of values.slice(period)) result.push((value - result[result.length - 1]) * multiplier + result[result.length - 1]);
  return result;
}

function calculateRsi(values: number[], period = 14) {
  if (values.length <= period) return null;
  let gains = 0;
  let losses = 0;
  for (let index = 1; index <= period; index += 1) {
    const change = values[index] - values[index - 1];
    if (change >= 0) gains += change; else losses -= change;
  }
  let averageGain = gains / period;
  let averageLoss = losses / period;
  for (let index = period + 1; index < values.length; index += 1) {
    const change = values[index] - values[index - 1];
    averageGain = (averageGain * (period - 1) + Math.max(change, 0)) / period;
    averageLoss = (averageLoss * (period - 1) + Math.max(-change, 0)) / period;
  }
  if (averageLoss === 0) return 100;
  return 100 - 100 / (1 + averageGain / averageLoss);
}

function trueRanges(bars: OhlcvBar[]) {
  return bars.map((bar, index) => index === 0 ? bar.high - bar.low : Math.max(bar.high - bar.low, Math.abs(bar.high - bars[index - 1].close), Math.abs(bar.low - bars[index - 1].close)));
}

function calculateAtr(bars: OhlcvBar[], period = 14) {
  const ranges = trueRanges(bars);
  if (ranges.length < period) return null;
  let result = ranges.slice(0, period).reduce((sum, value) => sum + value, 0) / period;
  for (const value of ranges.slice(period)) result = (result * (period - 1) + value) / period;
  return result;
}

function calculateAdx(bars: OhlcvBar[], period = 14) {
  if (bars.length < period * 2) return null;
  const ranges = trueRanges(bars);
  const plusDm: number[] = [];
  const minusDm: number[] = [];
  for (let index = 1; index < bars.length; index += 1) {
    const up = bars[index].high - bars[index - 1].high;
    const down = bars[index - 1].low - bars[index].low;
    plusDm.push(up > down && up > 0 ? up : 0);
    minusDm.push(down > up && down > 0 ? down : 0);
  }
  let tr = ranges.slice(1, period + 1).reduce((sum, value) => sum + value, 0);
  let plus = plusDm.slice(0, period).reduce((sum, value) => sum + value, 0);
  let minus = minusDm.slice(0, period).reduce((sum, value) => sum + value, 0);
  const dx: number[] = [];
  for (let index = period; index < bars.length; index += 1) {
    if (index > period) {
      tr = tr - tr / period + ranges[index];
      plus = plus - plus / period + plusDm[index - 1];
      minus = minus - minus / period + minusDm[index - 1];
    }
    const plusDi = tr ? (plus / tr) * 100 : 0;
    const minusDi = tr ? (minus / tr) * 100 : 0;
    const total = plusDi + minusDi;
    dx.push(total ? (Math.abs(plusDi - minusDi) / total) * 100 : 0);
  }
  return dx.length >= period ? average(dx.slice(-period)) : null;
}

export function calculateIndicators(symbol: string, bars: OhlcvBar[]): IndicatorSnapshot {
  const closes = bars.map((bar) => bar.close);
  const volumeValues = bars.map((bar) => bar.volume).filter((value) => Number.isFinite(value));
  const ema12 = emaSeries(closes, 12);
  const ema26 = emaSeries(closes, 26);
  const macdSeries = ema26.map((value, index) => value - (ema12[index + (ema12.length - ema26.length)] ?? value));
  const signalSeries = emaSeries(macdSeries, 9);
  const macdValue = macdSeries.at(-1) ?? null;
  const signalValue = signalSeries.at(-1) ?? null;
  const previousMacd = macdSeries.at(-2);
  const previousSignal = signalSeries.length > 1 ? signalSeries.at(-2) : undefined;
  const macdTrend = macdValue !== null && signalValue !== null && previousMacd !== undefined && previousSignal !== undefined
    ? previousMacd <= previousSignal && macdValue > signalValue ? "golden-cross" : previousMacd >= previousSignal && macdValue < signalValue ? "bearish-cross" : "neutral"
    : "neutral";
  const ema20 = ema(closes, 20);
  const ema50 = ema(closes, 50);
  const ema200 = ema(closes, 200);
  const emaTrend = ema20 === null || ema50 === null || ema200 === null ? "insufficient-data" : ema20 > ema50 && ema50 > ema200 ? "bullish-stack" : ema20 < ema50 && ema50 < ema200 ? "bearish-stack" : "mixed";
  const latestClose = closes.at(-1) ?? null;
  const atr14 = calculateAtr(bars);
  const obvValues = [0];
  for (let index = 1; index < bars.length; index += 1) obvValues.push(obvValues[index - 1] + (bars[index].close > bars[index - 1].close ? bars[index].volume : bars[index].close < bars[index - 1].close ? -bars[index].volume : 0));
  const previousObv = obvValues.length > 20 ? obvValues[obvValues.length - 21] : obvValues[0];
  const obv = obvValues.at(-1) ?? null;
  return {
    symbol,
    asOf: bars.at(-1)?.time ?? new Date().toISOString(),
    barsUsed: bars.length,
    rsi14: calculateRsi(closes),
    macd: macdValue,
    macdSignal: signalValue,
    macdHistogram: macdValue !== null && signalValue !== null ? macdValue - signalValue : null,
    macdTrend,
    ema20,
    ema50,
    ema200,
    emaTrend,
    volume: volumeValues.at(-1) ?? null,
    averageVolume20: average(volumeValues.slice(-20)),
    volumeRatio: volumeValues.length > 1 && average(volumeValues.slice(-21, -1)) ? (volumeValues.at(-1) ?? 0) / (average(volumeValues.slice(-21, -1)) ?? 1) : null,
    atr14,
    atrPercent: atr14 !== null && latestClose ? (atr14 / latestClose) * 100 : null,
    adx14: calculateAdx(bars),
    obv,
    obvChangePercent: previousObv ? ((obv! - previousObv) / Math.abs(previousObv)) * 100 : null,
  };
}

