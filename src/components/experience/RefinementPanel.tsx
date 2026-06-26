"use client";

import { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, Sparkles } from "lucide-react";
import {
  REFINEMENT_CHIPS,
  useCompanion,
  type RefinementChip,
} from "@/lib/store";
import { spring } from "@/lib/motion";

/** The core interaction — refine the plan in natural language or quick tweaks. */
export function RefinementPanel() {
  const draft = useCompanion((s) => s.refinementDraft);
  const applied = useCompanion((s) => s.appliedRefinements);
  const setDraft = useCompanion((s) => s.setRefinementDraft);
  const toggleChip = useCompanion((s) => s.toggleRefinementChip);
  const submit = useCompanion((s) => s.submitRefinement);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...spring.gentle, delay: 0.15 }}
      aria-label="Refine your plan"
      className=""
    >
      <div className="flex items-center gap-2">
        <Sparkles className="h-3.5 w-3.5 text-primary" strokeWidth={2} aria-hidden />
        <h2 className="text-sm font-semibold text-ink">Refine your plan</h2>
      </div>
      <p className="mt-1 text-xs leading-relaxed text-muted">
        Tell Companion what to adjust — your group shapes the draft from here.
      </p>

      <div className="mt-2.5 rounded-2xl border border-line bg-bg/60 p-1.5 transition-colors focus-within:border-primary/30 focus-within:bg-surface">
        <textarea
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          rows={2}
          placeholder="Make it more walkable, swap dinner for sushi…"
          aria-label="Describe how to refine the plan"
          className="w-full resize-none bg-transparent px-2.5 py-2 text-sm leading-relaxed text-ink outline-none placeholder:text-muted/70"
        />
        <div className="flex items-center justify-between gap-2 px-1.5 pb-1">
          <div className="flex flex-wrap gap-1.5">
            {REFINEMENT_CHIPS.map((chip) => (
              <ChipButton
                key={chip}
                label={chip}
                active={applied.includes(chip)}
                onClick={() => toggleChip(chip as RefinementChip)}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={submit}
            disabled={!draft.trim()}
            aria-label="Apply refinement"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-white transition-colors hover:bg-primary-ink disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowUp className="h-4 w-4" strokeWidth={2.25} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {applied.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 flex flex-wrap items-center gap-1.5"
          >
            <span className="text-[11px] font-medium text-muted">Noted:</span>
            {applied.map((note) => (
              <span
                key={note}
                className="rounded-full border border-line bg-surface px-2 py-0.5 text-[11px] font-medium text-ink-soft"
              >
                {note}
              </span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}

function ChipButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={[
        "rounded-full px-2.5 py-1 text-xs font-medium transition-colors duration-200",
        "border outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        active
          ? "border-primary/35 bg-primary text-white"
          : "border-line bg-surface text-ink-soft hover:border-primary/25 hover:text-ink",
      ].join(" ")}
    >
      {label}
    </button>
  );
}
