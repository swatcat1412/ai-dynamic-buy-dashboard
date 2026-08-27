import assert from "node:assert/strict";
import test, { after } from "node:test";
import { DAILY_MARKET_CACHE_TTL_MS, TwelveDataProvider } from "./market-data.ts";
import { defaultPortfolioSymbol } from "./portfolio-config.ts";

const originalFetch = globalThis.fetch;
const originalApiKey = process.env.TWELVE_DATA_API_KEY;

after(() => {
  globalThis.fetch = originalFetch;
  if (originalApiKey === undefined) delete process.env.TWELVE_DATA_API_KEY;
  else process.env.TWELVE_DATA_API_KEY = originalApiKey;
});

test("shares one normalized 260-bar upstream request across history ranges", async () => {
  process.env.TWELVE_DATA_API_KEY = "test-api-key";
  let upstreamRequests = 0;
  const values = Array.from({ length: 260 }, (_, index) => ({
    datetime: `2026-01-${String(index + 1).padStart(3, "0")}`,
    open: String(index + 1),
    high: String(index + 2),
    low: String(index),
    close: String(index + 1.5),
    volume: String(1_000 + index),
  }));

  globalThis.fetch = async (input, init) => {
    upstreamRequests += 1;
    const url = new URL(input.toString());
    assert.equal(url.searchParams.get("outputsize"), "260");
    assert.equal(
      (init as { next?: { revalidate?: number } } | undefined)?.next?.revalidate,
      DAILY_MARKET_CACHE_TTL_MS / 1000,
    );
    return Response.json({ values });
  };

  const provider = new TwelveDataProvider();
  const [fiveBars, oneHundredTwentyBars] = await Promise.all([
    provider.getHistory(defaultPortfolioSymbol, 5),
    provider.getHistory(defaultPortfolioSymbol, 120),
  ]);

  assert.equal(upstreamRequests, 1);
  assert.equal(fiveBars.length, 5);
  assert.equal(oneHundredTwentyBars.length, 120);
  assert.equal(fiveBars.at(-1)?.close, oneHundredTwentyBars.at(-1)?.close);
});

// จัดทำโดย: นายฐิติ เทอดพิทักษ์พงษ์ โดยใช้เทคโนโลยี AI จาก OpenAI · © 2026 Thiti Theadphitukphong · All Rights Reserved.
