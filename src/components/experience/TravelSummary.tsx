"use client";

import { Car, Footprints, TrainFront } from "lucide-react";
import type { Plan, ParsedIntent } from "@/lib/types";
import { formatTravelProfile, summarizeTravel } from "@/lib/travel";

const MODE_ICON = { walk: Footprints, drive: Car, transit: TrainFront };

/** Compact route profile shown beneath the map — evidence of how the day moves. */
export function TravelSummary({
  plan,
  intent,
  show,
}: {
  plan: Plan;
  intent: ParsedIntent | null;
  show: boolean;
}) {
  if (!show) return null;

  const summary = summarizeTravel(plan);
  const profile = formatTravelProfile(summary);
  const Icon = MODE_ICON[summary.dominantMode];

  const intentMismatch =
    intent &&
    ((intent.prefersWalkable && summary.driveMinutes > summary.walkMinutes) ||
      (intent.prefersNoDriving && summary.driveLegs > 0) ||
      (intent.minimalWalking && summary.walkMinutes > 20));

  return (
    <div className="mt-2 flex items-start gap-2 rounded-xl border border-line bg-bg/80 px-3 py-2.5">
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted" strokeWidth={1.75} />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-ink">{profile}</p>
        <p className="mt-0.5 text-[11px] leading-relaxed text-muted">
          {summary.driveLegs + summary.walkLegs + summary.transitLegs} transfers
          between {plan.items.length} stops
        </p>
        {intentMismatch && (
          <p className="mt-1.5 text-[11px] leading-relaxed text-sunset">
            Refine below to better match your constraints.
          </p>
        )}
      </div>
    </div>
  );
}
