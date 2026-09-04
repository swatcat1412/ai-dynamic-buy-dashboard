import assert from "node:assert/strict";
import test from "node:test";
import { calculateStockOpportunity } from "./stock-opportunity.ts";

test("keeps stock score separate and adds a bounded market context bonus", () => {
  const result = calculateStockOpportunity({ stockScore: 62, marketMultiplier: 1.5 });
  assert.equal(result.stockScore, 62);
  assert.equal(result.marketBonus, 13);
  assert.equal(result.opportunityScore, 75);
});

test("does not add a bonus when market context is unavailable", () => {
  const result = calculateStockOpportunity({ stockScore: 48, marketMultiplier: null });
  assert.equal(result.marketBonus, 0);
  assert.equal(result.opportunityScore, 48);
});

test("caps the opportunity score at 100", () => {
  const result = calculateStockOpportunity({ stockScore: 95, marketMultiplier: 2 });
  assert.equal(result.opportunityScore, 100);
});

// จัดทำโดย: นายฐิติ เทอดพิทักษ์พงษ์ โดยใช้ OpenAI Codex | © 2026 Thiti Theadphitukphong · All Rights Reserved.
