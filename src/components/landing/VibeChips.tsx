"use client";

import { motion } from "framer-motion";
import { spring, staggerContainer, riseIn } from "@/lib/motion";

export const VIBES = [
  "Chill",
  "Adventurous",
  "Creative",
  "Foodie",
  "Romantic",
  "Budget",
] as const;

export function VibeChips({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (vibe: string) => void;
}) {
  return (
    <motion.div
      variants={staggerContainer(0.05, 0.1)}
      initial="hidden"
      animate="show"
      className="flex flex-wrap items-center justify-center gap-2"
    >
      {VIBES.map((vibe) => {
        const active = selected.includes(vibe);
        return (
          <motion.button
            key={vibe}
            variants={riseIn}
            type="button"
            onClick={() => onToggle(vibe)}
            whileTap={{ scale: 0.95 }}
            transition={spring.snappy}
            aria-pressed={active}
            className={[
              "rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200",
              "border outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
              active
                ? "border-primary/30 bg-primary text-white shadow-glow"
                : "border-line bg-surface text-ink-soft hover:border-primary/30 hover:text-ink",
            ].join(" ")}
          >
            {vibe}
          </motion.button>
        );
      })}
    </motion.div>
  );
}
