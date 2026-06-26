"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import type { TheaterStep } from "@/lib/theater";
import { spring } from "@/lib/motion";

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
    <div className="flex flex-col gap-1">
      {steps.map((step, i) => {
        const isDone = completed > i;
        const isActive = !isDone && activeStep === i;
        const isPending = !isDone && !isActive;

        return (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: isPending ? 0.4 : 1, y: 0 }}
            transition={{ ...spring.gentle, delay: i * 0.03 }}
            className="flex items-center gap-2.5 rounded-xl px-2.5 py-2"
            style={{
              background: isActive ? "rgba(91,87,214,0.06)" : "transparent",
            }}
          >
            <span className="relative flex h-6 w-6 shrink-0 items-center justify-center">
              <AnimatePresence mode="wait" initial={false}>
                {isDone ? (
                  <motion.span
                    key="done"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.25 }}
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white"
                  >
                    <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                  </motion.span>
                ) : isActive ? (
                  <motion.span
                    key="active"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="relative flex h-6 w-6 items-center justify-center rounded-full border border-primary/30 bg-surface text-primary"
                  >
                    <span className="absolute inset-1 rounded-full bg-primary/15 animate-pulse-soft" />
                    <step.icon className="relative h-3 w-3" strokeWidth={1.75} />
                  </motion.span>
                ) : (
                  <motion.span
                    key="pending"
                    className="flex h-6 w-6 items-center justify-center rounded-full border border-line bg-surface text-muted"
                  >
                    <step.icon className="h-3 w-3" strokeWidth={1.75} />
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
