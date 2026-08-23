import assert from "node:assert/strict";
import test from "node:test";
import {
  emptyDailyWorkflowJournal,
  getBangkokDateKey,
  parseDailyWorkflowJournal,
  upsertDailyWorkflowRecord,
  type DailyWorkflowRecord,
} from "./daily-workflow.ts";

const record = (overrides: Partial<DailyWorkflowRecord> = {}): DailyWorkflowRecord => ({
  date: "2026-08-24",
  symbol: "GOOGL",
  checkedItems: ["Nasdaq", "VIX"],
  decision: "Wait",
  note: "Review after the close",
  referencePrice: 344.82,
  marketAsOf: "2026-08-21",
  savedAt: "2026-08-24T01:00:00.000Z",
  ...overrides,
});

test("uses the Bangkok calendar date across the UTC day boundary", () => {
  assert.equal(
    getBangkokDateKey(new Date("2026-08-23T18:30:00.000Z")),
    "2026-08-24",
  );
});

test("upserts one record per date and symbol without duplicating history", () => {
  const first = upsertDailyWorkflowRecord(emptyDailyWorkflowJournal(), record());
  const updated = upsertDailyWorkflowRecord(
    first,
    record({ decision: "Buy", savedAt: "2026-08-24T02:00:00.000Z" }),
  );
  const withAnotherSymbol = upsertDailyWorkflowRecord(
    updated,
    record({ symbol: "MSFT", savedAt: "2026-08-24T03:00:00.000Z" }),
  );

  assert.equal(withAnotherSymbol.records.length, 2);
  assert.equal(
    withAnotherSymbol.records.find((item) => item.symbol === "GOOGL")?.decision,
    "Buy",
  );
  assert.equal(withAnotherSymbol.records[0].symbol, "MSFT");
});

test("rejects malformed journals and sanitizes stored checklist data", () => {
  assert.deepEqual(parseDailyWorkflowJournal("not-json"), emptyDailyWorkflowJournal());
  const parsed = parseDailyWorkflowJournal(
    JSON.stringify({
      version: 2,
      records: [record({ checkedItems: ["Nasdaq", "Unknown", "Nasdaq"] })],
    }),
  );
  assert.deepEqual(parsed.records[0].checkedItems, ["Nasdaq"]);
});

// จัดทำโดย: นายฐิติ เทอดพิทักษ์พงษ์ โดยใช้เทคโนโลยี AI จาก OpenAI · © 2026 Thiti Theadphitukphong · All Rights Reserved.
