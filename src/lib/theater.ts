import { Brain, CloudSun, MapPin, Route, CalendarClock, type LucideIcon } from "lucide-react";
import type { DetectedIntent } from "./generate";

// The five-act "AI workflow" the user watches before the reveal. Each act is
// not decoration — it assembles a real, persisting piece of the workspace in
// front of the user, so the reveal feels like a settle rather than a curtain.

export interface TheaterStep {
  id: "understand" | "weather" | "places" | "route" | "itinerary";
  label: string;
  /** What the user reads while it runs. */
  detail: string;
  icon: LucideIcon;
  /** How long this act holds the spotlight (ms). */
  duration: number;
}

export const THEATER_STEPS: TheaterStep[] = [
  { id: "understand", label: "Understanding your group", detail: "5 people · chill, creative, scenic", icon: Brain, duration: 1100 },
  { id: "weather", label: "Checking the weather", detail: "Clear skies, 68°F — good for the coast", icon: CloudSun, duration: 950 },
  { id: "places", label: "Finding places", detail: "Comparing 40+ spots for fit and timing", icon: MapPin, duration: 1300 },
  { id: "route", label: "Optimizing the route", detail: "Least backtracking, most daylight", icon: Route, duration: 1050 },
  { id: "itinerary", label: "Building your itinerary", detail: "Sequencing the day around sunset", icon: CalendarClock, duration: 1150 },
];

export const TOTAL_THEATER_MS = THEATER_STEPS.reduce((sum, s) => sum + s.duration, 0);

// Reflect detected intent in the reveal copy so the theater feels like it's
// working on *your* request — "Optimizing a walkable route", not generic. Only
// the copy changes; durations stay fixed so the clock is unaffected.
export function buildTheaterSteps(intents: DetectedIntent[]): TheaterStep[] {
  const has = (id: string) => intents.some((i) => i.id === id);
  const labels = intents.map((i) => i.label);

  return THEATER_STEPS.map((step) => {
    switch (step.id) {
      case "understand":
        return labels.length ? { ...step, detail: `Tuning for ${labels.join(" · ")}` } : step;
      case "places":
        if (has("scenic"))
          return { ...step, label: "Finding scenic spots", detail: "Open-air stops, lookouts, and views" };
        if (has("walkable"))
          return { ...step, label: "Finding walkable spots", detail: "Clustered close enough to stroll" };
        return step;
      case "route":
        return has("walkable")
          ? { ...step, label: "Optimizing a walkable route", detail: "Most on-foot, least backtracking" }
          : step;
      case "itinerary":
        return has("budget")
          ? { ...step, detail: "Sequencing the day within budget" }
          : step;
      default:
        return step;
    }
  });
}
