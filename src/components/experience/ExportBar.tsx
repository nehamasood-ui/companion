"use client";

import { Navigation, MapPin, Copy, Share2, type LucideIcon } from "lucide-react";

// Where the plan stops being a screen and becomes something you act on. Inert in
// this milestone (M1) — it reserves the slot; M3 wires the real deep links and
// the Web Share / clipboard behavior.
const ACTIONS: { label: string; icon: LucideIcon }[] = [
  { label: "Google Maps", icon: Navigation },
  { label: "Apple Maps", icon: MapPin },
  { label: "Copy itinerary", icon: Copy },
  { label: "Share", icon: Share2 },
];

export function ExportBar() {
  return (
    <section
      aria-label="Take your plan with you"
      className="rounded-2xl border border-line bg-surface p-3.5 shadow-card"
    >
      <div className="mb-2.5 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">
          Take it with you
        </span>
        <span className="rounded-full border border-line bg-bg px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted">
          Preview
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {ACTIONS.map(({ label, icon: Icon }) => (
          <span
            key={label}
            title="Coming next"
            className="inline-flex cursor-default items-center justify-center gap-1.5 rounded-xl border border-line bg-bg/60 px-3 py-2 text-xs font-medium text-ink-soft"
          >
            <Icon className="h-4 w-4 text-muted" strokeWidth={1.75} />
            {label}
          </span>
        ))}
      </div>
    </section>
  );
}
