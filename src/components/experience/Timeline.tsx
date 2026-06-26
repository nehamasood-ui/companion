"use client";

import { useMemo } from "react";
import { Reorder, useDragControls, motion } from "framer-motion";
import { Star, Car, Footprints, TrainFront, Clock, GripVertical } from "lucide-react";
import type { TimelineItem, TravelMode } from "@/lib/types";
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
// theater act ("Building your itinerary") completes, then become movable —
// grab a card by its handle to re-sequence the day; the map redraws live.
export function Timeline({
  items,
  display,
  show,
  activeId,
  onHover,
  onReorder,
}: {
  /** Ordered originals — stable identities that drive the reorder list. */
  items: TimelineItem[];
  /** Same order, with times + travel re-flowed for display. */
  display: TimelineItem[];
  show: boolean;
  activeId?: string | null;
  onHover?: (id: string | null) => void;
  onReorder: (items: TimelineItem[]) => void;
}) {
  const displayById = useMemo(
    () => new Map(display.map((d) => [d.id, d])),
    [display],
  );

  return (
    <Reorder.Group
      as="ol"
      axis="y"
      values={items}
      onReorder={onReorder}
      variants={staggerContainer(0.12)}
      initial="hidden"
      animate={show ? "show" : "hidden"}
      className="flex flex-col"
    >
      {items.map((item, i) => (
        <TimelineCard
          key={item.id}
          item={item}
          display={displayById.get(item.id) ?? item}
          index={i}
          showConnector={i > 0}
          currency="$"
          active={activeId === item.id}
          onHover={onHover}
        />
      ))}
    </Reorder.Group>
  );
}

function TravelConnector({ leg }: { leg: NonNullable<TimelineItem["travelFromPrev"]> }) {
  const Icon = MODE_ICON[leg.mode];
  return (
    <div className="flex items-center gap-2 py-1.5 pl-[1.6rem] text-xs text-muted">
      <span className="flex h-6 w-px justify-center bg-line" />
      <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
      <span>
        {leg.minutes} min {MODE_LABEL[leg.mode]}
      </span>
    </div>
  );
}

function TimelineCard({
  item,
  display,
  index,
  showConnector,
  currency,
  active,
  onHover,
}: {
  item: TimelineItem;
  display: TimelineItem;
  index: number;
  showConnector: boolean;
  currency: string;
  active: boolean;
  onHover?: (id: string | null) => void;
}) {
  const controls = useDragControls();

  return (
    <Reorder.Item
      as="li"
      value={item}
      dragListener={false}
      dragControls={controls}
      variants={{
        hidden: { opacity: 0, y: 14, filter: "blur(4px)" },
        show: { opacity: 1, y: 0, filter: "blur(0px)", transition: spring.settle },
      }}
      onPointerEnter={() => onHover?.(item.id)}
      onPointerLeave={() => onHover?.(null)}
      whileDrag={{ scale: 1.015, boxShadow: "0 14px 32px -14px rgba(23,23,31,0.24)" }}
      className="select-none"
    >
      {showConnector && display.travelFromPrev && (
        <TravelConnector leg={display.travelFromPrev} />
      )}

      <motion.div
        animate={{ y: active ? -1 : 0 }}
        transition={spring.gentle}
        className={[
          "group relative flex gap-3.5 rounded-2xl border bg-surface p-3.5 transition-[box-shadow,border-color] duration-300",
          active
            ? "border-primary/30 shadow-lift"
            : "border-line shadow-card hover:border-primary/20",
        ].join(" ")}
      >
        {/* Drag handle — reveals on hover so cards feel clearly movable. */}
        <button
          type="button"
          aria-label={`Reorder ${item.title}`}
          onPointerDown={(e) => controls.start(e)}
          className="absolute -left-1 top-1/2 flex h-8 w-6 -translate-y-1/2 cursor-grab touch-none items-center justify-center rounded-md text-muted opacity-0 transition-opacity duration-200 hover:text-ink-soft active:cursor-grabbing group-hover:opacity-100"
        >
          <GripVertical className="h-4 w-4" strokeWidth={1.75} />
        </button>

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
              {formatTime(display.start)}
            </span>
            <span>{formatDuration(display.start, display.end)}</span>
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
    </Reorder.Item>
  );
}
