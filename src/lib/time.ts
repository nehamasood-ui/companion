// Tiny time helpers for the read-only itinerary. Times are "HH:MM" 24h strings.

function toMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

/** "10:00" -> "10:00 AM" */
export function formatTime(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, "0")} ${period}`;
}

/** Human duration between two times, e.g. "2 hr" or "45 min". */
export function formatDuration(start: string, end: string): string {
  const mins = toMinutes(end) - toMinutes(start);
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h} hr` : `${h} hr ${m} min`;
}
