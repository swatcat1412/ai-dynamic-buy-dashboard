import assert from "node:assert/strict";
import test from "node:test";
import { createSlidingWindowRateLimiter } from "./api-rate-limiter.ts";

test("admits only the configured number of requests per rolling window", async () => {
  let currentTime = 0;
  const waits: number[] = [];
  const run = createSlidingWindowRateLimiter({
    windowMs: 100,
    maxRequests: 2,
    now: () => currentTime,
    sleep: async (milliseconds) => {
      waits.push(milliseconds);
      currentTime += milliseconds;
    },
  });

  const values = await Promise.all([1, 2, 3].map((value) => run(async () => value)));
  assert.deepEqual(values, [1, 2, 3]);
  assert.deepEqual(waits, [101]);
});

test("does not serialize upstream tasks after admission", async () => {
  const run = createSlidingWindowRateLimiter({ windowMs: 100, maxRequests: 2 });
  let releaseFirst!: () => void;
  const firstBlocked = new Promise<void>((resolve) => { releaseFirst = resolve; });
  let secondStarted = false;

  const first = run(async () => firstBlocked);
  const second = run(async () => { secondStarted = true; });
  await new Promise((resolve) => setTimeout(resolve, 0));

  assert.equal(secondStarted, true);
  releaseFirst();
  await Promise.all([first, second]);
});

// จัดทำโดย: นายฐิติ เทอดพิทักษ์พงษ์ โดยใช้เทคโนโลยี AI จาก OpenAI · © 2026 Thiti Theadphitukphong · All Rights Reserved.
