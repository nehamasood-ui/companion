"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, ArrowLeft } from "lucide-react";
import type { Plan } from "@/lib/types";
import { useCompanion } from "@/lib/store";
import { parseIntent } from "@/lib/intent";
import { useTheater } from "@/lib/useTheater";
import { buildTheaterSteps, THEATER_STEPS } from "@/lib/theater";
import { StepTicker } from "./StepTicker";
import { StylizedMap } from "./StylizedMap";
import { PlanHeader } from "@/components/experience/PlanHeader";
import { Timeline } from "@/components/experience/Timeline";
import { RefinementPanel } from "@/components/experience/RefinementPanel";
import { TravelSummary } from "@/components/experience/TravelSummary";
import { spring } from "@/lib/motion";

export function WorkflowTheater({ plan }: { plan: Plan }) {
  const intent = useCompanion((s) => s.intent);
  const request = useCompanion((s) => s.request);
  const refinementPulse = useCompanion((s) => s.refinementPulse);

  const { activeStep, completed, done, skip } = useTheater();
  const [activeId, setActiveId] = useState<string | null>(null);

  // Backfill intent for sessions persisted before intent parsing shipped.
  useEffect(() => {
    const { request, intent } = useCompanion.getState();
    if (request && !intent) {
      useCompanion.setState({ intent: parseIntent(request) });
    }
  }, []);

  const steps = useMemo(() => {
    if (intent && request) return buildTheaterSteps(intent, request.partySize);
    return THEATER_STEPS;
  }, [intent, request]);

  const phase = done ? 99 : activeStep;
  const showWeather = phase >= 1;
  const showPins = phase >= 2;
  const showRoute = phase >= 3;
  const showTimeline = phase >= 4 || done;

  return (
    <main className="grain relative flex min-h-[100dvh] flex-col">
      <div className="dawn-mesh animate-gradient-drift opacity-30" aria-hidden />

      {/* Top bar */}
      <div className="relative z-10 flex shrink-0 items-center justify-between px-4 py-3 sm:px-6">
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
      </div>

      {/* Unified workspace document */}
      <div className="relative z-10 mx-auto w-full max-w-6xl flex-1 px-3 pb-4 sm:px-5 sm:pb-6">
        <motion.div
          layout
          className={[
            "workspace-canvas overflow-hidden rounded-2xl border border-line bg-surface/95 shadow-lift backdrop-blur sm:rounded-3xl",
            refinementPulse ? "ring-2 ring-primary/20" : "",
          ].join(" ")}
          transition={spring.gentle}
        >
          <PlanHeader
            plan={plan}
            intent={intent}
            showWeather={showWeather}
            settled={done}
          />

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(280px,380px)] lg:items-stretch">
            {/* Timeline column — protagonist + refinement */}
            <div className="order-2 flex min-w-0 flex-col border-t border-line lg:order-1 lg:border-r lg:border-t-0">
              <div className="flex-1 px-3 py-3 sm:px-4 sm:py-3.5">
                <AnimatePresence mode="wait">
                  {!done ? (
                    <motion.div
                      key="ticker"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <StepTicker
                        steps={steps}
                        activeStep={activeStep}
                        completed={completed}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="timeline"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
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

              {done && (
                <div className="shrink-0 border-t border-line px-3 py-3 sm:px-4 sm:py-3.5">
                  <RefinementPanel />
                </div>
              )}
            </div>

            {/* Map column — ambient evidence */}
            <div className="order-1 flex flex-col border-t border-line p-3 sm:p-3.5 lg:order-2 lg:border-t-0">
              <div className="min-h-[200px] flex-1 sm:min-h-[240px] lg:min-h-[320px]">
                <StylizedMap
                  plan={plan}
                  showPins={showPins}
                  showRoute={showRoute}
                  activeId={activeId}
                />
              </div>
              <TravelSummary plan={plan} intent={intent} show={done} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Skip affordance during theater */}
      <AnimatePresence>
        {!done && (
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            onClick={skip}
            className="fixed bottom-5 left-1/2 z-20 inline-flex -translate-x-1/2 items-center gap-1 rounded-full border border-line bg-surface/95 px-4 py-2 text-sm font-medium text-ink-soft shadow-card backdrop-blur transition-colors hover:text-ink"
          >
            Skip to plan
            <ChevronRight className="h-4 w-4" strokeWidth={2} />
          </motion.button>
        )}
      </AnimatePresence>
    </main>
  );
}
