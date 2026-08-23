"use client";

import { useEffect, useMemo, useState } from "react";
import {
  dailyChecklistItems,
  dailyDecisions,
  emptyDailyWorkflowJournal,
  getBangkokDateKey,
  parseDailyWorkflowJournal,
  upsertDailyWorkflowRecord,
  type DailyDecision,
  type DailyWorkflowJournal,
  type DailyWorkflowRecord,
} from "../lib/daily-workflow";
import {
  defaultPortfolioSymbol,
  portfolioSymbols,
  type PortfolioSymbol,
} from "../lib/portfolio-config";
import {
  dailyWorkflowRecordToRow,
  mergeDailyWorkflowJournals,
  rowsToDailyWorkflowJournal,
} from "../lib/daily-workflow-sync";
import { getSupabaseBrowserClient } from "../lib/supabase-browser";

const storageKey = "dynamic-buy-daily-workflow-v2";
const cloudJournalLimit = 1_000;

type Quote = { symbol: PortfolioSymbol; price: number; asOf: string };
type SyncUser = { id: string; email: string | null };
type SyncState =
  | "initializing"
  | "unavailable"
  | "signed-out"
  | "sending"
  | "link-sent"
  | "syncing"
  | "synced"
  | "error";

function migrateLegacyRecord(todayKey: string): DailyWorkflowRecord | null {
  try {
    const checklist = JSON.parse(
      localStorage.getItem("dynamic-buy-checklist-v1") || "null",
    ) as { date?: string; checkedItems?: string[] } | null;
    const decision = JSON.parse(
      localStorage.getItem("dynamic-buy-decision-v1") || "null",
    ) as {
      date?: string;
      decision?: string;
      note?: string;
      savedAt?: string;
    } | null;
    if (checklist?.date !== todayKey && decision?.date !== todayKey) return null;
    const validDecision = (dailyDecisions as readonly string[]).includes(
      decision?.decision || "",
    )
      ? (decision?.decision as DailyDecision)
      : "Not decided";
    return {
      date: todayKey,
      symbol: defaultPortfolioSymbol,
      checkedItems: checklist?.checkedItems || [],
      decision: validDecision,
      note: decision?.note || "",
      referencePrice: null,
      marketAsOf: null,
      savedAt: decision?.savedAt || new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export default function DailyChecklist() {
  const [todayKey] = useState(() => getBangkokDateKey());
  const [symbol, setSymbol] =
    useState<PortfolioSymbol>(defaultPortfolioSymbol);
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [decision, setDecision] = useState<DailyDecision>("Not decided");
  const [note, setNote] = useState("");
  const [journal, setJournal] = useState<DailyWorkflowJournal>(() =>
    emptyDailyWorkflowJournal(),
  );
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [saved, setSaved] = useState(false);
  const [supabase] = useState(() => getSupabaseBrowserClient());
  const [syncUser, setSyncUser] = useState<SyncUser | null>(null);
  const [syncState, setSyncState] = useState<SyncState>(() =>
    supabase ? "initializing" : "unavailable",
  );
  const [syncEmail, setSyncEmail] = useState("");
  const [syncMessage, setSyncMessage] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      let nextJournal = parseDailyWorkflowJournal(
        localStorage.getItem(storageKey),
      );
      if (!nextJournal.records.length) {
        const legacyRecord = migrateLegacyRecord(todayKey);
        if (legacyRecord)
          nextJournal = upsertDailyWorkflowRecord(nextJournal, legacyRecord);
      }
      nextJournal = parseDailyWorkflowJournal(JSON.stringify(nextJournal));
      localStorage.setItem(storageKey, JSON.stringify(nextJournal));
      const currentRecord = nextJournal.records.find(
        (item) =>
          item.date === todayKey && item.symbol === defaultPortfolioSymbol,
      );
      setJournal(nextJournal);
      setCheckedItems(currentRecord?.checkedItems || []);
      setDecision(currentRecord?.decision || "Not decided");
      setNote(currentRecord?.note || "");
      setLoaded(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [todayKey]);

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    const setUser = (user: { id: string; email?: string } | null) => {
      if (!active) return;
      setSyncUser(user ? { id: user.id, email: user.email ?? null } : null);
      setSyncState(user ? "syncing" : "signed-out");
      setSyncMessage("");
    };
    void supabase.auth.getUser().then(({ data, error }) => {
      if (error) {
        if (error.name === "AuthSessionMissingError") {
          setUser(null);
          return;
        }
        if (active) {
          setSyncState("error");
          setSyncMessage("Could not validate the saved sign-in session.");
        }
        return;
      }
      setUser(data.user);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    if (!loaded || !supabase || !syncUser) return;
    let active = true;
    const syncJournal = async () => {
      setSyncState("syncing");
      setSyncMessage("");
      const { data, error } = await supabase
        .from("daily_workflow_records")
        .select(
          "user_id,workflow_date,symbol,checked_items,decision,note,reference_price,market_as_of,saved_at",
        )
        .order("saved_at", { ascending: false })
        .limit(cloudJournalLimit);
      if (error) throw error;
      const localJournal = parseDailyWorkflowJournal(
        localStorage.getItem(storageKey),
      );
      const merged = mergeDailyWorkflowJournals(
        localJournal,
        rowsToDailyWorkflowJournal(data ?? []),
      );
      if (!active) return;
      localStorage.setItem(storageKey, JSON.stringify(merged));
      setJournal(merged);
      const currentRecord = merged.records.find(
        (item) => item.date === todayKey && item.symbol === symbol,
      );
      setCheckedItems(currentRecord?.checkedItems || []);
      setDecision(currentRecord?.decision || "Not decided");
      setNote(currentRecord?.note || "");
      if (merged.records.length) {
        const { error: upsertError } = await supabase
          .from("daily_workflow_records")
          .upsert(
            merged.records.map((record) =>
              dailyWorkflowRecordToRow(syncUser.id, record),
            ),
            { onConflict: "user_id,workflow_date,symbol" },
          );
        if (upsertError) throw upsertError;
      }
      if (active) setSyncState("synced");
    };
    void syncJournal().catch(() => {
      if (active) {
        setSyncState("error");
        setSyncMessage("Cloud sync failed. Browser data remains available.");
      }
    });
    return () => {
      active = false;
    };
  }, [loaded, supabase, syncUser, symbol, todayKey]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/market/quotes", { cache: "no-store" })
      .then(async (response) => {
        const payload = (await response.json()) as {
          ok?: boolean;
          quotes?: Quote[];
        };
        if (!response.ok || !payload.quotes)
          throw new Error("Quotes unavailable");
        if (!cancelled) setQuotes(payload.quotes);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const quoteMap = useMemo(
    () => new Map(quotes.map((quote) => [quote.symbol, quote])),
    [quotes],
  );
  const completedCount = checkedItems.length;
  const progress = Math.round(
    (completedCount / dailyChecklistItems.length) * 100,
  );
  const status =
    completedCount === dailyChecklistItems.length ? "Ready" : "In progress";
  const completedSet = useMemo(() => new Set(checkedItems), [checkedItems]);

  function toggleItem(item: string) {
    setSaved(false);
    setCheckedItems((current) =>
      current.includes(item)
        ? current.filter((entry) => entry !== item)
        : [...current, item],
    );
  }

  function selectSymbol(nextSymbol: PortfolioSymbol) {
    const record = journal.records.find(
      (item) => item.date === todayKey && item.symbol === nextSymbol,
    );
    setSymbol(nextSymbol);
    setCheckedItems(record?.checkedItems || []);
    setDecision(record?.decision || "Not decided");
    setNote(record?.note || "");
    setSaved(false);
  }

  function saveDecision() {
    const quote = quoteMap.get(symbol);
    const record: DailyWorkflowRecord = {
      date: todayKey,
      symbol,
      checkedItems,
      decision,
      note: note.trim(),
      referencePrice: quote?.price ?? null,
      marketAsOf: quote?.asOf ?? null,
      savedAt: new Date().toISOString(),
    };
    const nextJournal = upsertDailyWorkflowRecord(journal, record);
    localStorage.setItem(storageKey, JSON.stringify(nextJournal));
    setJournal(nextJournal);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
    if (supabase && syncUser) {
      setSyncState("syncing");
      void supabase
        .from("daily_workflow_records")
        .upsert(dailyWorkflowRecordToRow(syncUser.id, record), {
          onConflict: "user_id,workflow_date,symbol",
        })
        .then(({ error }) => {
          if (error) {
            setSyncState("error");
            setSyncMessage("Saved in browser, but cloud sync failed.");
          } else {
            setSyncState("synced");
            setSyncMessage("");
          }
        });
    }
  }

  async function requestMagicLink() {
    if (!supabase || !syncEmail.trim()) return;
    setSyncState("sending");
    setSyncMessage("");
    const { error } = await supabase.auth.signInWithOtp({
      email: syncEmail.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        shouldCreateUser: true,
      },
    });
    if (error) {
      setSyncState("error");
      setSyncMessage(error.message);
      return;
    }
    setSyncState("link-sent");
    setSyncMessage("Check your email and open the secure sign-in link.");
  }

  async function signOut() {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) {
      setSyncState("error");
      setSyncMessage(error.message);
    }
  }

  function outcome(record: DailyWorkflowRecord) {
    const latest = quoteMap.get(record.symbol)?.price;
    if (!latest || !record.referencePrice) return null;
    return ((latest - record.referencePrice) / record.referencePrice) * 100;
  }

  return (
    <>
      <div className="checklist-layout">
        <article className="checklist-summary">
          <div className="score-card-header">
            <span>Today&apos;s review · {todayKey}</span>
            <span className="score-date">
              {syncUser ? "CLOUD SYNC" : "BROWSER LOCAL"}
            </span>
          </div>
          <div className="checklist-progress-number">
            {completedCount}
            <span>/{dailyChecklistItems.length}</span>
          </div>
          <p>ตรวจสัญญาณสำคัญก่อนตัดสินใจตาม Buy Zone ของวัน</p>
          <div className="score-meter">
            <span style={{ width: `${progress}%` }} />
          </div>
          <div className="checklist-summary-footer">
            <span>{progress}% complete</span>
            <strong className={status === "Ready" ? "positive" : "caution"}>
              {status}
            </strong>
          </div>
          <div className="decision-form">
            <label>
              Symbol
              <select
                aria-label="Daily workflow symbol"
                value={symbol}
                onChange={(event) =>
                  selectSymbol(event.target.value as PortfolioSymbol)
                }
              >
                {portfolioSymbols.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <label>
              Today&apos;s decision
              <select
                aria-label="Today's decision"
                value={decision}
                onChange={(event) => {
                  setSaved(false);
                  setDecision(event.target.value as DailyDecision);
                }}
              >
                {dailyDecisions.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <label>
              Note
              <textarea
                aria-label="Daily workflow note"
                value={note}
                onChange={(event) => {
                  setSaved(false);
                  setNote(event.target.value);
                }}
                placeholder="Why this decision?"
                rows={3}
                maxLength={2_000}
              />
            </label>
            <button type="button" onClick={saveDecision} disabled={!loaded}>
              {saved ? "Saved" : "Save daily record"}
            </button>
            <small>
              {syncUser
                ? "Saved in this browser and synced to your private account."
                : "Saved only in this browser until you sign in. Re-saving the same date and symbol updates one record."}
            </small>
          </div>
          <div className="journal-sync-panel" aria-label="Daily journal cloud sync">
            <div>
              <strong>Private journal sync</strong>
              <small>
                {syncUser
                  ? syncUser.email || "Signed in"
                  : "Optional email sign-in · browser fallback stays active"}
              </small>
            </div>
            {syncState === "unavailable" ? (
              <span className="sync-state caution">Not configured</span>
            ) : syncUser ? (
              <div className="sync-actions">
                <span className={`sync-state ${syncState === "error" ? "caution" : "positive"}`}>
                  {syncState === "syncing"
                    ? "Syncing"
                    : syncState === "error"
                      ? "Browser safe"
                      : "Synced"}
                </span>
                <button type="button" className="secondary-button" onClick={() => void signOut()}>
                  Sign out
                </button>
              </div>
            ) : (
              <div className="sync-sign-in">
                <input
                  aria-label="Journal sync email"
                  type="email"
                  autoComplete="email"
                  value={syncEmail}
                  onChange={(event) => setSyncEmail(event.target.value)}
                  placeholder="you@example.com"
                />
                <button
                  type="button"
                  className="secondary-button"
                  disabled={!syncEmail.trim() || syncState === "sending"}
                  onClick={() => void requestMagicLink()}
                >
                  {syncState === "sending" ? "Sending…" : "Email sign-in link"}
                </button>
              </div>
            )}
            {syncMessage ? (
              <p className="sync-message" aria-live="polite">
                {syncMessage}
              </p>
            ) : null}
          </div>
        </article>

        <div
          className="checklist-list"
          role="list"
          aria-label="Daily checklist items"
        >
          {dailyChecklistItems.map((item, index) => {
            const isChecked = completedSet.has(item);
            return (
              <label
                className={`checklist-item ${isChecked ? "checked" : ""}`}
                key={item}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleItem(item)}
                />
                <span className="custom-checkbox" aria-hidden="true">
                  {isChecked ? "✓" : String(index + 1).padStart(2, "0")}
                </span>
                <span className="checklist-label">{item}</span>
                <span className="checklist-state">
                  {isChecked ? "Checked" : "Pending"}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="workflow-history">
        <div className="workflow-history-heading">
          <div>
            <span className="section-kicker">Decision journal</span>
            <h4>Saved daily records</h4>
          </div>
          <span>{journal.records.length} records</span>
        </div>
        {journal.records.length ? (
          <div
            className="workflow-history-table"
            role="table"
            aria-label="Saved daily decision history"
          >
            <div
              className="workflow-history-row workflow-history-header"
              role="row"
            >
              <span>Date / Symbol</span>
              <span>Decision</span>
              <span>Checklist</span>
              <span>Reference</span>
              <span>Outcome</span>
            </div>
            {journal.records.slice(0, 20).map((record) => {
              const result = outcome(record);
              return (
                <div
                  className="workflow-history-row"
                  role="row"
                  key={`${record.date}:${record.symbol}`}
                >
                  <span>
                    <strong>{record.date}</strong>
                    <small>{record.symbol}</small>
                  </span>
                  <span>{record.decision}</span>
                  <span>
                    {record.checkedItems.length}/{dailyChecklistItems.length}
                  </span>
                  <span>
                    {record.referencePrice?.toFixed(2) ?? "—"}
                    <small>{record.marketAsOf ?? "No market snapshot"}</small>
                  </span>
                  <span
                    className={
                      result === null
                        ? undefined
                        : result >= 0
                          ? "positive"
                          : "caution"
                    }
                  >
                    {result === null
                      ? "—"
                      : `${result >= 0 ? "+" : ""}${result.toFixed(2)}%`}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="workflow-empty">No saved daily records yet.</p>
        )}
      </div>
    </>
  );
}

// จัดทำโดย: นายฐิติ เทอดพิทักษ์พงษ์ โดยใช้เทคโนโลยี AI จาก OpenAI · © 2026 Thiti Theadphitukphong · All Rights Reserved.
