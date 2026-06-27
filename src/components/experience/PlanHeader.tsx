"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Calendar } from "lucide-react";
import type { Plan, ParsedIntent } from "@/lib/types";
import { PartyAvatars, VibeTags } from "./PartyAvatars";
import { BudgetTally } from "./BudgetTally";
import { IntentSummary } from "./IntentSummary";
import { WeatherChip } from "@/components/theater/WeatherChip";
import { spring } from "@/lib/motion";

export function PlanHeader({
  plan,
  intent,
  showWeather,
  settled,
}: {
  plan: Plan;
  intent: ParsedIntent | null;
  showWeather: boolean;
  settled: boolean;
}) {
  return (
    <header className="shrink-0 border-b border-line px-4 py-3.5 sm:px-5 sm:py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <AnimatePresence mode="wait">
            {settled ? (
              <motion.h1
                key="title"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={spring.gentle}
                className="text-title font-semibold tracking-tight text-ink"
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

          <div className="mt-1 flex items-center gap-1.5 text-sm text-ink-soft">
            <Calendar className="h-3.5 w-3.5 text-muted" strokeWidth={1.75} />
            {plan.dateLabel} · {plan.city}
          </div>

          <div className="mt-2">
            <VibeTags vibes={plan.vibes} show />
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          <WeatherChip
            tempF={plan.weather.tempF}
            summary={plan.weather.summary}
            show={showWeather}
          />
          <div className="flex items-center gap-1.5">
            <PartyAvatars people={plan.collaborators} size={28} />
            <span className="text-sm font-medium tabular-nums text-ink-soft">
              {plan.partySize}
            </span>
          </div>
        </div>
      </div>

      {intent && <IntentSummary intent={intent} show={settled} />}

      <AnimatePresence>
        {settled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className={intent ? "mt-3 border-t border-line pt-3" : "mt-3"}
          >
            <BudgetTally plan={plan} show={settled} />
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
