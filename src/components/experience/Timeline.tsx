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
      variants={staggerContainer(0.08)}
      initial="hidden"
      animate={show ? "show" : "hidden"}
      className="flex flex-col gap-1.5"
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
        show: { opacity: 1, transition: { duration: 0.35 } },
      }}
      className="flex items-center gap-1.5 py-0.5 pl-[1.45rem] text-[11px] text-muted"
    >
      <span className="h-4 w-px bg-line" />
      <Icon className="h-3 w-3" strokeWidth={1.75} />
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
        hidden: { opacity: 0, y: 12, filter: "blur(4px)" },
        show: {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          transition: spring.settle,
        },
      }}
      onHoverStart={() => onHover?.(item.id)}
      onHoverEnd={() => onHover?.(null)}
      className={[
        "group relative flex gap-3 rounded-xl border bg-surface p-3 transition-[border-color,box-shadow] duration-200",
        active
          ? "border-primary/35 shadow-lift"
          : "border-line hover:border-primary/20 hover:shadow-card",
      ].join(" ")}
    >
      <div className="relative shrink-0">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-soft text-primary-ink">
          <ActivityIcon type={item.type} className="h-4 w-4" />
        </div>
        <span className="absolute -right-1 -top-1 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white ring-2 ring-surface">
          {index + 1}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-ink">{item.title}</h3>
            <p className="truncate text-xs text-ink-soft">
              {item.place.name}{" "}
              <span className="text-muted">· {item.place.neighborhood}</span>
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-bg px-2 py-0.5 text-[11px] font-semibold tabular-nums text-ink-soft">
            {item.costPerPerson === 0 ? "Free" : `${currency}${item.costPerPerson}`}
          </span>
        </div>

        <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11px] text-muted">
          <span className="inline-flex items-center gap-1 font-medium text-ink-soft">
            <Clock className="h-3 w-3" strokeWidth={1.75} />
            {formatTime(item.start)}
          </span>
          <span>{formatDuration(item.start, item.end)}</span>
          <span className="inline-flex items-center gap-0.5">
            <Star className="h-3 w-3 fill-sunset text-sunset" strokeWidth={0} />
            {item.place.rating}
          </span>
        </div>

        <div className="mt-2 flex items-start gap-1.5 rounded-lg bg-primary-soft/50 px-2 py-1.5">
          <span className="mt-px text-[10px] text-primary">✦</span>
          <p className="text-[11px] leading-relaxed text-primary-ink">{item.why}</p>
        </div>
      </div>
    </motion.div>
  );
}
