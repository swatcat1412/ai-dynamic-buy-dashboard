export const v2StrategyPortfolios = [
  {
    id: "growth-income",
    label: "Port 1",
    name: "Growth + Income",
    objective: "Capital growth, AI, healthcare, and monthly income",
    symbols: ["JEPQ", "GOOGL", "LLY", "RKLB", "VRT"],
  },
  {
    id: "dividend-defensive",
    label: "Port 2",
    name: "Dividend Growth + Defensive",
    objective: "Dividend growth, lower concentration, and defensive balance",
    symbols: ["DGRO", "VIG", "O", "KO", "PG"],
  },
] as const;

export const monthlyPurchasePolicy = {
  maximumPurchases: 3,
  carryUnusedReserve: true,
  bullets: [
    {
      id: "starter",
      label: "Starter",
      budgetShare: 25,
      purpose: "Enter a fair opportunity without waiting for a perfect bottom",
    },
    {
      id: "pullback",
      label: "Pullback",
      budgetShare: 30,
      purpose: "Add when the stock or market offers a better entry",
    },
    {
      id: "correction",
      label: "Correction",
      budgetShare: 45,
      purpose: "Use the largest reserve only when market and stock signals align",
    },
  ],
} as const;

export type V2PortfolioId = (typeof v2StrategyPortfolios)[number]["id"];
export type MonthlyBulletId =
  (typeof monthlyPurchasePolicy.bullets)[number]["id"];
export type MarketOpportunity =
  | "normal"
  | "pullback"
  | "correction"
  | "major-correction"
  | "panic";

export type MonthlyBulletPlan = {
  id: MonthlyBulletId;
  label: string;
  budgetShare: number;
  amount: number;
  purpose: string;
};

function normalizeBudget(budget: number) {
  if (!Number.isFinite(budget) || budget < 0) {
    throw new RangeError("Monthly budget must be a finite, non-negative number");
  }

  return Number(budget.toFixed(2));
}

export function buildMonthlyBulletPlan(budget: number): MonthlyBulletPlan[] {
  const normalizedBudget = normalizeBudget(budget);

  return monthlyPurchasePolicy.bullets.map((bullet, index, bullets) => {
    const allocatedBefore = bullets
      .slice(0, index)
      .reduce(
        (total, item) =>
          total + Number(((normalizedBudget * item.budgetShare) / 100).toFixed(2)),
        0,
      );
    const amount =
      index === bullets.length - 1
        ? Number((normalizedBudget - allocatedBefore).toFixed(2))
        : Number(((normalizedBudget * bullet.budgetShare) / 100).toFixed(2));

    return { ...bullet, amount };
  });
}

export function getCorrectionContext(drawdownPercent: number): {
  opportunity: MarketOpportunity;
  multiplier: number;
} {
  if (!Number.isFinite(drawdownPercent)) {
    throw new RangeError("Drawdown must be a finite number");
  }

  const drawdown = Math.abs(Math.min(drawdownPercent, 0));

  if (drawdown >= 15) return { opportunity: "panic", multiplier: 2 };
  if (drawdown >= 10)
    return { opportunity: "major-correction", multiplier: 1.75 };
  if (drawdown >= 5)
    return { opportunity: "correction", multiplier: 1.5 };
  if (drawdown >= 3)
    return { opportunity: "pullback", multiplier: 1 };
  return { opportunity: "normal", multiplier: 0.5 };
}

export function getRemainingReserve(
  budget: number,
  usedBullets: readonly MonthlyBulletId[],
) {
  const plan = buildMonthlyBulletPlan(budget);
  const used = new Set(usedBullets);
  const spent = plan
    .filter((bullet) => used.has(bullet.id))
    .reduce((total, bullet) => total + bullet.amount, 0);

  return Number((normalizeBudget(budget) - spent).toFixed(2));
}

// จัดทำโดย: นายฐิติ เทอดพิทักษ์พงษ์ โดยใช้ OpenAI Codex | © 2026 Thiti Theadphitukphong · All Rights Reserved.
