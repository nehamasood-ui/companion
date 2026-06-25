# Companion

An AI-powered **collaborative planning workspace** — _"Figma for planning experiences."_

AI gets a group from a blank page to a great first draft. Humans then collaborate to make it
their own. AI is the facilitator, not the author.

> **V1 is a polished proof of concept.** Demo-mode only: no backend, no auth, no database, no
> live AI calls. Every prompt reveals a curated San Francisco "girls' day" so the magic fires
> reliably. See [`docs/prd.md`](./docs/prd.md) for the full product spec and roadmap.

## What's built (steps 1–3)

- **Foundation** — Next.js 14 + TS strict, Tailwind design tokens, Zustand store, typed
  domain model, curated SF mock dataset.
- **Landing / Prompt** — calm dawn-gradient hero, typewriter placeholder, vibe chips, party
  stepper. Empty input never dead-ends.
- **Workflow Theater** — a 5-act AI workflow that *assembles the real UI as it plays*
  (avatars → weather chip → map pins drop → route draws → itinerary cards settle), then
  cross-fades into a linked timeline + ambient SVG map with a live budget tally.

## Getting started

```bash
cd companion
npm install
npm run dev      # http://localhost:3000
```

```bash
npm run build    # production build
npm run lint
```

## Stack

Next.js 14 (App Router) · TypeScript (strict) · Tailwind CSS · Framer Motion · Zustand ·
lucide-react. The map is a self-contained styled SVG — no map tiles or API keys required.

## Structure

```
src/
  app/                 # routes: / (landing), /plan (theater → experience)
  components/
    landing/           # PromptHero, VibeChips, PartyStepper
    theater/           # WorkflowTheater, StepTicker, StylizedMap, WeatherChip
    experience/        # PlanHeader, Timeline, PartyAvatars, BudgetTally
    shared/            # ActivityIcon
  data/sf.ts           # curated showcase plan
  lib/                 # types, store, motion presets, theater clock, geo, time
docs/prd.md            # product spec (living document)
```
