"use client";

import { useMemo, useState } from "react";
import { buildMonthlyBulletPlan } from "../lib/v2-strategy";

const formatThb = (value: number) => new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 2 }).format(value);

export default function ThbBudgetPlanner() {
  const [input, setInput] = useState("10000");
  const budget = Number(input);
  const plan = useMemo(() => Number.isFinite(budget) && budget >= 0 ? buildMonthlyBulletPlan(budget) : [], [budget]);

  return (
    <div className="thb-budget-planner" aria-label="Monthly THB budget planner">
      <div className="budget-planner-toolbar">
        <label htmlFor="monthly-budget">Monthly budget (THB)</label>
        <input id="monthly-budget" inputMode="decimal" min="0" step="100" type="number" value={input} onChange={(event) => setInput(event.target.value)} />
      </div>
      {plan.length ? <div className="budget-breakdown" role="list" aria-label="THB monthly bullet amounts">
        {plan.map((bullet, index) => <div className="budget-breakdown-row" key={bullet.id} role="listitem"><span>0{index + 1} · {bullet.label}</span><strong>{formatThb(bullet.amount)}</strong><small>{bullet.budgetShare}% · reserve only until a buy decision is confirmed</small></div>)}
        <div className="budget-total"><span>Total planned</span><strong>{formatThb(plan.reduce((sum, item) => sum + item.amount, 0))}</strong></div>
      </div> : <p className="budget-error">Enter a non-negative THB budget.</p>}
    </div>
  );
}

// จัดทำโดย: นายฐิติ เทอดพิทักษ์พงษ์ โดยใช้ OpenAI Codex | © 2026 Thiti Theadphitukphong · All Rights Reserved.
