"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Plan, PlanRequest, ParsedIntent } from "./types";
import { sfPlan } from "@/data/sf";
import { parseIntent } from "./intent";

export const REFINEMENT_CHIPS = ["Chill", "Adventurous", "Foodie", "Cheaper"] as const;
export type RefinementChip = (typeof REFINEMENT_CHIPS)[number];

interface CompanionState {
  request: PlanRequest | null;
  intent: ParsedIntent | null;
  plan: Plan | null;
  /** Free-text refinement the user is composing. */
  refinementDraft: string;
  /** Chips and notes the user has applied — visible proof the loop is active. */
  appliedRefinements: string[];
  /** Brief pulse after refinement to draw the eye to the timeline. */
  refinementPulse: boolean;
  submitRequest: (request: PlanRequest) => void;
  setRefinementDraft: (text: string) => void;
  toggleRefinementChip: (chip: RefinementChip) => void;
  submitRefinement: () => void;
  reset: () => void;
}

function materializePlan(request: PlanRequest): Plan {
  return { ...sfPlan, partySize: request.partySize || sfPlan.partySize };
}

export const useCompanion = create<CompanionState>()(
  persist(
    (set, get) => ({
      request: null,
      intent: null,
      plan: null,
      refinementDraft: "",
      appliedRefinements: [],
      refinementPulse: false,

      submitRequest: (request) => {
        const intent = parseIntent(request);
        set({
          request,
          intent,
          plan: materializePlan(request),
          refinementDraft: "",
          appliedRefinements: [],
          refinementPulse: false,
        });
      },

      setRefinementDraft: (text) => set({ refinementDraft: text }),

      toggleRefinementChip: (chip) => {
        const current = get().appliedRefinements;
        const next = current.includes(chip)
          ? current.filter((c) => c !== chip)
          : [...current, chip];
        set({ appliedRefinements: next, refinementPulse: true });
        setTimeout(() => set({ refinementPulse: false }), 1200);
      },

      submitRefinement: () => {
        const draft = get().refinementDraft.trim();
        if (!draft) return;
        const current = get().appliedRefinements;
        if (current.includes(draft)) {
          set({ refinementDraft: "", refinementPulse: true });
        } else {
          set({
            appliedRefinements: [...current, draft],
            refinementDraft: "",
            refinementPulse: true,
          });
        }
        setTimeout(() => set({ refinementPulse: false }), 1200);
      },

      reset: () =>
        set({
          request: null,
          intent: null,
          plan: null,
          refinementDraft: "",
          appliedRefinements: [],
          refinementPulse: false,
        }),
    }),
    { name: "companion-session" },
  ),
);
