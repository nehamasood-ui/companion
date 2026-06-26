import type { Plan, TimelineItem } from "./types";
import {
  type AltActivity,
  potteryAlt,
  sushiAlt,
  scenicAlt,
  cheaperArtAlt,
  cheaperFoodAlt,
  brunchStop,
} from "@/data/refinements";

// Demo-mode intent engine. It pattern-matches natural language to a curated set
// of intents and returns a *partial* update: a new plan plus the set of items
// that changed, so the UI can animate only the delta. The same registry powers
// two callers — single-shot refinements after generation (applyRefinement) and
// composed first-draft generation (see lib/generate.ts) — so there's one source
// of truth. It's deterministic theater-on-rails, built behind one interface so a
// live Claude structured-output call can replace the matcher later.

export type IntentId = "walkable" | "pottery" | "scenic" | "sushi" | "brunch" | "budget";

export interface RefineResult {
  plan: Plan;
  changedIds: string[];
  enteringIds: string[];
  summary: string;
  matched: boolean;
}

/** Extra context for intents that compose (budget protects explicit asks). */
export interface ApplyCtx {
  cap?: number;
  protectedIds?: string[];
}

export const INTENT_LABEL: Record<IntentId, string> = {
  walkable: "walkable",
  pottery: "pottery",
  scenic: "scenic",
  sushi: "sushi",
  brunch: "brunch",
  budget: "budget-aware",
};

// --- helpers ----------------------------------------------------------------

function replaceWith(items: TimelineItem[], id: string, alt: AltActivity): TimelineItem[] {
  return items.map((it) => (it.id === id ? { ...it, ...alt } : it));
}

export function firstArtId(items: TimelineItem[]): string | undefined {
  return items.find((i) => i.type === "art")?.id;
}

function lastFoodId(items: TimelineItem[]): string | undefined {
  return [...items].reverse().find((i) => i.type === "food")?.id;
}

function totalSpend(items: TimelineItem[]): number {
  return items.reduce((sum, i) => sum + i.costPerPerson, 0);
}

function noMatch(plan: Plan, summary: string): RefineResult {
  return { plan, changedIds: [], enteringIds: [], summary, matched: false };
}

/** Parse an explicit budget cap from a prompt ("under $50" / "$60"). */
export function extractCap(prompt: string): number | undefined {
  const p = prompt.toLowerCase();
  const m =
    p.match(/(?:under|below|max|up to|less than)\s*\$?\s*(\d+)/) ?? p.match(/\$\s*(\d+)/);
  return m ? Number(m[1]) : undefined;
}

// --- intent transforms ------------------------------------------------------

function makeWalkable(plan: Plan): RefineResult {
  const items = plan.items.map((it, i) => {
    if (i === 0 || !it.travelFromPrev) return it;
    const prev = it.travelFromPrev;
    const minutes = prev.mode === "walk" ? prev.minutes : Math.round(prev.minutes * 1.8);
    return { ...it, travelFromPrev: { minutes, mode: "walk" as const } };
  });
  const changedIds = items.filter((_, i) => i > 0).map((it) => it.id);
  return {
    plan: { ...plan, items, routeMode: "walk" },
    changedIds,
    enteringIds: [],
    summary:
      "Made it walking-first — turned the hops between stops into walks. A couple run long; say the word and I'll swap the far stops for closer ones.",
    matched: true,
  };
}

function replaceActivity(
  plan: Plan,
  targetId: string | undefined,
  alt: AltActivity,
  summary: string,
): RefineResult {
  if (!targetId) return noMatch(plan, "I couldn't find that part of the day to change.");
  return {
    plan: { ...plan, items: replaceWith(plan.items, targetId, alt) },
    changedIds: [targetId],
    enteringIds: [],
    summary,
    matched: true,
  };
}

function makeScenic(plan: Plan, ctx: ApplyCtx): RefineResult {
  const id = firstArtId(plan.items);
  // Respect an explicitly-requested creative stop — never silently remove it.
  if (!id || ctx.protectedIds?.includes(id)) {
    return noMatch(plan, "Kept your creative stop as-is.");
  }
  return replaceActivity(
    plan,
    id,
    scenicAlt,
    "Traded the indoor hour for an outdoor scenic lookout.",
  );
}

function addBrunch(plan: Plan): RefineResult {
  if (plan.items.some((i) => i.id === brunchStop.id)) {
    return noMatch(plan, "There's already a brunch stop on the day.");
  }
  const items = [...plan.items];
  items.splice(1, 0, { ...brunchStop });
  return {
    plan: { ...plan, items },
    changedIds: [brunchStop.id],
    enteringIds: [brunchStop.id],
    summary: "Added a brunch stop after coffee — nudged the rest of the day a little later.",
    matched: true,
  };
}

function trimBudget(plan: Plan, ctx: ApplyCtx): RefineResult {
  const cap = ctx.cap;
  const protectedIds = ctx.protectedIds ?? [];
  const total = totalSpend(plan.items);
  const budget = cap ?? plan.budgetPerPerson;

  // Already within an explicit cap → just honor the cap, no gratuitous swap.
  if (cap && total <= cap) {
    return {
      plan: { ...plan, budgetPerPerson: cap },
      changedIds: [],
      enteringIds: [],
      summary: `Set the budget to ${plan.currency}${cap} — the day already fits.`,
      matched: true,
    };
  }

  const target = plan.items
    .filter((i) => i.costPerPerson > 0 && !protectedIds.includes(i.id))
    .sort((a, b) => b.costPerPerson - a.costPerPerson)[0];

  if (!target) {
    return cap
      ? {
          plan: { ...plan, budgetPerPerson: cap },
          changedIds: [],
          enteringIds: [],
          summary: `Set the budget to ${plan.currency}${cap}.`,
          matched: true,
        }
      : noMatch(plan, "Nothing left to trim — the day is already lean.");
  }

  const alt = target.type === "food" ? cheaperFoodAlt : cheaperArtAlt;
  const items = replaceWith(plan.items, target.id, alt);
  const newTotal = totalSpend(items);
  return {
    plan: { ...plan, items, budgetPerPerson: budget },
    changedIds: [target.id],
    enteringIds: [],
    summary:
      cap && newTotal <= cap
        ? `Brought it to ${plan.currency}${newTotal} per person — under ${plan.currency}${cap}.`
        : `Trimmed ${target.title.toLowerCase()} to a lighter option — now ${plan.currency}${newTotal} per person.`,
    matched: true,
  };
}

// --- registry ---------------------------------------------------------------
// Order is composition priority: structural/content intents first, budget last.

interface IntentDef {
  id: IntentId;
  /** Directive-only — deliberately strict to avoid keyword overfitting. */
  detect: RegExp;
  apply: (plan: Plan, ctx: ApplyCtx) => RefineResult;
}

const INTENTS: IntentDef[] = [
  {
    id: "walkable",
    detect: /\bwalkable\b|\bwalking\b|less driv|fewer driv|on foot|no car|without driving/,
    apply: (plan) => makeWalkable(plan),
  },
  {
    id: "pottery",
    detect: /pottery|ceramic|\bclay\b/,
    apply: (plan) =>
      replaceActivity(
        plan,
        firstArtId(plan.items),
        potteryAlt,
        "Swapped the painting session for a pottery wheel class.",
      ),
  },
  {
    id: "scenic",
    detect: /\bscenic\b|\boutdoors?y?\b|in nature|nature walk|sightsee|great views/,
    apply: (plan, ctx) => makeScenic(plan, ctx),
  },
  {
    id: "sushi",
    detect: /sushi|omakase|japanese/,
    apply: (plan) =>
      replaceActivity(
        plan,
        lastFoodId(plan.items),
        sushiAlt,
        "Swapped dinner for an intimate omakase sushi counter.",
      ),
  },
  {
    id: "brunch",
    detect: /brunch/,
    apply: (plan) => addBrunch(plan),
  },
  {
    id: "budget",
    detect:
      /under\s*\$?\d+|below\s*\$?\d+|less than\s*\$?\d+|\bcheap(er|est)?\b|\bbudget\b|\binexpensive\b|less expensive|spend less|save money|\bafford|\$\s*\d+/,
    apply: (plan, ctx) => trimBudget(plan, ctx),
  },
];

/** Detect every intent present in a prompt (+ vibes), in composition order. */
export function detectIntents(prompt: string, vibes: string[] = []): IntentId[] {
  const p = (prompt ?? "").toLowerCase();
  const found = INTENTS.filter((intent) => intent.detect.test(p)).map((i) => i.id);
  if (vibes.some((v) => /budget/i.test(v)) && !found.includes("budget")) {
    found.push("budget");
  }
  return found;
}

/** Apply one intent by id (used by the generator's composition). */
export function applyIntent(plan: Plan, id: IntentId, ctx: ApplyCtx = {}): RefineResult {
  const intent = INTENTS.find((i) => i.id === id);
  return intent ? intent.apply(plan, ctx) : noMatch(plan, "");
}

/** Single-shot refinement: apply the first matching intent (M2 behavior). */
export function applyRefinement(plan: Plan, prompt: string): RefineResult {
  const p = prompt.trim().toLowerCase();
  if (!p) return noMatch(plan, "Type a tweak — or tap a suggestion below.");
  const cap = extractCap(p);
  for (const intent of INTENTS) {
    if (intent.detect.test(p)) return intent.apply(plan, { cap });
  }
  return noMatch(plan, "Hmm — I can't make that change yet. Try one of the suggestions below.");
}
