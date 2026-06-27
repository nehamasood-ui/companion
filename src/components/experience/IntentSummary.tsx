"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import type { ParsedIntent } from "@/lib/types";
import { spring } from "@/lib/motion";

/** Surfaces what Companion understood from the user's prompt. */
export function IntentSummary({
  intent,
  show,
}: {
  intent: ParsedIntent;
  show: boolean;
}) {
  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      transition={spring.gentle}
      className="border-t border-line pt-3"
    >
      <div className="flex items-start gap-2">
        <Sparkles
          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary"
          strokeWidth={2}
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
            Understood from your prompt
          </p>
          <p className="mt-1 text-sm leading-snug text-ink-soft">
            &ldquo;{intent.promptExcerpt}&rdquo;
          </p>
          {intent.constraints.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {intent.constraints.map((c) => (
                <span
                  key={c.id}
                  className="inline-flex items-center rounded-full border border-primary/20 bg-primary-soft/80 px-2.5 py-0.5 text-xs font-medium text-primary-ink"
                >
                  {c.label}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
