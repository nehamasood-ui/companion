"use client";

import { motion } from "framer-motion";
import type { Plan } from "@/lib/types";
import { totalSpend } from "@/data/sf";
import { spring } from "@/lib/motion";

// Live budget read-out. Turns amber as it nears the cap and red if it spills
// over — turning the "over budget" edge case into a visible feature.
export function BudgetTally({ plan, show = true }: { plan: Plan; show?: boolean }) {
  const spent = totalSpend(plan);
  const ratio = Math.min(1, spent / plan.budgetPerPerson);
  const over = spent > plan.budgetPerPerson;
  const near = !over && ratio > 0.85;

  const color = over ? "#DC2626" : near ? "#D97706" : "#0EA5A4";

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-xs font-medium uppercase tracking-wide text-muted">
          Per person
        </span>
        <span className="text-sm font-semibold tabular-nums" style={{ color }}>
          {plan.currency}
          {spent}
          <span className="font-normal text-muted"> / {plan.currency}{plan.budgetPerPerson}</span>
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: show ? `${ratio * 100}%` : 0 }}
          transition={{ ...spring.gentle, delay: 0.2 }}
        />
      </div>
    </div>
  );
}
