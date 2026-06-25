# Companion — Changelog

The living history of Companion. Newest milestone on top. Each entry covers what
was built, the product decisions behind it, tradeoffs taken, known limitations,
and a recommendation for what to tackle next.

---

## v0.2 — Editable timeline + bidirectional map↔timeline linkage

_Branch: `claude/blissful-lamport-9gxohj` · Roadmap steps 4–5_

### What was built
- **Editable, draggable timeline.** Cards now read as movable: a grip handle
  fades in on hover, and cards reorder with a spring via Framer Motion's
  built-in `Reorder`. Drag is bound to the handle only, so text selection and
  hover linkage stay intact.
- **A coherent day on reorder.** `lib/schedule.ts` `resequence()` re-flows start/
  end times and travel connectors whenever the order changes, so a reordered day
  never reads as broken. The map route and pin numbers redraw live as you drag.
- **Bidirectional linkage.** Hovering a timeline card lifts and pulses its map
  pin (existing direction, now with a looping halo); hovering a map pin lifts and
  highlights its timeline card (new reverse direction), with a generous
  transparent hit area for easy targeting.
- **Visual review artifacts.** `docs/screenshots/v0.2/` (landing, mid-theater,
  final desktop + mobile, both hover states, mid-drag) and a 13s demo in
  `docs/videos/` (webm + gif).

### Key product decisions
- **Framer Motion `Reorder` over dnd-kit.** dnd-kit is the roadmap's named choice
  (step 6), but it's a new dependency and a heavier interaction model. `Reorder`
  ships with a dependency we already use, inherits our spring vocabulary, and gave
  a clean handle-bound drag with live layout — the premium feel without the weight.
  We can revisit dnd-kit if/when reorder needs richer affordances (multi-select,
  keyboard DnD, cross-list).
- **Keep the map ambient, the timeline the protagonist.** Pins respond to the
  timeline but never compete with it — the reverse link lifts the card rather than
  opening anything on the map.
- **Scope discipline.** This milestone deliberately stops at reorder. Retime-by-
  drag, swap, and vote (full step 6) were left out to keep the surface small and
  polished rather than broad and half-built.

### Tradeoffs made
- **Reorder recompute is plausible, not real.** `resequence()` keeps each activity's
  own duration and its own inbound travel leg, anchors the day to the original
  start, and drops the first leg. So times stay monotonic and sensible, but travel
  durations don't reflect the *actual* geography between the new neighbors. This is
  the honest demo-mode fib; a live mode would need a real travel matrix.
- **Reordered order is ephemeral.** It lives in component state, not the persisted
  store, so a reload returns to the curated order. Acceptable for a demo; see below.

### Known limitations
- Reload does not preserve a reordered day — mild tension with the PRD edge-case
  table ("reload mid-session → persisted"), which currently holds only for the
  original generated plan, not subsequent edits.
- No keyboard-accessible reordering yet (drag is pointer-only). The grip is a real
  `<button>` with an aria-label, but arrow-key reordering isn't wired.
- The active pin uses a solid fill on hover — readable, but slightly heavier than
  the timeline's subtle lift; worth a design pass if we tighten the visual system.
- Interactions were verified by driving the real app headlessly (Chromium), but
  not on a physical touch device; touch-drag should be sanity-checked on a phone.

### Recommended next
- **AI whisper on edit** (roadmap step 7, pulled earlier). The PRD's soul is "AI
  helped without being asked." A single anchored, dismissible whisper that reacts
  to a reorder — e.g. _"Moving dinner earlier frees the sunset window"_ — is cheap,
  high-signal, and reinforces the thesis far more than full drag/collaboration. I'd
  prioritize this over breadth.
- If we instead deepen editing first: persist edits to the store and add swap/
  remove before retime — and only then consider a real travel model so recompute
  stops being a fib.

---
