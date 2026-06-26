import type { TimelineItem } from "@/lib/types";

// Curated alternatives the demo-mode refinement engine swaps in. Each is a
// hand-tuned, plausible San Francisco option so a follow-up request always
// resolves to something considered — never a placeholder.

/** Fields an alternative overrides; the original slot keeps its id + timing. */
export type AltActivity = Pick<
  TimelineItem,
  "type" | "title" | "place" | "costPerPerson" | "why"
>;

export const potteryAlt: AltActivity = {
  type: "art",
  title: "Pottery wheel session",
  place: {
    name: "Clay by the Bay",
    neighborhood: "Hayes Valley",
    lat: 37.7762,
    lng: -122.4245,
    category: "Pottery studio",
    rating: 4.8,
    priceLevel: 2,
  },
  costPerPerson: 38,
  why: "Hands-on wheel-throwing class — each of you takes home a finished piece.",
};

export const sushiAlt: AltActivity = {
  type: "food",
  title: "Sushi dinner",
  place: {
    name: "Ju-Ni",
    neighborhood: "Lower Haight",
    lat: 37.7715,
    lng: -122.4365,
    category: "Omakase sushi",
    rating: 4.9,
    priceLevel: 3,
  },
  costPerPerson: 45,
  why: "Intimate 12-seat omakase — a celebratory close to the day.",
};

/** Cheaper stand-ins, keyed by the slot type we're trimming. */
export const cheaperArtAlt: AltActivity = {
  type: "art",
  title: "Community art jam",
  place: {
    name: "Root Division",
    neighborhood: "Mission",
    lat: 37.7665,
    lng: -122.4185,
    category: "Open studio",
    rating: 4.6,
    priceLevel: 1,
  },
  costPerPerson: 12,
  why: "Drop-in studio session — the same creative hour together, a fraction of the cost.",
};

export const cheaperFoodAlt: AltActivity = {
  type: "food",
  title: "Taqueria dinner",
  place: {
    name: "La Taqueria",
    neighborhood: "Mission",
    lat: 37.7509,
    lng: -122.4181,
    category: "Tacos",
    rating: 4.7,
    priceLevel: 1,
  },
  costPerPerson: 14,
  why: "City-famous burritos — generous, shareable, and easy on the budget.",
};

export const scenicAlt: AltActivity = {
  type: "walk",
  title: "Hilltop viewpoint",
  place: {
    name: "Corona Heights Park",
    neighborhood: "Castro",
    lat: 37.7654,
    lng: -122.4385,
    category: "Lookout",
    rating: 4.8,
    priceLevel: 1,
  },
  costPerPerson: 0,
  why: "Trade the indoor hour for a short climb to 360° city-and-bay views — free and unforgettable.",
};

/** A full item, inserted near the start of the day. */
export const brunchStop: TimelineItem = {
  id: "i-brunch",
  type: "food",
  title: "Brunch",
  place: {
    name: "Plow",
    neighborhood: "Potrero Hill",
    lat: 37.7576,
    lng: -122.3967,
    category: "Brunch",
    rating: 4.7,
    priceLevel: 2,
  },
  start: "11:00",
  end: "12:00",
  costPerPerson: 24,
  why: "Famous lemon-ricotta pancakes — a leisurely sit-down before the studio.",
  travelFromPrev: { minutes: 8, mode: "walk" },
};
