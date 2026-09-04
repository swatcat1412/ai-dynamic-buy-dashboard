"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { livePortfolios, type LivePortfolioId } from "../lib/portfolio-config";

type PortfolioSelectionValue = {
  selectedPortfolio: LivePortfolioId;
  setSelectedPortfolio: (id: LivePortfolioId) => void;
  selectedSymbol: string;
  setSelectedSymbol: (symbol: string) => void;
};

const PortfolioSelectionContext = createContext<PortfolioSelectionValue | null>(null);

export function PortfolioSelectionProvider({ children }: { children: ReactNode }) {
  const [selectedPortfolio, setSelectedPortfolio] = useState<LivePortfolioId>(livePortfolios[0].id);
  const [selectedSymbol, setSelectedSymbolState] = useState<string>(livePortfolios[0].assets[0].symbol);
  const setPortfolio = (id: LivePortfolioId) => {
    setSelectedPortfolio(id);
    const nextPortfolio = livePortfolios.find((portfolio) => portfolio.id === id) ?? livePortfolios[0];
    setSelectedSymbolState(nextPortfolio.assets[0].symbol);
  };
  const setSelectedSymbol = (symbol: string) => {
    const portfolio = livePortfolios.find((item) => item.id === selectedPortfolio) ?? livePortfolios[0];
    if (portfolio.assets.some((asset) => asset.symbol === symbol)) setSelectedSymbolState(symbol);
  };
  return <PortfolioSelectionContext.Provider value={{ selectedPortfolio, setSelectedPortfolio: setPortfolio, selectedSymbol, setSelectedSymbol }}>{children}</PortfolioSelectionContext.Provider>;
}

export function usePortfolioSelection() {
  const value = useContext(PortfolioSelectionContext);
  if (!value) throw new Error("usePortfolioSelection must be used within PortfolioSelectionProvider");
  return value;
}

// จัดทำโดย: นายฐิติ เทอดพิทักษ์พงษ์ โดยใช้ OpenAI Codex | © 2026 Thiti Theadphitukphong · All Rights Reserved.
