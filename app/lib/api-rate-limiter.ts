type RateLimiterOptions = {
  windowMs: number;
  maxRequests: number;
  now?: () => number;
  sleep?: (milliseconds: number) => Promise<void>;
};

export function createSlidingWindowRateLimiter(options: RateLimiterOptions) {
  const timestamps: number[] = [];
  const now = options.now ?? Date.now;
  const sleep =
    options.sleep ??
    ((milliseconds: number) =>
      new Promise<void>((resolve) => setTimeout(resolve, milliseconds)));
  let admissionQueue = Promise.resolve();

  async function acquireSlot() {
    while (true) {
      const current = now();
      while (timestamps.length && current - timestamps[0] >= options.windowMs)
        timestamps.shift();
      if (timestamps.length < options.maxRequests) {
        timestamps.push(current);
        return;
      }

      const waitMs = Math.max(
        25,
        options.windowMs - (current - timestamps[0]) + 1,
      );
      await sleep(waitMs);
    }
  }

  return function runWithRateLimit<T>(task: () => Promise<T>): Promise<T> {
    const admission = admissionQueue.then(acquireSlot);
    admissionQueue = admission.then(
      () => undefined,
      () => undefined,
    );
    return admission.then(task);
  };
}

// Render currently runs one web-service instance. This guard is process-local;
// a shared/distributed limiter is required before scaling to multiple instances.
export const runWithTwelveDataRateLimit = createSlidingWindowRateLimiter({
  windowMs: 60_000,
  maxRequests: 7,
});

// จัดทำโดย: นายฐิติ เทอดพิทักษ์พงษ์ โดยใช้เทคโนโลยี AI จาก OpenAI · © 2026 Thiti Theadphitukphong · All Rights Reserved.
