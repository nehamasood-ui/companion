"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, ArrowLeft } from "lucide-react";
import type { Plan, TimelineItem } from "@/lib/types";
import { useTheater } from "@/lib/useTheater";
import { resequence } from "@/lib/schedule";
import { applyRefinement } from "@/lib/refine";
import { StepTicker } from "./StepTicker";
import { StylizedMap } from "./StylizedMap";
import { PlanHeader } from "@/components/experience/PlanHeader";
import { Timeline } from "@/components/experience/Timeline";
import { RefinementBar, type Whisper } from "@/components/experience/RefinementBar";
import { ExportBar } from "@/components/experience/ExportBar";
import { spring } from "@/lib/motion";

// Orchestrates the reveal: the AI workflow checklist plays on the left while the
// map fills with pins and a route on the right; then the checklist cross-fades
// into the real itinerary. From there it's a living workspace — reorder and
// natural-language refinements mutate a working copy of the plan in place.
export function WorkflowTheater({ plan }: { plan: Plan }) {
  const { activeStep, completed, done, skip } = useTheater();
  const [activeId, setActiveId] = useState<string | null>(null);

  // A working copy of the plan. Drag-to-reorder and refinements mutate this; the
  // map, timeline, and budget all recompute from it. We re-sync only when the
  // underlying plan changes (e.g. a fresh generation), never on every render.
  const [workPlan, setWorkPlan] = useState<Plan>(plan);
  const [dirty, setDirty] = useState(false);
  // Items touched by the last refinement, so the timeline can flag them as
  // freshly revised. Bumping `key` re-triggers the highlight even on a repeat.
  const [revised, setRevised] = useState<{ ids: string[]; entering: string[]; key: number }>({
    ids: [],
    entering: [],
    key: 0,
  });
  const [whisper, setWhisper] = useState<Whisper | null>(null);
  const revisedTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    // Resync only when a genuinely new plan arrives — never on in-place edits,
    // which would wipe the user's refinements.
    setWorkPlan(plan);
    setDirty(false);
    setWhisper(null);
    setRevised({ ids: [], entering: [], key: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan.id]);

  const dayStart = plan.items[0]?.start ?? "10:00";
  const display = useMemo(
    () => resequence(workPlan.items, dayStart),
    [workPlan.items, dayStart],
  );
  const orderedPlan = useMemo<Plan>(
    () => ({ ...workPlan, items: display }),
    [workPlan, display],
  );

  const handleReorder = (items: TimelineItem[]) => {
    setWorkPlan((p) => ({ ...p, items }));
    setDirty(true);
  };

  const handleRefine = (prompt: string) => {
    const result = applyRefinement(workPlan, prompt);
    setWhisper({ text: result.summary, matched: result.matched, key: Date.now() });
    if (!result.matched) return;
    setWorkPlan(result.plan);
    setDirty(true);
    setRevised((r) => ({ ids: result.changedIds, entering: result.enteringIds, key: r.key + 1 }));
    clearTimeout(revisedTimer.current);
    revisedTimer.current = setTimeout(
      () => setRevised((r) => ({ ...r, ids: [], entering: [] })),
      2200,
    );
  };

  const handleReset = () => {
    clearTimeout(revisedTimer.current);
    setWorkPlan(plan);
    setDirty(false);
    setWhisper(null);
    setRevised({ ids: [], entering: [], key: 0 });
  };

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
                    items={workPlan.items}
                    display={display}
                    show={showTimeline}
                    activeId={activeId}
                    onHover={setActiveId}
                    onReorder={handleReorder}
                    revisedIds={revised.ids}
                    enteringIds={revised.entering}
                    revisionKey={revised.key}
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
              <RefinementBar
                onRefine={handleRefine}
                whisper={whisper}
                onDismissWhisper={() => setWhisper(null)}
                dirty={dirty}
                onReset={handleReset}
              />
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
