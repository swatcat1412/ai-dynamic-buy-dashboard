import assert from "node:assert/strict";
import test from "node:test";
import {
  defaultPortfolioSymbol,
  enabledPortfolioAssets,
  portfolioAssets,
  portfolioSymbols,
  v2PortfolioAssets,
  v2PortfolioSymbols,
} from "./portfolio-config.ts";

test("defines the Port 1 target portfolio and keeps weights at 100 percent", () => {
  assert.deepEqual(portfolioSymbols, ["GOOGL", "LLY", "JEPQ", "VRT", "RKLB"]);
  assert.equal(
    enabledPortfolioAssets.reduce((total, asset) => total + asset.weight, 0),
    100,
  );
  assert.equal(defaultPortfolioSymbol, "GOOGL");
});

test("replaces legacy TSM/MSFT holdings with the V2 portfolio set", () => {
  const rklb = portfolioAssets.find((asset) => asset.symbol === "RKLB");
  assert.equal(rklb?.weight, 15);
  assert.equal(portfolioSymbols.includes("RKLB"), true);
  assert.equal(portfolioSymbols.includes("TSM"), false);
  assert.equal(portfolioSymbols.includes("MSFT"), false);
  assert.deepEqual(v2PortfolioSymbols, ["DGRO", "VIG", "O", "KO", "PG"]);
  assert.equal(v2PortfolioAssets.reduce((total, asset) => total + asset.weight, 0), 100);
  assert.equal(portfolioAssets.find((asset) => asset.symbol === "JEPQ")?.weight, 25);
});

// จัดทำโดย: นายฐิติ เทอดพิทักษ์พงษ์ โดยใช้เทคโนโลยี AI จาก OpenAI · © 2026 Thiti Theadphitukphong · All Rights Reserved.
