import assert from "node:assert/strict";
import test, { afterEach } from "node:test";
import {
  getMarketRuntimeSnapshot,
  recordMarketAttempt,
  recordMarketFailure,
  recordMarketSuccess,
  resetMarketObservabilityForTests,
} from "./market-observability.ts";

afterEach(resetMarketObservabilityForTests);

test("records safe Twelve Data quota headers without exposing credentials", () => {
  recordMarketAttempt();
  recordMarketSuccess(
    new Headers({ "api-credits-used": "3", "api-credits-left": "5" }),
  );

  const snapshot = getMarketRuntimeSnapshot();
  assert.deepEqual(snapshot.quota && {
    used: snapshot.quota.used,
    left: snapshot.quota.left,
    limit: snapshot.quota.limit,
  }, { used: 3, left: 5, limit: 8 });
  assert.equal(snapshot.lastSuccessAt !== null, true);
  assert.equal(snapshot.servingStale, false);
});

test("marks the runtime degraded when stale cache is served", () => {
  recordMarketFailure("upstream-timeout", true);
  const snapshot = getMarketRuntimeSnapshot();
  assert.equal(snapshot.lastErrorCode, "upstream-timeout");
  assert.equal(snapshot.servingStale, true);
});

// จัดทำโดย: นายฐิติ เทอดพิทักษ์พงษ์ โดยใช้ OpenAI Codex | © 2026 Thiti Theadphitukphong · All Rights Reserved.
