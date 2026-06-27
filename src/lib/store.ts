"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Plan, PlanRequest, ParsedIntent } from "./types";
import { parseIntent } from "./intent";
import {
  applyChipRefinement,
  applyTextRefinement,
  buildPlan,
  defaultBudgetCap,
  initialVariant,
  type PlanVariant,
  withWalkableIntent,
  withoutForcedWalkable,
} from "./plans";

export const REFINEMENT_CHIPS = [
  "Walkable",
  "Chill",
  "Adventurous",
  "Foodie",
  "Cheaper",
] as const;
export type RefinementChip = (typeof REFINEMENT_CHIPS)[number];

interface CompanionState {
  request: PlanRequest | null;
  intent: ParsedIntent | null;
  plan: Plan | null;
  planVariant: PlanVariant;
  /** User-controlled per-person budget the plan optimizes toward. */
  userBudgetCap: number;
  refinementDraft: string;
  appliedRefinements: string[];
  refinementPulse: boolean;
  submitRequest: (request: PlanRequest) => void;
  setUserBudgetCap: (cap: number) => void;
  setRefinementDraft: (text: string) => void;
  toggleRefinementChip: (chip: RefinementChip) => void;
  submitRefinement: () => void;
  reset: () => void;
}

function pulseRefinement(
  set: (partial: Partial<CompanionState>) => void,
) {
  set({ refinementPulse: true });
  setTimeout(() => set({ refinementPulse: false }), 1200);
}

function commitPlan(
  set: (partial: Partial<CompanionState>) => void,
  get: () => CompanionState,
  variant: PlanVariant,
  budgetCap: number,
  extras: Partial<CompanionState> = {},
) {
  const { request } = get();
  if (!request) return;
  set({
    planVariant: variant,
    userBudgetCap: budgetCap,
    plan: buildPlan(request, variant, budgetCap),
    ...extras,
  });
  pulseRefinement(set);
}

export const useCompanion = create<CompanionState>()(
  persist(
    (set, get) => ({
      request: null,
      intent: null,
      plan: null,
      planVariant: "default",
      userBudgetCap: 75,
      refinementDraft: "",
      appliedRefinements: [],
      refinementPulse: false,

      submitRequest: (request) => {
        const intent = parseIntent(request);
        const variant = initialVariant(intent);
        const userBudgetCap = defaultBudgetCap(intent);
        set({
          request,
          intent,
          planVariant: variant,
          userBudgetCap,
          plan: buildPlan(request, variant, userBudgetCap),
          refinementDraft: "",
          appliedRefinements: [],
          refinementPulse: false,
        });
      },

      setUserBudgetCap: (cap) => {
        const safe = Math.max(20, Math.min(500, Math.round(cap)));
        const { request, planVariant } = get();
        if (!request) {
          set({ userBudgetCap: safe });
          return;
        }
        set({
          userBudgetCap: safe,
          plan: buildPlan(request, planVariant, safe),
        });
      },

      setRefinementDraft: (text) => set({ refinementDraft: text }),

      toggleRefinementChip: (chip) => {
        const state = get();
        const { request, plan, planVariant, userBudgetCap, appliedRefinements } = state;
        if (!request || !plan) return;

        const active = appliedRefinements.includes(chip);
        const nextApplied = active
          ? appliedRefinements.filter((c) => c !== chip)
          : [...appliedRefinements, chip];

        const effect = applyChipRefinement(
          chip,
          !active,
          planVariant,
          userBudgetCap,
          plan,
        );

        if (chip === "Walkable") {
          const variant = !active ? "walkable" : "default";
          const intent = !active
            ? withWalkableIntent(state.intent)
            : withoutForcedWalkable(state.intent);
          commitPlan(set, get, variant, userBudgetCap, {
            appliedRefinements: nextApplied,
            intent,
          });
          return;
        }

        if (effect) {
          commitPlan(set, get, effect.variant, effect.budgetCap, {
            appliedRefinements: nextApplied,
          });
          return;
        }

        set({ appliedRefinements: nextApplied });
        pulseRefinement(set);
      },

      submitRefinement: () => {
        const state = get();
        const draft = state.refinementDraft.trim();
        if (!draft || !state.request) return;

        const { variant, budgetCap, label } = applyTextRefinement(
          draft,
          state.planVariant,
          state.userBudgetCap,
        );

        const applied = state.appliedRefinements.includes(label)
          ? state.appliedRefinements
          : [...state.appliedRefinements, label];

        const intent =
          variant === "walkable"
            ? withWalkableIntent(state.intent)
            : state.intent;

        commitPlan(set, get, variant, budgetCap, {
          refinementDraft: "",
          appliedRefinements: applied,
          intent,
        });
      },

      reset: () =>
        set({
          request: null,
          intent: null,
          plan: null,
          planVariant: "default",
          userBudgetCap: 75,
          refinementDraft: "",
          appliedRefinements: [],
          refinementPulse: false,
        }),
    }),
    { name: "companion-session" },
  ),
);
