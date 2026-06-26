"use client";

import { useEffect, useMemo } from "react";
import { Reorder, useDragControls, AnimatePresence, motion } from "framer-motion";
import { Star, Car, Footprints, TrainFront, Clock, GripVertical } from "lucide-react";
import type { TimelineItem, TravelMode } from "@/lib/types";
import { ActivityIcon } from "@/components/shared/ActivityIcon";
import { formatTime, formatDuration } from "@/lib/time";
import { spring } from "@/lib/motion";

const MODE_ICON = { walk: Footprints, drive: Car, transit: TrainFront };
const MODE_LABEL: Record<TravelMode, string> = {
  walk: "walk",
  drive: "drive",
  transit: "transit",
};

// The protagonist of the workspace. Cards settle in on the reveal, reorder by
// drag, and — once refinements arrive — animate only the parts that changed:
// added stops slide in, swapped stops cross-fade in place, and revised cards
// carry a brief "Revised" mark so the edit reads as a considered revision.
export function Timeline({
  items,
  display,
  show,
  activeId,
  onHover,
  onReorder,
  revisedIds = [],
  enteringIds = [],
  revisionKey = 0,
}: {
  items: TimelineItem[];
  display: TimelineItem[];
  show: boolean;
  activeId?: string | null;
  onHover?: (id: string | null) => void;
  onReorder: (items: TimelineItem[]) => void;
  /** Items touched by the last refinement — flagged as freshly revised. */
  revisedIds?: string[];
  /** Newly inserted items — these animate in rather than just appear. */
  enteringIds?: string[];
  /** Bumps on each refinement so repeats still re-trigger the highlight. */
  revisionKey?: number;
}) {
  const displayById = useMemo(
    () => new Map(display.map((d) => [d.id, d])),
    [display],
  );

  // After a refinement, draw the eye to the change: bring the first affected
  // card into view so the user actually watches it update (the refine bar lives
  // below the fold). Keyed on revisionKey so it fires once per refinement.
  useEffect(() => {
    if (!revisionKey) return;
    const focusId = enteringIds[0] ?? revisedIds[0];
    if (!focusId) return;
    // Defer past the click's own scroll and the whisper's height animation so
    // ours is the final, decisive scroll.
    const t = setTimeout(() => {
      document
        .querySelector(`[data-card="${focusId}"]`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 80);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revisionKey]);

  return (
    <Reorder.Group
      as="ol"
      axis="y"
      values={items}
      onReorder={onReorder}
      className="flex flex-col"
    >
      {items.map((item, i) => (
        <TimelineCard
          key={item.id}
          item={item}
          display={displayById.get(item.id) ?? item}
          index={i}
          show={show}
          showConnector={i > 0}
          currency="$"
          active={activeId === item.id}
          revised={revisedIds.includes(item.id)}
          entering={enteringIds.includes(item.id)}
          revisionKey={revisionKey}
          onHover={onHover}
        />
      ))}
    </Reorder.Group>
  );
}

function TravelConnector({
  leg,
  revised,
}: {
  leg: NonNullable<TimelineItem["travelFromPrev"]>;
  revised: boolean;
}) {
  const Icon = MODE_ICON[leg.mode];
  return (
    <div
      className={[
        "flex items-center gap-2 py-1.5 pl-[1.6rem] text-xs transition-colors",
        revised ? "text-primary" : "text-muted",
      ].join(" ")}
    >
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
  show,
  showConnector,
  currency,
  active,
  revised,
  entering,
  revisionKey,
  onHover,
}: {
  item: TimelineItem;
  display: TimelineItem;
  index: number;
  show: boolean;
  showConnector: boolean;
  currency: string;
  active: boolean;
  revised: boolean;
  entering: boolean;
  revisionKey: number;
  onHover?: (id: string | null) => void;
}) {
  const controls = useDragControls();

  return (
    <Reorder.Item
      as="li"
      value={item}
      data-card={item.id}
      layout="position"
      dragListener={false}
      dragControls={controls}
      initial={{ opacity: 0, y: entering ? -6 : 14, height: entering ? 0 : "auto", filter: "blur(4px)" }}
      animate={
        show
          ? { opacity: 1, y: 0, height: "auto", filter: "blur(0px)" }
          : { opacity: 0, y: 14, filter: "blur(4px)" }
      }
      transition={{ ...spring.settle, delay: entering ? 0 : index * 0.06 }}
      onPointerEnter={() => onHover?.(item.id)}
      onPointerLeave={() => onHover?.(null)}
      whileDrag={{ scale: 1.015, boxShadow: "0 14px 32px -14px rgba(23,23,31,0.24)" }}
      className="select-none"
    >
      {showConnector && display.travelFromPrev && (
        <TravelConnector leg={display.travelFromPrev} revised={revised} />
      )}

      <motion.div
        animate={{ y: active ? -1 : 0 }}
        transition={spring.gentle}
        className={[
          "group relative flex gap-3.5 rounded-2xl border bg-surface p-3.5 transition-[box-shadow,border-color] duration-300",
          revised
            ? "border-primary/40 shadow-lift ring-2 ring-primary/15"
            : active
              ? "border-primary/30 shadow-lift"
              : "border-line shadow-card hover:border-primary/20",
        ].join(" ")}
      >
        {/* "Revised" mark — a quiet acknowledgement that the AI just edited this. */}
        <AnimatePresence>
          {revised && (
            <motion.span
              key={revisionKey}
              initial={{ opacity: 0, scale: 0.9, y: -2 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={spring.gentle}
              className="absolute -top-2 right-3 z-10 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white shadow-card"
            >
              Revised
            </motion.span>
          )}
        </AnimatePresence>

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

        {/* Content cross-fades when the activity itself changes (a swap), but not
            when only its timing shifts (a reorder). Keyed on identity, not time. */}
        <motion.div
          key={`${item.id}:${item.title}:${item.place.name}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35 }}
          className="min-w-0 flex-1"
        >
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
        </motion.div>
      </motion.div>
    </Reorder.Item>
  );
}
