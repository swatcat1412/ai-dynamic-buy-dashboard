import assert from "node:assert/strict";
import test from "node:test";
import {
  dailyWorkflowRecordToRow,
  dailyWorkflowRowToRecord,
  mergeDailyWorkflowJournals,
} from "./daily-workflow-sync";
import type { DailyWorkflowRecord } from "./daily-workflow";

const record = (overrides: Partial<DailyWorkflowRecord> = {}) =>
  ({
    date: "2026-08-23",
    symbol: "GOOGL",
    checkedItems: ["Nasdaq", "VIX"],
    decision: "Wait",
    note: "Hold for support",
    referencePrice: 344.82,
    marketAsOf: "2026-08-21",
    savedAt: "2026-08-23T13:00:00.000Z",
    ...overrides,
  }) satisfies DailyWorkflowRecord;

test("round-trips a daily workflow record through the Supabase row shape", () => {
  const source = record();
  const row = dailyWorkflowRecordToRow("00000000-0000-4000-8000-000000000001", source);
  assert.deepEqual(dailyWorkflowRowToRecord(row), source);
});

test("rejects malformed or unsupported Supabase rows", () => {
  assert.equal(dailyWorkflowRowToRecord({ workflow_date: "bad" }), null);
  assert.equal(
    dailyWorkflowRowToRecord({
      ...dailyWorkflowRecordToRow("user", record()),
      symbol: "INVALID",
    }),
    null,
  );
});

test("merges local and cloud journals by newest date and symbol record", () => {
  const older = record({ note: "local old" });
  const newer = record({
    note: "cloud new",
    savedAt: "2026-08-23T14:00:00.000Z",
  });
  const other = record({ date: "2026-08-22", note: "other day" });
  const merged = mergeDailyWorkflowJournals(
    { version: 2, records: [older, other] },
    { version: 2, records: [newer] },
  );
  assert.equal(merged.records.length, 2);
  assert.equal(merged.records[0].note, "cloud new");
  assert.equal(merged.records[1].note, "other day");
});

// จัดทำโดย: นายฐิติ เทอดพิทักษ์พงษ์ โดยใช้เทคโนโลยี AI จาก OpenAI · © 2026 Thiti Theadphitukphong · All Rights Reserved.
