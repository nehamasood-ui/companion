"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Wand2, ArrowUp, X, RotateCcw } from "lucide-react";
import { spring } from "@/lib/motion";

export interface Whisper {
  text: string;
  matched: boolean;
  /** Changes on every refine so a repeat message still re-animates. */
  key: number;
}

// The home of the iteration loop: refine the plan in natural language. The chips
// are suggested prompts that double as guardrails for what the demo understands.
const SUGGESTIONS = [
  "Make it more walkable",
  "Replace painting with pottery",
  "Swap dinner for sushi",
  "Add a brunch stop",
  "Keep it under $50",
];

export function RefinementBar({
  onRefine,
  whisper,
  onDismissWhisper,
  dirty,
  onReset,
}: {
  onRefine: (prompt: string) => void;
  whisper: Whisper | null;
  onDismissWhisper: () => void;
  dirty: boolean;
  onReset: () => void;
}) {
  const [value, setValue] = useState("");

  const submit = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onRefine(trimmed);
    setValue("");
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit(value);
    }
  };

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
        <AnimatePresence>
          {dirty && (
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onReset}
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium text-muted transition-colors hover:text-ink"
            >
              <RotateCcw className="h-3 w-3" strokeWidth={2} />
              Reset
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* AI whisper — a calm one-line response to the last refinement. */}
      <AnimatePresence mode="wait">
        {whisper && (
          <motion.div
            key={whisper.key}
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={spring.gentle}
            className="overflow-hidden"
          >
            <div
              className={[
                "mb-2.5 flex items-start gap-2 rounded-xl px-3 py-2 text-xs leading-relaxed",
                whisper.matched
                  ? "bg-primary-soft/70 text-primary-ink"
                  : "bg-sunset-soft text-ink-soft",
              ].join(" ")}
            >
              <span className="mt-px shrink-0">✦</span>
              <p className="flex-1">{whisper.text}</p>
              <button
                type="button"
                aria-label="Dismiss"
                onClick={onDismissWhisper}
                className="shrink-0 text-muted transition-colors hover:text-ink"
              >
                <X className="h-3.5 w-3.5" strokeWidth={2} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* The functional input. */}
      <div className="flex items-center gap-2 rounded-xl border border-line bg-bg/60 px-3 py-2 focus-within:border-primary/40">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Tell Companion how to evolve the day…"
          aria-label="Refine the plan"
          className="flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-muted"
        />
        <button
          type="button"
          aria-label="Apply refinement"
          onClick={() => submit(value)}
          disabled={!value.trim()}
          className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-white transition-opacity disabled:opacity-40"
        >
          <ArrowUp className="h-4 w-4" strokeWidth={2.25} />
        </button>
      </div>

      {/* Suggested prompts — tap to apply instantly. */}
      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => submit(s)}
            className="rounded-full border border-line bg-surface px-2.5 py-1 text-xs font-medium text-ink-soft transition-colors hover:border-primary/30 hover:text-ink"
          >
            {s}
          </button>
        ))}
      </div>
    </section>
  );
}
