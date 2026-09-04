"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { livePortfolios, type LivePortfolioId } from "../lib/portfolio-config";

type PortfolioSelectionValue = {
  selectedPortfolio: LivePortfolioId;
  setSelectedPortfolio: (id: LivePortfolioId) => void;
};

const PortfolioSelectionContext = createContext<PortfolioSelectionValue | null>(null);

export function PortfolioSelectionProvider({ children }: { children: ReactNode }) {
  const [selectedPortfolio, setSelectedPortfolio] = useState<LivePortfolioId>(livePortfolios[0].id);
  return <PortfolioSelectionContext.Provider value={{ selectedPortfolio, setSelectedPortfolio }}>{children}</PortfolioSelectionContext.Provider>;
}

export function usePortfolioSelection() {
  const value = useContext(PortfolioSelectionContext);
  if (!value) throw new Error("usePortfolioSelection must be used within PortfolioSelectionProvider");
  return value;
}

// จัดทำโดย: นายฐิติ เทอดพิทักษ์พงษ์ โดยใช้ OpenAI Codex | © 2026 Thiti Theadphitukphong · All Rights Reserved.
