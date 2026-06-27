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
  /** Display label for the parsed budget constraint. */
  budgetLabel?: string;
  prefersWalkable: boolean;
  prefersNoDriving: boolean;
  minimalWalking: boolean;
  foodFocused: boolean;
  outdoorsy: boolean;
  budgetConscious: boolean;
}

function has(text: string, patterns: RegExp[]): boolean {
  return patterns.some((p) => p.test(text));
}

interface BudgetParse {
  cap: number;
  /** Human label for constraint chips, e.g. "Under $50" or "Around $60". */
  label: string;
}

/** Pull a per-person budget from the prompt — never from curated demo data. */
function extractBudget(text: string, vibes: string[] = []): BudgetParse | undefined {
  const lower = text.toLowerCase();

  const under = lower.match(
    /(?:under|below|max|less than|at most|≤|<)\s*\$?\s*(\d+)/i,
  );
  if (under) {
    const cap = Number(under[1]);
    return { cap, label: `Under $${cap}` };
  }

  const around = lower.match(
    /(?:around|about|roughly|~)\s*\$?\s*(\d+)/i,
  );
  if (around) {
    const cap = Number(around[1]);
    return { cap, label: `Around $${cap}` };
  }

  const each = lower.match(
    /\$\s*(\d+)\s*(?:each|pp|per person|a person|per head)/i,
  );
  if (each) {
    const cap = Number(each[1]);
    return { cap, label: `$${cap} each` };
  }

  const dollarsEach = lower.match(/(\d+)\s*dollars?\s*(?:each|pp|per person)?/i);
  if (dollarsEach) {
    const cap = Number(dollarsEach[1]);
    return { cap, label: `$${cap} each` };
  }

  // Trailing dollar amount — e.g. "...and dinner. $60" or "...sushi, $50"
  const allDollar = [...lower.matchAll(/\$\s*(\d+)/g)];
  if (allDollar.length > 0) {
    const cap = Number(allDollar[allDollar.length - 1][1]);
    return { cap, label: `$${cap}` };
  }

  if (vibes.some((v) => v.toLowerCase() === "budget")) {
    return { cap: 50, label: "Budget · ~$50" };
  }

  if (/\bcheap\b|\baffordable\b|\blow[- ]cost\b/i.test(lower)) {
    return { cap: 50, label: "Budget · ~$50" };
  }

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
  const budget = extractBudget(full, request.vibes);
  const budgetConscious = !!budget;

  const constraints: IntentConstraint[] = [];

  if (prefersWalkable) constraints.push({ id: "walkable", label: "Walkable" });
  if (prefersNoDriving) constraints.push({ id: "no-drive", label: "No driving" });
  if (minimalWalking) constraints.push({ id: "minimal-walk", label: "Minimal walking" });
  if (foodFocused) constraints.push({ id: "food", label: "Food-focused" });
  if (outdoorsy) constraints.push({ id: "outdoors", label: "Outdoors & scenic" });
  if (budget) {
    constraints.push({ id: "budget", label: budget.label });
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
    budgetCap: budget?.cap,
    budgetLabel: budget?.label,
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
