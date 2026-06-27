import { Brain, CloudSun, MapPin, Route, CalendarClock, type LucideIcon } from "lucide-react";
import type { ParsedIntent } from "./intent";
import { theaterDetails } from "./intent";

export interface TheaterStep {
  id: "understand" | "weather" | "places" | "route" | "itinerary";
  label: string;
  detail: string;
  icon: LucideIcon;
  duration: number;
}

const STEP_META: Omit<TheaterStep, "detail">[] = [
  { id: "understand", label: "Understanding your group", icon: Brain, duration: 1100 },
  { id: "weather", label: "Checking the weather", icon: CloudSun, duration: 950 },
  { id: "places", label: "Finding places", icon: MapPin, duration: 1300 },
  { id: "route", label: "Optimizing the route", icon: Route, duration: 1050 },
  { id: "itinerary", label: "Building your itinerary", icon: CalendarClock, duration: 1150 },
];

/** Default showcase steps when no request context is available. */
export const THEATER_STEPS: TheaterStep[] = [
  { ...STEP_META[0], detail: "5 people · chill, creative, scenic" },
  { ...STEP_META[1], detail: "Clear skies, 68°F — good for the coast" },
  { ...STEP_META[2], detail: "Comparing spots for fit and timing" },
  { ...STEP_META[3], detail: "Least backtracking, most daylight" },
  { ...STEP_META[4], detail: "Sequencing the day around sunset" },
];

export function buildTheaterSteps(intent: ParsedIntent, partySize: number): TheaterStep[] {
  const details = theaterDetails(intent, partySize);
  return STEP_META.map((step) => ({
    ...step,
    detail: details[step.id],
  }));
}

export const TOTAL_THEATER_MS = THEATER_STEPS.reduce((sum, s) => sum + s.duration, 0);
