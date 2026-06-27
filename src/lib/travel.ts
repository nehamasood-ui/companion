import type { Plan, TravelMode } from "./types";

export interface TravelSummary {
  walkMinutes: number;
  driveMinutes: number;
  transitMinutes: number;
  totalMinutes: number;
  driveLegs: number;
  walkLegs: number;
  transitLegs: number;
  dominantMode: TravelMode;
}

export function summarizeTravel(plan: Plan): TravelSummary {
  let walkMinutes = 0;
  let driveMinutes = 0;
  let transitMinutes = 0;
  let walkLegs = 0;
  let driveLegs = 0;
  let transitLegs = 0;

  for (const item of plan.items) {
    const leg = item.travelFromPrev;
    if (!leg) continue;
    if (leg.mode === "walk") {
      walkMinutes += leg.minutes;
      walkLegs++;
    } else if (leg.mode === "drive") {
      driveMinutes += leg.minutes;
      driveLegs++;
    } else {
      transitMinutes += leg.minutes;
      transitLegs++;
    }
  }

  const totalMinutes = walkMinutes + driveMinutes + transitMinutes;
  const dominantMode: TravelMode =
    driveMinutes >= walkMinutes && driveMinutes >= transitMinutes
      ? "drive"
      : walkMinutes >= transitMinutes
        ? "walk"
        : "transit";

  return {
    walkMinutes,
    driveMinutes,
    transitMinutes,
    totalMinutes,
    driveLegs,
    walkLegs,
    transitLegs,
    dominantMode,
  };
}

/** Human-readable route profile for the map column. */
export function formatTravelProfile(summary: TravelSummary): string {
  const parts: string[] = [];
  if (summary.walkMinutes > 0) parts.push(`${summary.walkMinutes} min walking`);
  if (summary.driveMinutes > 0) parts.push(`${summary.driveMinutes} min driving`);
  if (summary.transitMinutes > 0) parts.push(`${summary.transitMinutes} min transit`);
  if (parts.length === 0) return "All stops nearby";
  return parts.join(" · ");
}
