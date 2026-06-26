"use client";

import { Wand2, ArrowUp } from "lucide-react";

// The home of the iteration loop: refine the plan in natural language, with the
// chips as suggested prompts. Inert in this milestone (M1) — it establishes the
// slot and the feel; M2 wires the partial-update behavior behind it.
const SUGGESTIONS = [
  "Replace painting with pottery",
  "Add a brunch stop",
  "Make it more scenic",
  "Swap dinner for sushi",
  "Keep it under $50",
];

export function RefinementBar() {
  return (
    <section
      aria-label="Refine your plan"
      className="rounded-2xl border border-line bg-surface p-3.5 shadow-card"
    >
      <div className="mb-2.5 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
          <Wand2 className="h-3.5 w-3.5 text-primary" strokeWidth={2} />
          Refine the plan
        </span>
        <span className="rounded-full border border-line bg-bg px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted">
          Preview
        </span>
      </div>

      {/* Input affordance — looks real, intentionally inert for now. */}
      <div className="flex items-center gap-2 rounded-xl border border-line bg-bg/60 px-3 py-2.5">
        <span className="flex-1 truncate text-sm text-muted">
          Tell Companion how to evolve the day…
        </span>
        <span
          className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/40 text-white"
          aria-hidden
        >
          <ArrowUp className="h-4 w-4" strokeWidth={2.25} />
        </span>
      </div>

      {/* Suggested prompts double as guardrails for what the demo can do. */}
      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        {SUGGESTIONS.map((s) => (
          <span
            key={s}
            title="Coming next"
            className="cursor-default rounded-full border border-line bg-surface px-2.5 py-1 text-xs font-medium text-ink-soft"
          >
            {s}
          </span>
        ))}
      </div>
    </section>
  );
}
