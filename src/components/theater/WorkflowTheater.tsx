"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, ArrowLeft } from "lucide-react";
import type { Plan } from "@/lib/types";
import { useTheater } from "@/lib/useTheater";
import { StepTicker } from "./StepTicker";
import { StylizedMap } from "./StylizedMap";
import { PlanHeader } from "@/components/experience/PlanHeader";
import { Timeline } from "@/components/experience/Timeline";
import { spring } from "@/lib/motion";

// Orchestrates the reveal: the AI workflow checklist plays on the left while the
// map fills with pins and a route on the right; then the checklist cross-fades
// into the real itinerary. The reveal is a settle, not a cut.
export function WorkflowTheater({ plan }: { plan: Plan }) {
  const { activeStep, completed, done, skip } = useTheater();
  const [activeId, setActiveId] = useState<string | null>(null);

  const phase = done ? 99 : activeStep;
  const showWeather = phase >= 1;
  const showPins = phase >= 2;
  const showRoute = phase >= 3;
  const showTimeline = phase >= 4 || done;

  return (
    <main className="grain relative min-h-[100dvh] overflow-hidden">
      <div className="dawn-mesh animate-gradient-drift opacity-40" aria-hidden />

      {/* Top bar */}
      <header className="relative z-10 flex items-center justify-between px-5 py-4 sm:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} />
          New plan
        </Link>
        <div className="flex items-center gap-2 text-sm font-semibold tracking-tight text-ink">
          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-primary text-[11px] text-white">
            ◆
          </span>
          Companion
        </div>
      </header>

      <div className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-24 sm:px-6">
        <PlanHeader plan={plan} showWeather={showWeather} settled={done} />

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_minmax(0,440px)]">
          {/* Left: checklist → itinerary */}
          <div className="order-2 lg:order-1">
            <AnimatePresence mode="wait">
              {!done ? (
                <motion.div
                  key="ticker"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4 }}
                  className="rounded-3xl border border-line bg-surface/70 p-4 shadow-card backdrop-blur sm:p-6"
                >
                  <StepTicker activeStep={activeStep} completed={completed} />
                </motion.div>
              ) : (
                <motion.div
                  key="timeline"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={spring.gentle}
                >
                  <Timeline
                    plan={plan}
                    show={showTimeline}
                    activeId={activeId}
                    onHover={setActiveId}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right: the map assembles throughout */}
          <div className="order-1 lg:order-2">
            <div className="sticky top-4 h-[300px] sm:h-[380px] lg:h-[460px]">
              <StylizedMap
                plan={plan}
                showPins={showPins}
                showRoute={showRoute}
                activeId={activeId}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Skip affordance during the theater */}
      <AnimatePresence>
        {!done && (
          <motion.button
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            onClick={skip}
            className="fixed bottom-6 left-1/2 z-20 inline-flex -translate-x-1/2 items-center gap-1 rounded-full border border-line bg-surface/90 px-4 py-2 text-sm font-medium text-ink-soft shadow-lift backdrop-blur transition-colors hover:text-ink"
          >
            Skip to plan
            <ChevronRight className="h-4 w-4" strokeWidth={2} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Settled footer */}
      <AnimatePresence>
        {done && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring.gentle, delay: 0.6 }}
            className="fixed bottom-5 left-1/2 z-20 -translate-x-1/2"
          >
            <div className="flex items-center gap-2 rounded-full border border-line bg-surface/90 px-2 py-2 pl-4 shadow-lift backdrop-blur">
              <span className="text-sm text-ink-soft">Make it more…</span>
              {["Chill", "Adventurous", "Foodie", "Cheaper"].map((label) => (
                <span
                  key={label}
                  className="cursor-default rounded-full border border-line bg-bg px-3 py-1 text-xs font-medium text-muted"
                  title="Coming next"
                >
                  {label}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
