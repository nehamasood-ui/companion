import type { Transition, Variants } from "framer-motion";

// Shared spring vocabulary. Everything in Companion moves with the same
// physical personality so the product feels like one considered object.

export const spring = {
  // The default — gentle, premium, slightly weighted.
  gentle: { type: "spring", stiffness: 210, damping: 26, mass: 0.9 } as Transition,
  // For things that should land softly into place (cards settling). Tuned to
  // arrive without overshoot — calm and deliberate, never bouncy.
  settle: { type: "spring", stiffness: 240, damping: 30, mass: 1 } as Transition,
  // Quiet micro-interactions for hover/press. Deliberately restrained.
  snappy: { type: "spring", stiffness: 340, damping: 32 } as Transition,
};

export const ease = {
  out: [0.16, 1, 0.3, 1] as [number, number, number, number],
  inOut: [0.65, 0, 0.35, 1] as [number, number, number, number],
};

/** Container that reveals children in a soft stagger. */
export const staggerContainer = (stagger = 0.08, delay = 0): Variants => ({
  hidden: {},
  show: {
    transition: { staggerChildren: stagger, delayChildren: delay },
  },
});

/** A child that rises and fades into place. */
export const riseIn: Variants = {
  hidden: { opacity: 0, y: 14, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: ease.out },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.5, ease: ease.out } },
};
