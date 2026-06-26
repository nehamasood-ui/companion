// Core domain types for Companion.
// V1 is demo-mode only: plans are deterministic, sourced from curated mock data.

export type ActivityType =
  | "coffee"
  | "art"
  | "walk"
  | "food"
  | "sunset"
  | "custom";

export type TravelMode = "walk" | "drive" | "transit";

export interface Place {
  name: string;
  neighborhood: string;
  lat: number;
  lng: number;
  category: string;
  rating: number;
  priceLevel: 1 | 2 | 3 | 4;
}

export interface TravelLeg {
  minutes: number;
  mode: TravelMode;
}

export interface TimelineItem {
  id: string;
  type: ActivityType;
  title: string;
  place: Place;
  /** 24h clock, e.g. "10:00" */
  start: string;
  end: string;
  costPerPerson: number;
  /** The one-line rationale that makes the AI feel considered. */
  why: string;
  /** Travel from the previous item to this one. null for the first item. */
  travelFromPrev: TravelLeg | null;
}

export interface Collaborator {
  id: string;
  name: string;
  /** Two-letter initials for the avatar. */
  initials: string;
  /** Tailwind-friendly hex used for the avatar background. */
  color: string;
}

export interface Plan {
  id: string;
  title: string;
  city: string;
  partySize: number;
  budgetPerPerson: number;
  currency: string;
  /** Human-readable date label. */
  dateLabel: string;
  weather: { tempF: number; summary: string };
  vibes: string[];
  collaborators: Collaborator[];
  items: TimelineItem[];
  /** Overall transport character of the day. Refinements can shift this. */
  routeMode?: "mixed" | "walk";
}

/** Captures the raw intent from the landing prompt. */
export interface PlanRequest {
  prompt: string;
  partySize: number;
  vibes: string[];
}
