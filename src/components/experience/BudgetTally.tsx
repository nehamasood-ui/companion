"use client";

import { motion } from "framer-motion";
import type { Plan } from "@/lib/types";
import { totalSpend } from "@/data/sf";
import { spring } from "@/lib/motion";

export function BudgetTally({
  plan,
  show = true,
  budgetCap,
}: {
  plan: Plan;
  show?: boolean;
  /** When parsed from the prompt, use this cap instead of the plan default. */
  budgetCap?: number;
}) {
  const spent = totalSpend(plan);
  const cap = budgetCap ?? plan.budgetPerPerson;
  const ratio = Math.min(1, spent / cap);
  const over = spent > cap;
  const near = !over && ratio > 0.85;

  const color = over ? "#DC2626" : near ? "#D97706" : "#0EA5A4";

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">
          Per person
        </span>
        <span className="text-sm font-semibold tabular-nums" style={{ color }}>
          {plan.currency}
          {spent}
          <span className="font-normal text-muted">
            {" "}
            / {plan.currency}
            {cap}
          </span>
        </span>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-line">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: show ? `${Math.min(100, ratio * 100)}%` : 0 }}
          transition={{ ...spring.gentle, delay: 0.15 }}
        />
      </div>
    </div>
  );
}
