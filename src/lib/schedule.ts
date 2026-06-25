import type { TimelineItem, TravelLeg } from "./types";
import { toMinutes, fromMinutes } from "./time";

// When a user drags a card to a new position, the day must stay coherent —
// times march forward, the first stop has no inbound travel, and every other
// stop keeps a plausible hop from the one before it. This is intentionally
// minimal: it re-sequences the schedule so drag never *looks* broken, without
// reaching into full retime/swap editing (that lands in a later step).

/** A sensible default hop when an item lands first and loses its original leg. */
const DEFAULT_LEG: TravelLeg = { minutes: 10, mode: "drive" };

/**
 * Re-flows start/end times and travel connectors for a (possibly reordered)
 * list of items. Each activity keeps its own duration and its own inbound
 * travel cost; only the anchoring and the first-leg removal change. Order and
 * item identity are preserved, so this is safe to feed straight back into the
 * map and the reorder list.
 */
export function resequence(items: TimelineItem[], dayStart: string): TimelineItem[] {
  let cursor = toMinutes(dayStart);

  return items.map((item, i) => {
    const leg = i === 0 ? null : item.travelFromPrev ?? DEFAULT_LEG;
    const duration = Math.max(0, toMinutes(item.end) - toMinutes(item.start));

    if (leg) cursor += leg.minutes;
    const start = cursor;
    const end = start + duration;
    cursor = end;

    return {
      ...item,
      start: fromMinutes(start),
      end: fromMinutes(end),
      travelFromPrev: leg,
    };
  });
}
