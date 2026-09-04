export type StockOpportunityInput = {
  stockScore: number;
  marketMultiplier: number | null;
};

export type StockOpportunity = StockOpportunityInput & {
  marketBonus: number;
  opportunityScore: number;
};

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function calculateStockOpportunity({ stockScore, marketMultiplier }: StockOpportunityInput): StockOpportunity {
  if (!Number.isFinite(stockScore) || stockScore < 0 || stockScore > 100) {
    throw new RangeError("Stock score must be between 0 and 100");
  }

  const normalizedMultiplier = marketMultiplier === null ? 0.5 : marketMultiplier;
  if (!Number.isFinite(normalizedMultiplier) || normalizedMultiplier < 0.5 || normalizedMultiplier > 2) {
    throw new RangeError("Market multiplier must be between 0.5 and 2");
  }

  const marketBonus = Math.round(((normalizedMultiplier - 0.5) / 1.5) * 20);
  return {
    stockScore: clampScore(stockScore),
    marketMultiplier,
    marketBonus,
    opportunityScore: clampScore(stockScore + marketBonus),
  };
}

// จัดทำโดย: นายฐิติ เทอดพิทักษ์พงษ์ โดยใช้ OpenAI Codex | © 2026 Thiti Theadphitukphong · All Rights Reserved.
