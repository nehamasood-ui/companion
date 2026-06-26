# Companion — Changelog

The living history of Companion. Newest milestone on top. Each entry covers what
was built, the product decisions behind it, tradeoffs taken, known limitations,
and a recommendation for what to tackle next.

---

## v0.3 — Calm & cohesion (workspace foundation)

_Branch: `claude/m1-calm-cohesion` · Milestone M1 of the post-pivot roadmap_

### Context: a deliberate pivot
Using the v0.2 build surfaced a sharper thesis: **the magic is iteration, not
collaboration.** Once the first draft appears, the instinct is to refine it
("replace painting with pottery", "make it more scenic", "keep it under $50"),
not to share it. So the product is being re-centered on **collaborating with the
plan itself** — a living document that evolves through follow-up requests —
with human collaboration repositioned as the earned next chapter rather than the
opening act. M1 is the calm, cohesive foundation that the iteration loop (M2)
and export/handoff (M3) will land into.

### What was built
- **Calmer motion.** Removed the infinitely pulsing map pin; the active pin now
  uses a soft static halo + thin ring on a white fill (no heavy solid fill, no
  loop), with a gentler hover scale (1.22 → 1.08). Card hover lift softened
  (−2 → −1px) onto a calmer ring transition, and the shared spring vocabulary
  (`motion.ts`) was de-energized (settle 320→240, snappy 480→340 stiffness).
- **One cohesive workspace.** Replaced the floating "Make it more…" pill with an
  in-flow structure: header → (timeline · ambient sticky map) → a full-width
  "evolve & use" zone. Consistent radii, a tightened spacing rhythm (gap-3), and
  less dead padding pull the pieces into one surface.
- **Slots for what's next.** A **Refinement bar** (NL input affordance + the old
  chips reframed as *suggested prompts*) and an **Export bar** (Google/Apple
  Maps · Copy · Share). Both are visibly present but **inert in M1**, labeled
  "Preview" — they establish the home and the feel; M2/M3 wire the behavior.

### Key product decisions
- **Cohesion, not compression.** "Tighten the whitespace" was interpreted as
  establishing rhythm and a shared container — not cramming. The premium calm is
  the point; density serves it.
- **Build the inert slots now.** You can't fairly judge cohesion without all the
  pieces present, so the refinement and export zones were built as polished
  previews rather than left as empty space.
- **Sequenced the pivot.** Calm/cohesion (M1) ships before the refinement loop
  (M2) so the high-craft partial-update animation lands in a settled workspace
  instead of fighting layout and over-animation at the same time.

### Tradeoffs made
- The refinement and export bars are **non-functional** this milestone. The risk
  is they read as unfinished; the "Preview" tags and resting-muted styling are
  there to set that expectation honestly.
- Moving the slots to a full-width zone below the grid means the **ambient map
  (sticky, fixed height) is shorter than the timeline**, leaving some empty space
  to its lower-right on wide desktop. In real use the map stays pinned as you
  scroll, and keeping it ambient (vs. a tall map competing with the timeline) is
  on-thesis — but it's a visible gap in a static full-page view.

### Known limitations
- On desktop the refinement bar sits below the fold (the timeline is tall). Fine
  for a foundation, but the iteration loop is the headline — M2 should consider
  making it more immediately reachable (e.g. a sticky refine affordance).
- Inert slots only; no behavior, no partial-update animation yet.
- Motion tone-down was verified by eye on captured states, not via a
  side-by-side before/after on a physical device.

### Recommended next — M2: the refinement loop
- A natural-language refine input with the chips as guardrails, backed by a
  **curated intent engine** (deterministic, hand-tuned diffs) so demo-mode magic
  never breaks on stage — architected behind one interface so live Claude can
  slot in later.
- The craft centerpiece: **partial-update animation.** Explicit diff op types
  (replace-in-place / add / remove / retime) so a refinement morphs only the
  affected cards and nudges the budget — never a full re-settle. Distinguish
  *targeted* edits (one card) from *global* ones (a few cards + budget shift).

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
