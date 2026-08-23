export const portfolioAssets = [
  { symbol: "GOOGL", name: "Alphabet", weight: 12.5, tone: "warm", enabled: true },
  { symbol: "LLY", name: "Eli Lilly", weight: 15, tone: "blue", enabled: true },
  { symbol: "JEPQ", name: "JPMorgan Nasdaq Equity Premium", weight: 30, tone: "violet", enabled: true },
  { symbol: "TSM", name: "Taiwan Semiconductor Manufacturing", weight: 12.5, tone: "lime", enabled: true },
  { symbol: "VRT", name: "Vertiv", weight: 10, tone: "teal", enabled: true },
  { symbol: "MSFT", name: "Microsoft", weight: 7.5, tone: "gold", enabled: true },
  { symbol: "PG", name: "Procter & Gamble", weight: 12.5, tone: "rose", enabled: true },
  { symbol: "RKLB", name: "Rocket Lab", weight: 0, tone: "muted", enabled: false },
] as const;

export type PortfolioAsset = (typeof portfolioAssets)[number];
export type PortfolioSymbol = PortfolioAsset["symbol"];

export const enabledPortfolioAssets = portfolioAssets.filter((asset) => asset.enabled);
export const portfolioSymbols = enabledPortfolioAssets.map((asset) => asset.symbol) as PortfolioSymbol[];
export const defaultPortfolioSymbol: PortfolioSymbol = portfolioSymbols[0] ?? portfolioAssets[0].symbol;

// จัดทำโดย: นายฐิติ เทอดพิทักษ์พงษ์ โดยใช้เทคโนโลยี AI จาก OpenAI · © 2026 Thiti Theadphitukphong · All Rights Reserved.
