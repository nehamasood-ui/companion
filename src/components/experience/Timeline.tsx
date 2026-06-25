"use client";

import { motion } from "framer-motion";
import { Star, Car, Footprints, TrainFront, Clock } from "lucide-react";
import type { Plan, TimelineItem, TravelMode } from "@/lib/types";
import { ActivityIcon } from "@/components/shared/ActivityIcon";
import { formatTime, formatDuration } from "@/lib/time";
import { spring, staggerContainer } from "@/lib/motion";

const MODE_ICON = { walk: Footprints, drive: Car, transit: TrainFront };
const MODE_LABEL: Record<TravelMode, string> = {
  walk: "walk",
  drive: "drive",
  transit: "transit",
};

// The protagonist of the workspace. Cards slide up in sequence as the final
// theater act ("Building your itinerary") completes.
export function Timeline({
  plan,
  show,
  activeId,
  onHover,
}: {
  plan: Plan;
  show: boolean;
  activeId?: string | null;
  onHover?: (id: string | null) => void;
}) {
  return (
    <motion.ol
      variants={staggerContainer(0.12)}
      initial="hidden"
      animate={show ? "show" : "hidden"}
      className="flex flex-col"
    >
      {plan.items.map((item, i) => (
        <li key={item.id}>
          {item.travelFromPrev && <TravelConnector leg={item.travelFromPrev} />}
          <ActivityCard
            item={item}
            index={i}
            currency={plan.currency}
            active={activeId === item.id}
            onHover={onHover}
          />
        </li>
      ))}
    </motion.ol>
  );
}

function TravelConnector({ leg }: { leg: NonNullable<TimelineItem["travelFromPrev"]> }) {
  const Icon = MODE_ICON[leg.mode];
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { duration: 0.4 } },
      }}
      className="flex items-center gap-2 py-1.5 pl-[1.6rem] text-xs text-muted"
    >
      <span className="flex h-6 w-px justify-center bg-line" />
      <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
      <span>
        {leg.minutes} min {MODE_LABEL[leg.mode]}
      </span>
    </motion.div>
  );
}

function ActivityCard({
  item,
  index,
  currency,
  active,
  onHover,
}: {
  item: TimelineItem;
  index: number;
  currency: string;
  active: boolean;
  onHover?: (id: string | null) => void;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 18, filter: "blur(6px)" },
        show: { opacity: 1, y: 0, filter: "blur(0px)", transition: spring.settle },
      }}
      onHoverStart={() => onHover?.(item.id)}
      onHoverEnd={() => onHover?.(null)}
      whileHover={{ y: -2 }}
      className={[
        "group relative flex gap-3.5 rounded-2xl border bg-surface p-3.5 transition-shadow",
        active ? "border-primary/40 shadow-lift" : "border-line shadow-card hover:shadow-lift",
      ].join(" ")}
    >
      {/* Numbered icon badge */}
      <div className="relative shrink-0">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary-ink">
          <ActivityIcon type={item.type} className="h-5 w-5" />
        </div>
        <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white ring-2 ring-surface">
          {index + 1}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-[15px] font-semibold text-ink">{item.title}</h3>
            <p className="truncate text-sm text-ink-soft">
              {item.place.name}{" "}
              <span className="text-muted">· {item.place.neighborhood}</span>
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-bg px-2 py-0.5 text-xs font-semibold tabular-nums text-ink-soft">
            {item.costPerPerson === 0 ? "Free" : `${currency}${item.costPerPerson}`}
          </span>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
          <span className="inline-flex items-center gap-1 font-medium text-ink-soft">
            <Clock className="h-3.5 w-3.5" strokeWidth={1.75} />
            {formatTime(item.start)}
          </span>
          <span>{formatDuration(item.start, item.end)}</span>
          <span className="inline-flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-sunset text-sunset" strokeWidth={0} />
            {item.place.rating}
          </span>
        </div>

        {/* The "why" — the line that makes the AI feel considered. */}
        <div className="mt-2.5 flex items-start gap-1.5 rounded-xl bg-primary-soft/60 px-2.5 py-1.5">
          <span className="mt-px text-xs">✦</span>
          <p className="text-xs leading-relaxed text-primary-ink">{item.why}</p>
        </div>
      </div>
    </motion.div>
  );
}
