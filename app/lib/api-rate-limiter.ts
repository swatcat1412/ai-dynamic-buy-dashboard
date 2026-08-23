const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 7;
const timestamps: number[] = [];
let queue = Promise.resolve();

function prune(now: number) {
  while (timestamps.length && now - timestamps[0] >= WINDOW_MS) timestamps.shift();
}

async function waitForSlot() {
  while (true) {
    const now = Date.now();
    prune(now);
    if (timestamps.length < MAX_REQUESTS_PER_WINDOW) {
      timestamps.push(now);
      return;
    }

    const waitMs = Math.max(250, WINDOW_MS - (now - timestamps[0]) + 25);
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }
}

export function runWithTwelveDataRateLimit<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(async () => {
    await waitForSlot();
    return task();
  });

  queue = run.then(() => undefined, () => undefined);
  return run;
}

// จัดทำโดย: นายฐิติ เทอดพิทักษ์พงษ์ โดยใช้เทคโนโลยี AI จาก OpenAI · © 2026 Thiti Theadphitukphong · All Rights Reserved.
