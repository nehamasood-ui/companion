import type { Plan, TimelineItem } from "./types";
import {
  type AltActivity,
  potteryAlt,
  sushiAlt,
  cheaperArtAlt,
  cheaperFoodAlt,
  brunchStop,
} from "@/data/refinements";

// Demo-mode refinement engine. It pattern-matches a natural-language follow-up
// to a curated intent and returns a *partial* update: a new plan plus the set of
// items that changed, so the UI can animate only the delta rather than
// regenerating the day. This is deterministic theater-on-rails — the suggested
// chips steer users toward what's supported — but it's architected behind one
// interface so a live Claude structured-output call can replace the matcher
// later without touching the UI.

export interface RefineResult {
  plan: Plan;
  /** Items to flag as freshly revised (highlight). */
  changedIds: string[];
  /** Newly inserted items (a subset of changedIds) — these animate in. */
  enteringIds: string[];
  /** One-line AI whisper describing what changed. */
  summary: string;
  /** False when nothing matched — the plan is returned unchanged. */
  matched: boolean;
}

/** Replace an item in place, preserving its id, timing, and inbound travel. */
function replaceWith(items: TimelineItem[], id: string, alt: AltActivity): TimelineItem[] {
  return items.map((it) => (it.id === id ? { ...it, ...alt } : it));
}

function firstArtId(items: TimelineItem[]): string | undefined {
  return items.find((i) => i.type === "art")?.id;
}

function lastFoodId(items: TimelineItem[]): string | undefined {
  return [...items].reverse().find((i) => i.type === "food")?.id;
}

function priciestId(items: TimelineItem[]): string | undefined {
  return [...items].sort((a, b) => b.costPerPerson - a.costPerPerson)[0]?.id;
}

function totalSpend(items: TimelineItem[]): number {
  return items.reduce((sum, i) => sum + i.costPerPerson, 0);
}

function noMatch(plan: Plan, summary: string): RefineResult {
  return { plan, changedIds: [], enteringIds: [], summary, matched: false };
}

// --- Individual intents -----------------------------------------------------

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

function addBrunch(plan: Plan): RefineResult {
  if (plan.items.some((i) => i.id === brunchStop.id)) {
    return noMatch(plan, "There's already a brunch stop on the day.");
  }
  const items = [...plan.items];
  items.splice(1, 0, { ...brunchStop }); // slot it in right after the opener
  return {
    plan: { ...plan, items },
    changedIds: [brunchStop.id],
    enteringIds: [brunchStop.id],
    summary: "Added a brunch stop after coffee — nudged the rest of the day a little later.",
    matched: true,
  };
}

function trimBudget(plan: Plan, cap: number | undefined): RefineResult {
  const targetId = priciestId(plan.items);
  const target = plan.items.find((i) => i.id === targetId);
  if (!target) return noMatch(plan, "Nothing to trim — the day is already lean.");

  const alt = target.type === "food" ? cheaperFoodAlt : cheaperArtAlt;
  const items = replaceWith(plan.items, target.id, alt);
  const budget = cap ?? plan.budgetPerPerson;
  const total = totalSpend(items);
  const capLabel = `${plan.currency}${budget}`;

  return {
    plan: { ...plan, items, budgetPerPerson: budget },
    changedIds: [target.id],
    enteringIds: [],
    summary:
      total <= budget
        ? `Brought it to ${plan.currency}${total} per person — swapped ${target.title.toLowerCase()} for a lighter option, under ${capLabel}.`
        : `Trimmed ${target.title.toLowerCase()} to the cheapest good option — now ${plan.currency}${total} per person.`,
    matched: true,
  };
}

function extractCap(p: string): number | undefined {
  const m = p.match(/(?:under|below|max|up to)\s*\$?\s*(\d+)/) ?? p.match(/\$\s*(\d+)/);
  return m ? Number(m[1]) : undefined;
}

// --- Entry point ------------------------------------------------------------

export function applyRefinement(plan: Plan, prompt: string): RefineResult {
  const p = prompt.trim().toLowerCase();
  if (!p) return noMatch(plan, "Type a tweak — or tap a suggestion below.");

  if (/\bwalk|walkable|less driv|fewer driv|no driv|on foot/.test(p)) {
    return makeWalkable(plan);
  }
  if (/pottery|ceramic|\bclay\b/.test(p)) {
    return replaceActivity(
      plan,
      firstArtId(plan.items),
      potteryAlt,
      "Swapped the painting session for a pottery wheel class.",
    );
  }
  if (/sushi|omakase|japanese/.test(p)) {
    return replaceActivity(
      plan,
      lastFoodId(plan.items),
      sushiAlt,
      "Swapped dinner for an intimate omakase sushi counter.",
    );
  }
  if (/brunch/.test(p)) {
    return addBrunch(plan);
  }
  if (/under\s*\$?\d+|below\s*\$?\d+|\bcheaper\b|\bbudget\b|less expensive|spend less|save money|\$\s*\d+/.test(p)) {
    return trimBudget(plan, extractCap(p));
  }

  return noMatch(plan, "Hmm — I can't make that change yet. Try one of the suggestions below.");
}
