import assert from "node:assert/strict";
import test from "node:test";
import { portfolioSymbols } from "./portfolio-config.ts";
import {
  buildMonthlyBulletPlan,
  getCorrectionContext,
  getRemainingReserve,
  monthlyPurchasePolicy,
  v2StrategyPortfolios,
} from "./v2-strategy.ts";

test("defines two distinct V2 portfolios without expanding live API coverage", () => {
  assert.deepEqual(
    v2StrategyPortfolios.map((portfolio) => portfolio.id),
    ["growth-income", "dividend-defensive"],
  );
  assert.deepEqual(v2StrategyPortfolios[0].symbols, [
    "JEPQ",
    "GOOGL",
    "LLY",
    "RKLB",
    "VRT",
  ]);
  assert.deepEqual(v2StrategyPortfolios[1].symbols, [
    "DGRO",
    "VIG",
    "O",
    "KO",
    "PG",
  ]);
  assert.equal(
    new Set(v2StrategyPortfolios.flatMap((portfolio) => portfolio.symbols))
      .size,
    10,
  );
  assert.deepEqual(portfolioSymbols, [
    "GOOGL",
    "LLY",
    "JEPQ",
    "TSM",
    "VRT",
    "MSFT",
    "PG",
    "RKLB",
  ]);
});

test("splits a monthly budget into three increasing bullets", () => {
  const plan = buildMonthlyBulletPlan(10_000);

  assert.equal(monthlyPurchasePolicy.maximumPurchases, 3);
  assert.deepEqual(
    plan.map((bullet) => bullet.amount),
    [2_500, 3_000, 4_500],
  );
  assert.equal(
    plan.reduce((total, bullet) => total + bullet.amount, 0),
    10_000,
  );
  assert.equal(getRemainingReserve(10_000, ["starter"]), 7_500);
  assert.equal(
    getRemainingReserve(10_000, ["starter", "pullback", "correction"]),
    0,
  );
});

test("preserves the full budget when rounding three bullets", () => {
  const plan = buildMonthlyBulletPlan(999.99);

  assert.equal(
    plan.reduce((total, bullet) => total + bullet.amount, 0),
    999.99,
  );
  assert.throws(() => buildMonthlyBulletPlan(-1), RangeError);
});

test("maps market drawdown to the correction multiplier", () => {
  assert.deepEqual(getCorrectionContext(1), {
    opportunity: "normal",
    multiplier: 0.5,
  });
  assert.deepEqual(getCorrectionContext(-3), {
    opportunity: "pullback",
    multiplier: 1,
  });
  assert.deepEqual(getCorrectionContext(-5), {
    opportunity: "correction",
    multiplier: 1.5,
  });
  assert.deepEqual(getCorrectionContext(-10), {
    opportunity: "major-correction",
    multiplier: 1.75,
  });
  assert.deepEqual(getCorrectionContext(-15), {
    opportunity: "panic",
    multiplier: 2,
  });
});

// จัดทำโดย: นายฐิติ เทอดพิทักษ์พงษ์ โดยใช้ OpenAI Codex | © 2026 Thiti Theadphitukphong · All Rights Reserved.
