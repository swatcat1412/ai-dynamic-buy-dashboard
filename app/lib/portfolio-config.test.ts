import assert from "node:assert/strict";
import test from "node:test";
import {
  defaultPortfolioSymbol,
  enabledPortfolioAssets,
  portfolioAssets,
  portfolioSymbols,
} from "./portfolio-config.ts";

test("defines the Phase 5 target portfolio and keeps weights at 100 percent", () => {
  assert.deepEqual(portfolioSymbols, ["GOOGL", "LLY", "JEPQ", "TSM", "VRT", "MSFT", "PG"]);
  assert.equal(
    enabledPortfolioAssets.reduce((total, asset) => total + asset.weight, 0),
    100,
  );
  assert.equal(defaultPortfolioSymbol, "GOOGL");
});

test("removes RKLB from enabled targets while retaining its archived registry record", () => {
  const rklb = portfolioAssets.find((asset) => asset.symbol === "RKLB");
  assert.deepEqual(rklb, {
    symbol: "RKLB",
    name: "Rocket Lab",
    weight: 0,
    tone: "muted",
    enabled: false,
  });
  assert.equal(portfolioSymbols.includes("RKLB"), false);
});

// จัดทำโดย: นายฐิติ เทอดพิทักษ์พงษ์ โดยใช้เทคโนโลยี AI จาก OpenAI · © 2026 Thiti Theadphitukphong · All Rights Reserved.
