import { portfolioSymbols, type PortfolioSymbol } from "./portfolio-config";

export const dailyChecklistItems = [
  "Nasdaq",
  "VIX",
  "Bond Yield",
  "DXY",
  "Earnings",
  "RSI",
  "MACD",
  "Buy Zone",
] as const;

export const dailyDecisions = ["Not decided", "Buy", "Wait", "Watch"] as const;

export type DailyDecision = (typeof dailyDecisions)[number];
export type DailyWorkflowRecord = {
  date: string;
  symbol: PortfolioSymbol;
  checkedItems: string[];
  decision: DailyDecision;
  note: string;
  referencePrice: number | null;
  marketAsOf: string | null;
  savedAt: string;
};

export type DailyWorkflowJournal = {
  version: 2;
  records: DailyWorkflowRecord[];
};

export const emptyDailyWorkflowJournal = (): DailyWorkflowJournal => ({
  version: 2,
  records: [],
});

export function getBangkokDateKey(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return `${value("year")}-${value("month")}-${value("day")}`;
}

function isPortfolioSymbol(value: unknown): value is PortfolioSymbol {
  return (
    typeof value === "string" &&
    (portfolioSymbols as readonly string[]).includes(value)
  );
}

function isDecision(value: unknown): value is DailyDecision {
  return (
    typeof value === "string" &&
    (dailyDecisions as readonly string[]).includes(value)
  );
}

function parseRecord(value: unknown): DailyWorkflowRecord | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Partial<DailyWorkflowRecord>;
  if (
    typeof record.date !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(record.date) ||
    !isPortfolioSymbol(record.symbol) ||
    !isDecision(record.decision) ||
    typeof record.note !== "string" ||
    typeof record.savedAt !== "string" ||
    Number.isNaN(Date.parse(record.savedAt))
  )
    return null;

  const allowedItems = new Set<string>(dailyChecklistItems);
  const checkedItems = Array.isArray(record.checkedItems)
    ? [...new Set(record.checkedItems.filter((item): item is string => typeof item === "string" && allowedItems.has(item)))]
    : [];
  const referencePrice =
    typeof record.referencePrice === "number" &&
    Number.isFinite(record.referencePrice) &&
    record.referencePrice > 0
      ? record.referencePrice
      : null;

  return {
    date: record.date,
    symbol: record.symbol,
    checkedItems,
    decision: record.decision,
    note: record.note.slice(0, 2_000),
    referencePrice,
    marketAsOf:
      typeof record.marketAsOf === "string" ? record.marketAsOf : null,
    savedAt: record.savedAt,
  };
}

export function parseDailyWorkflowJournal(raw: string | null) {
  if (!raw) return emptyDailyWorkflowJournal();
  try {
    const value = JSON.parse(raw) as { version?: unknown; records?: unknown };
    if (value.version !== 2 || !Array.isArray(value.records))
      return emptyDailyWorkflowJournal();
    return {
      version: 2,
      records: value.records
        .map(parseRecord)
        .filter((record): record is DailyWorkflowRecord => record !== null)
        .sort((a, b) => b.savedAt.localeCompare(a.savedAt)),
    } satisfies DailyWorkflowJournal;
  } catch {
    return emptyDailyWorkflowJournal();
  }
}

export function upsertDailyWorkflowRecord(
  journal: DailyWorkflowJournal,
  record: DailyWorkflowRecord,
) {
  return {
    version: 2,
    records: [
      record,
      ...journal.records.filter(
        (item) => item.date !== record.date || item.symbol !== record.symbol,
      ),
    ].sort((a, b) => b.savedAt.localeCompare(a.savedAt)),
  } satisfies DailyWorkflowJournal;
}

// จัดทำโดย: นายฐิติ เทอดพิทักษ์พงษ์ โดยใช้เทคโนโลยี AI จาก OpenAI · © 2026 Thiti Theadphitukphong · All Rights Reserved.
