"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Plan, PlanRequest } from "./types";
import { generatePlan, type DetectedIntent } from "./generate";

interface CompanionState {
  request: PlanRequest | null;
  plan: Plan | null;
  /** Intents detected from the prompt, folded into the first draft. */
  intents: DetectedIntent[];
  /** Submit the landing prompt and (in demo mode) materialize the plan. */
  submitRequest: (request: PlanRequest) => void;
  reset: () => void;
}

export const useCompanion = create<CompanionState>()(
  persist(
    (set) => ({
      request: null,
      plan: null,
      intents: [],
      submitRequest: (request) => {
        // Demo mode: compose the curated plan from the request's detected intent
        // so the first draft already reflects what the user asked for.
        const { plan, intents } = generatePlan(request);
        set({ request, plan, intents });
      },
      reset: () => set({ request: null, plan: null, intents: [] }),
    }),
    { name: "companion-session" },
  ),
);
