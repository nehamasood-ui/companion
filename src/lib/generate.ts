import type { Plan, PlanRequest } from "./types";
import { sfPlan } from "@/data/sf";
import {
  type IntentId,
  INTENT_LABEL,
  detectIntents,
  applyIntent,
  extractCap,
  firstArtId,
} from "./refine";

// Demo-mode generation. We start from the curated SF plan and fold in whatever
// intents the landing prompt + vibes signalled, so the *first* draft already
// feels like it understood the request — before the theater reveal even plays.
// Composition reuses the refinement engine, so generation and refinement never
// drift apart.

export interface DetectedIntent {
  id: IntentId;
  label: string;
}

function labelFor(id: IntentId, cap?: number): string {
  if (id === "budget") return cap ? `under $${cap}` : INTENT_LABEL.budget;
  return INTENT_LABEL[id];
}

export function generatePlan(request: PlanRequest): {
  plan: Plan;
  intents: DetectedIntent[];
} {
  let plan: Plan = { ...sfPlan, partySize: request.partySize || sfPlan.partySize };
  const prompt = (request.prompt ?? "").toLowerCase();

  let ids = detectIntents(request.prompt, request.vibes);
  // Same-slot conflict: an explicit activity (pottery) beats the vibe (scenic).
  if (ids.includes("pottery")) ids = ids.filter((id) => id !== "scenic");

  const cap = extractCap(prompt);

  // Protect stops the user named explicitly so vibe/budget intents don't remove
  // them. ("a painting session" shouldn't be swapped out by "scenic".)
  const protectedIds: string[] = [];
  if (/\bpaint(ing)?\b/.test(prompt) && !ids.includes("pottery")) {
    const artId = firstArtId(plan.items);
    if (artId) protectedIds.push(artId);
  }

  const applied: DetectedIntent[] = [];

  // Content/structure intents first; budget composes last so it can trim around
  // everything that was just added or swapped in.
  for (const id of ids.filter((i) => i !== "budget")) {
    const res = applyIntent(plan, id, { cap, protectedIds });
    if (!res.matched) continue;
    plan = res.plan;
    applied.push({ id, label: labelFor(id, cap) });
    // Walkable only changes travel mode, so its items stay trimmable; content
    // swaps/additions are protected from the budget pass.
    if (id !== "walkable") protectedIds.push(...res.changedIds, ...res.enteringIds);
  }

  if (ids.includes("budget")) {
    const res = applyIntent(plan, "budget", { cap, protectedIds });
    if (res.matched) {
      plan = res.plan;
      applied.push({ id: "budget", label: labelFor("budget", cap) });
    }
  }

  return { plan, intents: applied };
}
