"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Plan, PlanRequest } from "./types";
import { sfPlan } from "@/data/sf";

interface CompanionState {
  request: PlanRequest | null;
  plan: Plan | null;
  /** Submit the landing prompt and (in demo mode) materialize the curated plan. */
  submitRequest: (request: PlanRequest) => void;
  reset: () => void;
}

export const useCompanion = create<CompanionState>()(
  persist(
    (set) => ({
      request: null,
      plan: null,
      submitRequest: (request) =>
        set({
          request,
          // Demo mode: every prompt reveals the curated showcase plan.
          plan: { ...sfPlan, partySize: request.partySize || sfPlan.partySize },
        }),
      reset: () => set({ request: null, plan: null }),
    }),
    { name: "companion-session" },
  ),
);
