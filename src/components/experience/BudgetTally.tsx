"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { Plan } from "@/lib/types";
import { totalSpend } from "@/data/sf";
import { useCompanion } from "@/lib/store";
import { spring } from "@/lib/motion";

export function BudgetTally({
  plan,
  show = true,
}: {
  plan: Plan;
  show?: boolean;
}) {
  const userBudgetCap = useCompanion((s) => s.userBudgetCap);
  const setUserBudgetCap = useCompanion((s) => s.setUserBudgetCap);
  const [draft, setDraft] = useState(String(userBudgetCap));

  useEffect(() => {
    setDraft(String(userBudgetCap));
  }, [userBudgetCap]);

  const spent = totalSpend(plan);
  const cap = userBudgetCap;
  const ratio = cap > 0 ? Math.min(1, spent / cap) : 0;
  const over = spent > cap;
  const near = !over && ratio > 0.85;
  const color = over ? "#DC2626" : near ? "#D97706" : "#0EA5A4";

  const commitBudget = () => {
    const n = parseInt(draft, 10);
    if (!Number.isNaN(n)) setUserBudgetCap(n);
    else setDraft(String(userBudgetCap));
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <label
          htmlFor="budget-cap"
          className="text-[11px] font-semibold uppercase tracking-wider text-muted"
        >
          Budget per person
        </label>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-line bg-surface px-2 py-1 focus-within:border-primary/35">
            <span className="text-sm text-muted">{plan.currency}</span>
            <input
              id="budget-cap"
              type="number"
              min={20}
              max={500}
              step={5}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commitBudget}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  commitBudget();
                }
              }}
              className="w-14 bg-transparent text-right text-sm font-semibold tabular-nums text-ink outline-none"
              aria-label="Budget per person"
            />
          </div>
          <span className="text-sm font-semibold tabular-nums" style={{ color }}>
            {plan.currency}
            {spent}
            <span className="font-normal text-muted"> spent</span>
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 text-[11px] text-muted">
        <span>
          {over
            ? `${plan.currency}${spent - cap} over your budget`
            : `${plan.currency}${cap - spent} remaining`}
        </span>
        <span>
          {Math.round(ratio * 100)}% of {plan.currency}
          {cap}
        </span>
      </div>

      <div className="h-1 w-full overflow-hidden rounded-full bg-line">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: show ? `${Math.min(100, ratio * 100)}%` : 0 }}
          transition={{ ...spring.gentle, delay: 0.1 }}
        />
      </div>
    </div>
  );
}
