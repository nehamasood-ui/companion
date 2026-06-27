"use client";

import { Footprints, Car, TrainFront, CheckCircle2 } from "lucide-react";
import type { Plan, ParsedIntent } from "@/lib/types";
import { formatTravelProfile, summarizeTravel } from "@/lib/travel";

const MODE_ICON = { walk: Footprints, drive: Car, transit: TrainFront };

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
  const allWalk =
    summary.driveLegs === 0 &&
    summary.transitLegs === 0 &&
    summary.walkLegs > 0;

  const wantsWalkable =
    intent?.prefersWalkable || intent?.prefersNoDriving || plan.id.includes("walkable");

  const intentMismatch =
    wantsWalkable &&
    !allWalk &&
    (summary.driveLegs > 0 || summary.driveMinutes > summary.walkMinutes);

  return (
    <div className="mt-2 flex items-start gap-2 rounded-xl border border-line bg-bg/80 px-3 py-2.5">
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted" strokeWidth={1.75} />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-ink">{profile}</p>
        <p className="mt-0.5 text-[11px] leading-relaxed text-muted">
          {summary.walkLegs + summary.driveLegs + summary.transitLegs} transfers
          · {plan.items.length} stops
        </p>
        {allWalk && wantsWalkable && (
          <p className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-primary-ink">
            <CheckCircle2 className="h-3 w-3" strokeWidth={2} />
            Fully walkable route
          </p>
        )}
        {intentMismatch && (
          <p className="mt-1.5 text-[11px] leading-relaxed text-sunset">
            Refine to walkable to cluster stops on foot.
          </p>
        )}
      </div>
    </div>
  );
}
