"use client";

import { useMemo, useState } from "react";
import { useEffect } from "react";

const checklistItems = [
  "Nasdaq",
  "VIX",
  "Bond Yield",
  "DXY",
  "Earnings",
  "RSI",
  "MACD",
  "Buy Zone",
];

export default function DailyChecklist() {
  const todayKey = new Date().toISOString().slice(0, 10);
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [decision, setDecision] = useState("Not decided");
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const savedState = JSON.parse(localStorage.getItem("dynamic-buy-checklist-v1") || "null") as { date?: string; checkedItems?: string[] } | null;
        const savedDecision = JSON.parse(localStorage.getItem("dynamic-buy-decision-v1") || "null") as { date?: string; decision?: string; note?: string } | null;
        if (savedState?.date === todayKey) setCheckedItems(savedState.checkedItems || []);
        if (savedDecision?.date === todayKey) { setDecision(savedDecision.decision || "Not decided"); setNote(savedDecision.note || ""); }
      } catch { /* Ignore malformed local browser state. */ }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [todayKey]);

  useEffect(() => {
    localStorage.setItem("dynamic-buy-checklist-v1", JSON.stringify({ date: todayKey, checkedItems }));
  }, [checkedItems, todayKey]);
  const completedCount = checkedItems.length;
  const progress = Math.round((completedCount / checklistItems.length) * 100);
  const status = completedCount === checklistItems.length ? "Ready" : "In progress";

  const completedSet = useMemo(() => new Set(checkedItems), [checkedItems]);

  function toggleItem(item: string) {
    setCheckedItems((current) =>
      current.includes(item) ? current.filter((entry) => entry !== item) : [...current, item],
    );
  }

  function saveDecision() {
    localStorage.setItem("dynamic-buy-decision-v1", JSON.stringify({ date: todayKey, decision, note, savedAt: new Date().toISOString() }));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  }

  return (
    <div className="checklist-layout">
      <article className="checklist-summary">
        <div className="score-card-header"><span>Today&apos;s review</span><span className="score-date">STATIC MODE</span></div>
        <div className="checklist-progress-number">{completedCount}<span>/{checklistItems.length}</span></div>
        <p>ตรวจสัญญาณสำคัญก่อนตัดสินใจตาม Buy Zone ของวัน</p>
        <div className="score-meter"><span style={{ width: `${progress}%` }} /></div>
        <div className="checklist-summary-footer"><span>{progress}% complete</span><strong className={status === "Ready" ? "positive" : "caution"}>{status}</strong></div>
        <div className="decision-form"><label>Today&apos;s decision<select value={decision} onChange={(event) => setDecision(event.target.value)}><option>Not decided</option><option>Buy</option><option>Wait</option><option>Watch</option></select></label><label>Note<textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Why this decision?" rows={3} /></label><button type="button" onClick={saveDecision}>{saved ? "Saved" : "Save decision"}</button></div>
      </article>

      <div className="checklist-list" role="list" aria-label="Daily checklist items">
        {checklistItems.map((item, index) => {
          const isChecked = completedSet.has(item);
          return (
            <label className={`checklist-item ${isChecked ? "checked" : ""}`} key={item}>
              <input type="checkbox" checked={isChecked} onChange={() => toggleItem(item)} />
              <span className="custom-checkbox" aria-hidden="true">{isChecked ? "✓" : String(index + 1).padStart(2, "0")}</span>
              <span className="checklist-label">{item}</span>
              <span className="checklist-state">{isChecked ? "Checked" : "Pending"}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

