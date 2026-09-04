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

// Each request made by this module is one /time_series request for one symbol
// (one credit). Default to the current Basic limit while allowing a plan change
// through server-only configuration. This remains process-local.
const configuredRequestsPerMinute = Number(
  process.env.TWELVE_DATA_REQUESTS_PER_MINUTE ?? "8",
);
export const TWELVE_DATA_REQUESTS_PER_MINUTE =
  Number.isSafeInteger(configuredRequestsPerMinute) &&
  configuredRequestsPerMinute > 0
    ? configuredRequestsPerMinute
    : 8;
export const runWithTwelveDataRateLimit = createSlidingWindowRateLimiter({
  windowMs: 60_000,
  maxRequests: TWELVE_DATA_REQUESTS_PER_MINUTE,
});

// จัดทำโดย: นายฐิติ เทอดพิทักษ์พงษ์ โดยใช้เทคโนโลยี AI จาก OpenAI · © 2026 Thiti Theadphitukphong · All Rights Reserved.
