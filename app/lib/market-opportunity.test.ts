import assert from "node:assert/strict";
import test from "node:test";
import { calculateMarketOpportunity } from "./market-opportunity.ts";

function historyWithDrawdown(drawdownPercent: number) {
  const high = 100;
  const current = high * (1 + drawdownPercent / 100);

  return Array.from({ length: 120 }, (_, index) => ({
    date: `2026-${String(12 - Math.floor(index / 28)).padStart(2, "0")}-${String(28 - (index % 28)).padStart(2, "0")}`,
    value: index === 0 ? current : high,
  }));
}

test("calculates Nasdaq drawdown across 20, 60, and 120 sessions", () => {
  const snapshot = calculateMarketOpportunity(historyWithDrawdown(-7.25));

  assert.equal(snapshot.benchmark, "NASDAQCOM");
  assert.equal(snapshot.currentValue, 92.75);
  assert.deepEqual(
    snapshot.drawdowns.map((window) => window.sessions),
    [20, 60, 120],
  );
  assert.ok(
    snapshot.drawdowns.every(
      (window) => window.drawdownPercent === -7.25 && window.high === 100,
    ),
  );
  assert.equal(snapshot.opportunity, "correction");
  assert.equal(snapshot.multiplier, 1.5);
  assert.equal(snapshot.partialHistory, false);
});

test("uses the latest dated observation and ignores invalid duplicates", () => {
  const history = historyWithDrawdown(-3);
  history.push({ date: "2026-12-28", value: Number.NaN });
  history.push({ date: "2026-12-28", value: 97 });

  const snapshot = calculateMarketOpportunity(history);

  assert.equal(snapshot.asOf, "2026-12-28");
  assert.equal(snapshot.opportunity, "pullback");
  assert.equal(snapshot.multiplier, 1);
});

test("marks shorter history as partial and requires 20 observations", () => {
  const partial = calculateMarketOpportunity(
    historyWithDrawdown(-1).slice(0, 60),
  );

  assert.equal(partial.barsUsed, 60);
  assert.equal(partial.partialHistory, true);
  assert.throws(
    () => calculateMarketOpportunity(historyWithDrawdown(-1).slice(0, 19)),
    RangeError,
  );
});

// จัดทำโดย: นายฐิติ เทอดพิทักษ์พงษ์ โดยใช้ OpenAI Codex | © 2026 Thiti Theadphitukphong · All Rights Reserved.
