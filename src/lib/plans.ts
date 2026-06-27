import type { Plan, PlanRequest } from "./types";
import type { ParsedIntent } from "./intent";
import { sfPlan, totalSpend } from "@/data/sf";
import { sfWalkablePlan } from "@/data/sf-walkable";

export type PlanVariant = "default" | "walkable";

export const DEFAULT_BUDGET_CAP = 75;

/** Which curated variant to show for the initial generation. */
export function initialVariant(intent: ParsedIntent): PlanVariant {
  if (intent.prefersWalkable || intent.prefersNoDriving) return "walkable";
  return "default";
}

export function planForVariant(variant: PlanVariant): Plan {
  return variant === "walkable" ? sfWalkablePlan : sfPlan;
}

export function buildPlan(
  request: PlanRequest,
  variant: PlanVariant,
  userBudgetCap: number,
): Plan {
  const base = planForVariant(variant);
  return {
    ...base,
    partySize: request.partySize || base.partySize,
    budgetPerPerson: userBudgetCap,
  };
}

export function defaultBudgetCap(intent: ParsedIntent): number {
  return intent.budgetCap ?? DEFAULT_BUDGET_CAP;
}

const WALKABLE_RE =
  /\b(walkable|more walk|less driv|no driv|without a car|car[- ]free|on foot|by foot|walking)\b/i;

const CHEAPER_RE = /\b(cheaper|less expensive|lower cost|cut cost|save money|under budget)\b/i;

export function refinementWantsWalkable(text: string): boolean {
  return WALKABLE_RE.test(text);
}

export function refinementWantsCheaper(text: string): boolean {
  return CHEAPER_RE.test(text);
}

/** Apply a free-text refinement — returns the new variant and optional budget tweak. */
export function applyTextRefinement(
  text: string,
  currentVariant: PlanVariant,
  currentBudget: number,
): { variant: PlanVariant; budgetCap: number; label: string } {
  const wantsWalk = refinementWantsWalkable(text);
  const wantsCheap = refinementWantsCheaper(text);

  if (wantsWalk) {
    return {
      variant: "walkable",
      budgetCap: currentBudget,
      label: text,
    };
  }

  if (wantsCheap) {
    const tighter = Math.max(35, Math.round(currentBudget * 0.85));
    return {
      variant: currentVariant,
      budgetCap: tighter,
      label: text,
    };
  }

  return { variant: currentVariant, budgetCap: currentBudget, label: text };
}

/** Quick-chip refinements with real plan effects. */
export function applyChipRefinement(
  chip: string,
  active: boolean,
  currentVariant: PlanVariant,
  currentBudget: number,
  plan: Plan,
): { variant: PlanVariant; budgetCap: number } | null {
  switch (chip) {
    case "Walkable":
      return active
        ? { variant: "walkable", budgetCap: currentBudget }
        : { variant: "default", budgetCap: currentBudget };
    case "Cheaper": {
      if (active) {
        const spent = totalSpend(plan);
        const tighter = Math.max(35, Math.min(currentBudget, spent + 5, Math.round(currentBudget * 0.8)));
        return { variant: currentVariant, budgetCap: tighter };
      }
      return { variant: currentVariant, budgetCap: currentBudget };
    }
    default:
      return null;
  }
}

/** Merge walkable into intent constraints after refinement. */
export function withWalkableIntent(intent: ParsedIntent | null): ParsedIntent | null {
  if (!intent) return null;
  const hasWalk = intent.constraints.some((c) => c.id === "walkable");
  if (hasWalk) return { ...intent, prefersWalkable: true };
  return {
    ...intent,
    prefersWalkable: true,
    constraints: [{ id: "walkable", label: "Walkable" }, ...intent.constraints].slice(0, 8),
  };
}

export function withoutForcedWalkable(intent: ParsedIntent | null): ParsedIntent | null {
  if (!intent) return null;
  return {
    ...intent,
    prefersWalkable: false,
    constraints: intent.constraints.filter((c) => c.id !== "walkable"),
  };
}
