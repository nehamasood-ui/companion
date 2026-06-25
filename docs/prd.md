# Companion — Product Requirements & Build Plan (V1)

> A living document. We refine this as we build.
> Status: **Steps 1–3 implemented** (Foundation · Landing/Prompt · Workflow Theater).

---

## 1. Vision

Companion is an AI-powered **collaborative planning workspace** — "Figma for planning experiences."

The problem isn't generating an itinerary; ChatGPT does that. The problem is that
planning *with other people* is fragmented across ChatGPT, Maps, Notes, Calendar,
group chats, and TikTok. Companion is the one place a group actually **makes decisions**.

**Core philosophy:** AI gets a group from a blank page to a great first draft.
Humans then collaborate to make it their own. AI is the *facilitator*, not the author.

**The feeling we sell:** _"It already knows what we meant — now we're just making it ours."_
Emotional arc: blank anxiety → relief (a real draft appeared) → ownership (we shaped it)
→ quiet delight (it helped without being asked).

**Success metric:** within 30 seconds a viewer thinks _"why doesn't this already exist?"_

---

## 2. Product principles

1. **Decisions over options.** One confident draft, trivially editable — not five to choose from. Confidence is the product.
2. **AI as objects + whispers, never a chat box.** AI produces place cards, time blocks, routes, and one-line contextual nudges. No chat thread in the hero flow.
3. **The plan is a living document.** Every element looks touchable from second one.
4. **The map is ambient evidence; the timeline is the protagonist.** They're bidirectionally linked — hover one, the other responds. That linkage *is* the "Figma" feel.
5. **Every place card carries a "why."** It's what makes the AI feel considered.
6. **Calm, premium, AI-native.** Linear × Arc × Notion × Apple. Subtle, intentional motion.

---

## 3. The hero decision

Two magic moments exist: **(1) the generation reveal** and **(2) the collaboration.**
For a first-time viewer with no friends in the room, the reveal is the hero and
collaboration is the proof. **Build weight ~70/30 toward generation + reveal.**
Collaboration ships later as a *choreographed cutscene*, not a half-built sandbox.

---

## 4. The reveal must be honest theater

The "🧠 Understanding → ☀️ Weather → 📍 Places → 🗺 Route → 📅 Itinerary" sequence is the soul.
The trap is a decorative spinner. The fix: **each act assembles a real, persisting piece
of the workspace.** Weather → a chip materializes and stays. Places → pins drop onto the map.
Route → the line draws. Itinerary → cards slide into place. By the end the workflow hasn't
been a curtain — it has *built the UI in front of you.* The reveal is a **settle, not a cut.**

The theater clock is **fully client-side and time-boxed** — it never waits on a network
call, so the reveal always plays at the same considered pace. (Critical for live demos.)

---

## 5. MVP scope

**In (V1 proof of concept):**
Landing page · prompt input · animated AI workflow · generated itinerary · beautiful map ·
editable timeline · (later) fake collaborator avatars/comments.

**Out:** auth · backend · database · real-time sync · payments · notifications · reservations ·
travel mode · safety · marketplace · community · profiles.

**Generation:** **demo-mode first** — a curated SF plan is revealed deterministically for any
prompt, so the magic always fires. Optional live Claude mode (structured output + fallback)
is a *later* enhancement, never a dependency.

---

## 6. Screens

### S1 — Landing / Prompt _(built)_
Calm animated dawn-gradient backdrop. Headline "Describe the day you want." One large
auto-growing textarea with a typewriter placeholder cycling real examples. Vibe chips +
people stepper. "Plan it →" (Enter submits). Footer: "No account needed." Empty input never
dead-ends — it falls back to the showcase prompt.

### S2 — Workflow Theater _(built)_
Five-act checklist plays on the left while the map fills with pins + route on the right and
the header builds (avatars, vibes, weather). On completion the checklist cross-fades into the
real itinerary. Skippable via "Skip to plan." Honors `prefers-reduced-motion` (brief settle).

### S3 — Generated Experience _(foundation built; editing later)_
Linked **timeline** (numbered activity cards: time, place, cost, rating, travel connector,
and a "why" line) + ambient **map** (numbered pins, drawn route). Header shows title, date,
party, weather, and a **live budget tally** (green → amber → red). Hovering a card highlights
its map pin.

### S4 — Editing _(planned)_
Drag to reorder/retime (route + travel + budget recompute live); swap activity; vote.

### S5 — Collaboration cutscene _(planned)_
Choreographed: avatars join, a cursor drags dinner later, an AI whisper reacts, a vote ticks,
an Instagram reel paste resolves into a place card.

---

## 7. Edge cases & handling

| Case | Handling | Status |
|---|---|---|
| Empty / garbage prompt | Falls back to showcase prompt; vibe chips carry intent. Never an error. | ✅ |
| Direct nav to `/plan` | Falls back to curated SF plan. | ✅ |
| Reduced motion | Cross-fades instead of physics; brief settle. | ✅ |
| Reload mid-session | Request + plan persisted to `localStorage` (Zustand persist). | ✅ |
| Map tiles fail/offline | Map is a self-contained styled **SVG** — no live tiles to fail. | ✅ |
| Slow network | Theater clock is client-side; never stutters. | ✅ |
| Over budget | Tally turns amber/red — edge case becomes a feature. | ✅ |
| Mobile | Map stacks above the timeline; layout reflows. | ✅ |

---

## 8. Technical architecture

Client-only, statically hostable. No backend, no auth, no sockets.

```
Next.js 14 (App Router, TS strict)
  /            Landing + prompt
  /plan        Workflow theater → generated experience
State          Zustand + localStorage persistence
Generation     DEMO MODE: deterministic curated SF plan (instant, offline-safe)
               (LIVE MODE via Claude Edge route + fallback — later, flagged)
Map            Self-contained styled SVG (pins + drawn route); no tile dependency
Animation      Framer Motion (springs, layout) + a time-boxed theater clock
```

**Why demo-mode-first:** the magic must fire reliably in front of an audience. The Claude
call, when added, is an enhancement gated behind a flag with a hard timeout and fallback to
demo mode — the animation is never blocked on it.

---

## 9. Libraries

| Concern | Choice | Why |
|---|---|---|
| Framework | Next.js 14 + TS strict | Static export, great DX |
| Styling | Tailwind CSS | Fast, consistent design tokens |
| Animation | Framer Motion | Springs + layout = the premium feel |
| State | Zustand (+persist) | Tiny, no boilerplate |
| Icons | lucide-react | Clean line icons |
| Font | Inter (next/font) | The Linear/Arc register; no fetch risk |
| Drag & drop | dnd-kit | _(step 6)_ accessible, springy |
| Map (real) | MapLibre GL | _(optional later)_ ambient styled tiles |
| AI (optional) | Claude API, structured output | _(later)_ live mode + fallback |

---

## 10. Roadmap

1. **Foundation** — app, tokens, types, store, SF mock data. ✅
2. **Landing / Prompt** — hero, rotating placeholder, chips, stepper. ✅
3. **Workflow Theater** — 5-act artifact-assembling reveal. ✅
4. Generated Experience — editing affordances on the timeline.
5. Map polish — richer linkage, optional real tiles.
6. Editing — dnd-kit reorder/retime + live recompute.
7. AI Whispers — anchored, dismissible, one-tap apply.
8. Collaboration cutscene — scripted multiplayer demo.
9. Remix bar — "make it more X" partial re-animate.
10. Polish — deeper a11y, mobile sheet, deploy.
11. (Optional) Live Claude mode behind a flag.

**Steps 1–5 are the "30-second wow" milestone.**

---

## 11. Open questions

- Real map tiles (MapLibre) vs. keep the bespoke SVG? SVG is more demo-safe and on-brand.
- When live mode lands: Sonnet (speed/cost for demos) vs. Opus (richest "why" copy)?
- Does the remix bar belong before collaboration in priority? (Cheap wow, high signal.)

---

## Project note

Companion lives in its own self-contained directory (`/companion`) with its own
`package.json`, configs, and dependencies — fully isolated from the unrelated app in the
parent repo. It is intended to graduate to a standalone repository.
