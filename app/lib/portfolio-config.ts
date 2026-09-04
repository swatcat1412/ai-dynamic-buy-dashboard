export const portfolioAssets = [
  { symbol: "GOOGL", name: "Alphabet", weight: 20, tone: "warm", enabled: true },
  { symbol: "LLY", name: "Eli Lilly", weight: 20, tone: "blue", enabled: true },
  { symbol: "JEPQ", name: "JPMorgan Nasdaq Equity Premium", weight: 25, tone: "violet", enabled: true },
  { symbol: "VRT", name: "Vertiv", weight: 20, tone: "teal", enabled: true },
  { symbol: "RKLB", name: "Rocket Lab", weight: 15, tone: "muted", enabled: true },
] as const;

export const v2PortfolioAssets = [
  { symbol: "DGRO", name: "iShares Core Dividend Growth", weight: 20, tone: "lime", enabled: true },
  { symbol: "VIG", name: "Vanguard Dividend Appreciation", weight: 20, tone: "blue", enabled: true },
  { symbol: "O", name: "Realty Income", weight: 20, tone: "gold", enabled: true },
  { symbol: "KO", name: "Coca-Cola", weight: 20, tone: "rose", enabled: true },
  { symbol: "PG", name: "Procter & Gamble", weight: 20, tone: "rose", enabled: true },
] as const;

export type PortfolioAsset = (typeof portfolioAssets)[number];
export type V2PortfolioAsset = (typeof v2PortfolioAssets)[number];
type LegacyPortfolioSymbol = "TSM" | "MSFT";
export type PortfolioSymbol = PortfolioAsset["symbol"] | V2PortfolioAsset["symbol"] | LegacyPortfolioSymbol;

export const enabledPortfolioAssets = portfolioAssets.filter((asset) => asset.enabled);
export const portfolioSymbols = enabledPortfolioAssets.map((asset) => asset.symbol) as PortfolioSymbol[];
export const v2PortfolioSymbols = v2PortfolioAssets.map((asset) => asset.symbol) as PortfolioSymbol[];
export const allPortfolioSymbols = [...portfolioSymbols, ...v2PortfolioSymbols] as PortfolioSymbol[];
export const defaultPortfolioSymbol: PortfolioSymbol = portfolioSymbols[0] ?? portfolioAssets[0].symbol;

export const livePortfolios = [
  { id: "growth-income", label: "Port 1", name: "Growth + Income", assets: portfolioAssets },
  { id: "dividend-defensive", label: "Port 2", name: "Dividend Growth + Defensive", assets: v2PortfolioAssets },
] as const;
export type LivePortfolioId = (typeof livePortfolios)[number]["id"];

// จัดทำโดย: นายฐิติ เทอดพิทักษ์พงษ์ โดยใช้เทคโนโลยี AI จาก OpenAI · © 2026 Thiti Theadphitukphong · All Rights Reserved.
