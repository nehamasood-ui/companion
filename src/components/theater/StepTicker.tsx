"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import type { TheaterStep } from "@/lib/theater";
import { spring } from "@/lib/motion";

// The visible "multiple AI systems working together" sequence. Lives at the
// top of the canvas during the theater and fades away on settle. Steps are
// passed in so the copy can reflect the user's detected intent.
export function StepTicker({
  steps,
  activeStep,
  completed,
}: {
  steps: TheaterStep[];
  activeStep: number;
  completed: number;
}) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-1.5">
      {steps.map((step, i) => {
        const isDone = completed > i;
        const isActive = !isDone && activeStep === i;
        const isPending = !isDone && !isActive;

        return (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{
              opacity: isPending ? 0.35 : 1,
              y: 0,
            }}
            transition={{ ...spring.gentle, delay: i * 0.04 }}
            className="flex items-center gap-3 rounded-2xl px-3 py-2.5"
            style={{
              background: isActive ? "rgba(91,87,214,0.06)" : "transparent",
            }}
          >
            <span className="relative flex h-7 w-7 shrink-0 items-center justify-center">
              <AnimatePresence mode="wait" initial={false}>
                {isDone ? (
                  <motion.span
                    key="done"
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={spring.settle}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white"
                  >
                    <Check className="h-4 w-4" strokeWidth={2.5} />
                  </motion.span>
                ) : isActive ? (
                  <motion.span
                    key="active"
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-primary/30 bg-surface text-primary"
                  >
                    <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.25} />
                  </motion.span>
                ) : (
                  <motion.span
                    key="pending"
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-line bg-surface text-muted"
                  >
                    <step.icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                  </motion.span>
                )}
              </AnimatePresence>
            </span>

            <div className="min-w-0 flex-1 text-left">
              <div
                className={[
                  "truncate text-sm font-medium transition-colors",
                  isPending ? "text-muted" : "text-ink",
                ].join(" ")}
              >
                {step.label}
              </div>
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="truncate text-xs text-ink-soft"
                  >
                    {step.detail}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
