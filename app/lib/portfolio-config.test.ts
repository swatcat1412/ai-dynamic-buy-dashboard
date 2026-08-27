import assert from "node:assert/strict";
import test from "node:test";
import {
  defaultPortfolioSymbol,
  enabledPortfolioAssets,
  portfolioAssets,
  portfolioSymbols,
} from "./portfolio-config.ts";

test("defines the eight-stock target portfolio and keeps weights at 100 percent", () => {
  assert.deepEqual(portfolioSymbols, ["GOOGL", "LLY", "JEPQ", "TSM", "VRT", "MSFT", "PG", "RKLB"]);
  assert.equal(
    enabledPortfolioAssets.reduce((total, asset) => total + asset.weight, 0),
    100,
  );
  assert.equal(defaultPortfolioSymbol, "GOOGL");
});

test("enables RKLB at a controlled five-percent allocation", () => {
  const rklb = portfolioAssets.find((asset) => asset.symbol === "RKLB");
  assert.deepEqual(rklb, {
    symbol: "RKLB",
    name: "Rocket Lab",
    weight: 5,
    tone: "muted",
    enabled: true,
  });
  assert.equal(portfolioSymbols.includes("RKLB"), true);
  assert.equal(portfolioAssets.find((asset) => asset.symbol === "JEPQ")?.weight, 25);
});

// จัดทำโดย: นายฐิติ เทอดพิทักษ์พงษ์ โดยใช้เทคโนโลยี AI จาก OpenAI · © 2026 Thiti Theadphitukphong · All Rights Reserved.
