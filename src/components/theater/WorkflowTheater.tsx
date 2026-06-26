"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, ArrowLeft } from "lucide-react";
import type { Plan, TimelineItem } from "@/lib/types";
import { useTheater } from "@/lib/useTheater";
import { resequence } from "@/lib/schedule";
import { StepTicker } from "./StepTicker";
import { StylizedMap } from "./StylizedMap";
import { PlanHeader } from "@/components/experience/PlanHeader";
import { Timeline } from "@/components/experience/Timeline";
import { RefinementBar } from "@/components/experience/RefinementBar";
import { ExportBar } from "@/components/experience/ExportBar";
import { spring } from "@/lib/motion";

// Orchestrates the reveal: the AI workflow checklist plays on the left while the
// map fills with pins and a route on the right; then the checklist cross-fades
// into the real itinerary. The reveal is a settle, not a cut.
export function WorkflowTheater({ plan }: { plan: Plan }) {
  const { activeStep, completed, done, skip } = useTheater();
  const [activeId, setActiveId] = useState<string | null>(null);

  // The user's working order of the day. Drag-to-reorder mutates this; the map
  // and the schedule recompute from it. We re-sync only when the plan itself
  // changes (e.g. a fresh generation), never on every render.
  const [order, setOrder] = useState<TimelineItem[]>(plan.items);
  useEffect(() => setOrder(plan.items), [plan.id, plan.items]);

  const dayStart = plan.items[0]?.start ?? "10:00";
  const display = useMemo(() => resequence(order, dayStart), [order, dayStart]);
  const orderedPlan = useMemo<Plan>(
    () => ({ ...plan, items: display }),
    [plan, display],
  );

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

      <div className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-16 sm:px-6">
        <PlanHeader plan={orderedPlan} showWeather={showWeather} settled={done} />

        <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-[1fr_minmax(0,420px)]">
          {/* Left column: the plan, then the ways to evolve and use it. */}
          <div className="order-2 flex flex-col gap-3 lg:order-1">
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
                    items={order}
                    display={display}
                    show={showTimeline}
                    activeId={activeId}
                    onHover={setActiveId}
                    onReorder={setOrder}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right: the map assembles throughout and stays ambient. */}
          <div className="order-1 lg:order-2">
            <div className="sticky top-3 h-[280px] sm:h-[360px] lg:h-[440px]">
              <StylizedMap
                plan={orderedPlan}
                showPins={showPins}
                showRoute={showRoute}
                activeId={activeId}
                onHover={setActiveId}
              />
            </div>
          </div>
        </div>

        {/* Evolve-and-use zone: spans the full workspace once the plan settles. */}
        <AnimatePresence>
          {done && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring.gentle, delay: 0.5 }}
              className="mt-3 flex flex-col gap-3"
            >
              <RefinementBar />
              <ExportBar />
            </motion.div>
          )}
        </AnimatePresence>
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
    </main>
  );
}
