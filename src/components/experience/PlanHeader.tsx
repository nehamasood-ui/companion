"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Calendar } from "lucide-react";
import type { Plan } from "@/lib/types";
import { PartyAvatars, VibeTags } from "./PartyAvatars";
import { BudgetTally } from "./BudgetTally";
import { WeatherChip } from "@/components/theater/WeatherChip";
import { spring } from "@/lib/motion";

export function PlanHeader({
  plan,
  showWeather,
  settled,
}: {
  plan: Plan;
  showWeather: boolean;
  settled: boolean;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-line bg-surface/70 p-4 shadow-card backdrop-blur sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          {/* Title fades in only once the plan has settled. */}
          <AnimatePresence mode="wait">
            {settled ? (
              <motion.h1
                key="title"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={spring.gentle}
                className="text-title font-semibold text-ink"
              >
                {plan.title}
              </motion.h1>
            ) : (
              <motion.div
                key="building"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-title font-semibold text-muted"
              >
                Designing your day…
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-1.5 flex items-center gap-2 text-sm text-ink-soft">
            <Calendar className="h-4 w-4 text-muted" strokeWidth={1.75} />
            {plan.dateLabel} · {plan.city}
          </div>

          <div className="mt-3">
            <VibeTags vibes={plan.vibes} show />
          </div>
        </div>

        <div className="flex flex-col items-end gap-3">
          <WeatherChip tempF={plan.weather.tempF} summary={plan.weather.summary} show={showWeather} />
          <div className="flex items-center gap-2">
            <PartyAvatars people={plan.collaborators} />
            <span className="text-sm font-medium text-ink-soft">{plan.partySize}</span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {settled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="border-t border-line pt-4"
          >
            <BudgetTally plan={plan} show={settled} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
