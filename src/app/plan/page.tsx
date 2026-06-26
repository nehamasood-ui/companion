"use client";

import { useEffect, useState } from "react";
import { useCompanion } from "@/lib/store";
import { sfPlan } from "@/data/sf";
import { WorkflowTheater } from "@/components/theater/WorkflowTheater";
import type { Plan } from "@/lib/types";

export default function PlanPage() {
  const storedPlan = useCompanion((s) => s.plan);
  const storedIntents = useCompanion((s) => s.intents);
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch from the persisted store, and never dead-end:
  // if someone lands here directly, fall back to the curated showcase plan.
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <main className="min-h-[100dvh] bg-bg" aria-hidden />;
  }

  const plan: Plan = storedPlan ?? sfPlan;
  return <WorkflowTheater plan={plan} intents={storedIntents ?? []} />;
}
