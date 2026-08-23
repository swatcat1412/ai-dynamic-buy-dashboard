import {
  emptyDailyWorkflowJournal,
  parseDailyWorkflowJournal,
  upsertDailyWorkflowRecord,
  type DailyWorkflowJournal,
  type DailyWorkflowRecord,
} from "./daily-workflow";

export type DailyWorkflowRow = {
  user_id: string;
  workflow_date: string;
  symbol: string;
  checked_items: unknown;
  decision: string;
  note: string;
  reference_price: number | string | null;
  market_as_of: string | null;
  saved_at: string;
};

export function dailyWorkflowRecordToRow(
  userId: string,
  record: DailyWorkflowRecord,
) {
  return {
    user_id: userId,
    workflow_date: record.date,
    symbol: record.symbol,
    checked_items: record.checkedItems,
    decision: record.decision,
    note: record.note,
    reference_price: record.referencePrice,
    market_as_of: record.marketAsOf,
    saved_at: record.savedAt,
  } satisfies DailyWorkflowRow;
}

export function dailyWorkflowRowToRecord(value: unknown) {
  if (!value || typeof value !== "object") return null;
  const row = value as Partial<DailyWorkflowRow>;
  const numericReference =
    typeof row.reference_price === "string"
      ? Number(row.reference_price)
      : row.reference_price;
  const parsed = parseDailyWorkflowJournal(
    JSON.stringify({
      version: 2,
      records: [
        {
          date: row.workflow_date,
          symbol: row.symbol,
          checkedItems: row.checked_items,
          decision: row.decision,
          note: row.note,
          referencePrice: numericReference,
          marketAsOf: row.market_as_of,
          savedAt: row.saved_at,
        },
      ],
    }),
  );
  return parsed.records[0] ?? null;
}

export function rowsToDailyWorkflowJournal(rows: unknown[]) {
  return {
    version: 2,
    records: rows
      .map(dailyWorkflowRowToRecord)
      .filter((record): record is DailyWorkflowRecord => record !== null),
  } satisfies DailyWorkflowJournal;
}

export function mergeDailyWorkflowJournals(
  local: DailyWorkflowJournal,
  remote: DailyWorkflowJournal,
) {
  let merged = emptyDailyWorkflowJournal();
  for (const record of [...local.records, ...remote.records].sort((a, b) =>
    a.savedAt.localeCompare(b.savedAt),
  )) {
    merged = upsertDailyWorkflowRecord(merged, record);
  }
  return merged;
}

// จัดทำโดย: นายฐิติ เทอดพิทักษ์พงษ์ โดยใช้เทคโนโลยี AI จาก OpenAI · © 2026 Thiti Theadphitukphong · All Rights Reserved.
