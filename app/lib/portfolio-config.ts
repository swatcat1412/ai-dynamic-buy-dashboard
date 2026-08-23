export const portfolioAssets = [
  { symbol: "RKLB", name: "Rocket Lab", weight: 20, tone: "lime", enabled: true },
  { symbol: "GOOGL", name: "Alphabet", weight: 35, tone: "warm", enabled: true },
  { symbol: "LLY", name: "Eli Lilly", weight: 15, tone: "blue", enabled: true },
  { symbol: "JEPQ", name: "JPMorgan Nasdaq Equity Premium", weight: 30, tone: "violet", enabled: true },
] as const;

export type PortfolioAsset = (typeof portfolioAssets)[number];
export type PortfolioSymbol = PortfolioAsset["symbol"];

export const enabledPortfolioAssets = portfolioAssets.filter((asset) => asset.enabled);
export const portfolioSymbols = enabledPortfolioAssets.map((asset) => asset.symbol) as PortfolioSymbol[];
export const defaultPortfolioSymbol: PortfolioSymbol = portfolioSymbols[0] ?? "RKLB";

// จัดทำโดย: นายฐิติ เทอดพิทักษ์พงษ์ โดยใช้เทคโนโลยี AI จาก OpenAI · © 2026 Thiti Theadphitukphong · All Rights Reserved.
