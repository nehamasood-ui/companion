import type { PlanRequest } from "./types";

export interface IntentConstraint {
  id: string;
  label: string;
}

export interface ParsedIntent {
  /** Short excerpt of the user's prompt for display. */
  promptExcerpt: string;
  constraints: IntentConstraint[];
  /** Activity keywords spotted in the prompt. */
  themes: string[];
  budgetCap?: number;
  prefersWalkable: boolean;
  prefersNoDriving: boolean;
  minimalWalking: boolean;
  foodFocused: boolean;
  outdoorsy: boolean;
  budgetConscious: boolean;
}

const BUDGET_RE = /(?:under|below|max|≤|<)\s*\$?\s*(\d+)/i;
const BUDGET_AROUND_RE = /(?:around|about|~\s*)\$?\s*(\d+)/i;

function has(text: string, patterns: RegExp[]): boolean {
  return patterns.some((p) => p.test(text));
}

function extractBudget(text: string): number | undefined {
  const under = text.match(BUDGET_RE);
  if (under) return Number(under[1]);
  const around = text.match(BUDGET_AROUND_RE);
  if (around) return Number(around[1]);
  if (/\bcheap\b|\baffordable\b|\bbudget\b|\blow[- ]cost\b/i.test(text)) return 50;
  return undefined;
}

function extractThemes(text: string): string[] {
  const themes: string[] = [];
  const checks: [RegExp, string][] = [
    [/\bcoffee\b|\bcaf[eé]\b|\bespresso\b/i, "Coffee"],
    [/\bbrunch\b|\bbreakfast\b/i, "Brunch"],
    [/\bpottery\b|\bceramic/i, "Pottery"],
    [/\bpaint/i, "Creative"],
    [/\bsunset\b|\bgolden hour\b/i, "Sunset"],
    [/\bsushi\b|\bramen\b|\bdinner\b|\bfood\b|\beat\b/i, "Food"],
    [/\bwalk\b|\bhike\b|\btrail\b|\boutdoor/i, "Outdoors"],
    [/\bcozy\b|\bchill\b|\brelaxed\b/i, "Cozy"],
    [/\bscenic\b|\bviews\b/i, "Scenic"],
  ];
  for (const [re, label] of checks) {
    if (re.test(text) && !themes.includes(label)) themes.push(label);
  }
  return themes.slice(0, 5);
}

/** Lightweight client-side parser — surfaces what the user asked for in the UI. */
export function parseIntent(request: PlanRequest): ParsedIntent {
  const text = request.prompt.toLowerCase();
  const full = request.prompt.trim();

  const prefersWalkable = has(text, [
    /\bwalkable\b/,
    /\bmostly walk/i,
    /\bwalk everywhere\b/,
    /\bby foot\b/,
  ]);
  const prefersNoDriving = has(text, [
    /\bno driving\b/,
    /\bno drive\b/,
    /\bwithout a car\b/,
    /\bcar[- ]free\b/,
  ]);
  const minimalWalking = has(text, [
    /\bminimal walking\b/,
    /\bless walking\b/,
    /\blow walking\b/,
    /\bavoid walking\b/,
  ]);
  const foodFocused = has(text, [
    /\bfood[- ]focused\b/,
    /\bfoodie\b/,
    /\beat\b.*\bday\b/,
    /\bculinary\b/,
  ]);
  const outdoorsy = has(text, [
    /\boutdoorsy\b/,
    /\boutdoor\b/,
    /\bscenic\b/,
    /\bnature\b/,
    /\bhike\b/,
  ]);
  const budgetConscious =
    !!extractBudget(text) ||
    has(text, [/\bcheap\b/, /\baffordable\b/, /\bbudget\b/, /\bunder \$?\d+/]);

  const constraints: IntentConstraint[] = [];

  if (prefersWalkable) constraints.push({ id: "walkable", label: "Walkable" });
  if (prefersNoDriving) constraints.push({ id: "no-drive", label: "No driving" });
  if (minimalWalking) constraints.push({ id: "minimal-walk", label: "Minimal walking" });
  if (foodFocused) constraints.push({ id: "food", label: "Food-focused" });
  if (outdoorsy) constraints.push({ id: "outdoors", label: "Outdoors & scenic" });
  if (budgetConscious) {
    const cap = extractBudget(text);
    constraints.push({
      id: "budget",
      label: cap ? `Under $${cap}` : "Budget-conscious",
    });
  }

  for (const vibe of request.vibes) {
    const label = vibe.charAt(0).toUpperCase() + vibe.slice(1).toLowerCase();
    if (!constraints.some((c) => c.label.toLowerCase() === label.toLowerCase())) {
      constraints.push({ id: `vibe-${vibe}`, label });
    }
  }

  const themes = extractThemes(text);
  for (const theme of themes) {
    if (!constraints.some((c) => c.label === theme)) {
      constraints.push({ id: `theme-${theme}`, label: theme });
    }
  }

  const excerpt =
    full.length > 72 ? `${full.slice(0, 69).trim()}…` : full;

  return {
    promptExcerpt: excerpt,
    constraints: constraints.slice(0, 8),
    themes,
    budgetCap: extractBudget(text),
    prefersWalkable,
    prefersNoDriving,
    minimalWalking,
    foodFocused,
    outdoorsy,
    budgetConscious,
  };
}

/** Theater step copy derived from parsed intent — makes the reveal feel considered. */
export function theaterDetails(
  intent: ParsedIntent,
  partySize: number,
): Record<string, string> {
  const constraintLine =
    intent.constraints.length > 0
      ? intent.constraints
          .slice(0, 4)
          .map((c) => c.label.toLowerCase())
          .join(" · ")
      : "your vibe and timing";

  const routeDetail = intent.prefersWalkable || intent.prefersNoDriving
    ? "Clustering stops for walking & transit"
    : intent.minimalWalking
      ? "Keeping transfers short, stops close together"
      : "Least backtracking, most daylight";

  const placesDetail = intent.foodFocused
    ? "Prioritizing food spots with great reviews"
    : intent.outdoorsy
      ? "Scenic outdoor stops with good weather windows"
      : "Comparing spots for fit and timing";

  const itineraryDetail = intent.themes.includes("Sunset")
    ? "Sequencing the day around sunset"
    : intent.foodFocused
      ? "Building around meal times and cravings"
      : "Balancing energy across the day";

  return {
    understand: `${partySize} ${partySize === 1 ? "person" : "people"} · ${constraintLine}`,
    weather: "Clear skies, 68°F — good for the coast",
    places: placesDetail,
    route: routeDetail,
    itinerary: itineraryDetail,
  };
}
