"use client";

import { motion } from "framer-motion";
import type { Collaborator } from "@/lib/types";
import { spring } from "@/lib/motion";

export function PartyAvatars({
  people,
  show = true,
  size = 32,
}: {
  people: Collaborator[];
  show?: boolean;
  size?: number;
}) {
  return (
    <div className="flex items-center -space-x-2.5">
      {people.map((p, i) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 0, scale: 0.4, x: -6 }}
          animate={show ? { opacity: 1, scale: 1, x: 0 } : { opacity: 0, scale: 0.4 }}
          transition={{ ...spring.settle, delay: show ? i * 0.08 : 0 }}
          className="flex items-center justify-center rounded-full font-semibold text-white ring-2 ring-surface"
          style={{
            width: size,
            height: size,
            background: p.color,
            fontSize: size * 0.36,
            zIndex: people.length - i,
          }}
          title={p.name}
        >
          {p.initials}
        </motion.div>
      ))}
    </div>
  );
}

export function VibeTags({ vibes, show = true }: { vibes: string[]; show?: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {vibes.map((v, i) => (
        <motion.span
          key={v}
          initial={{ opacity: 0, y: 6 }}
          animate={show ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
          transition={{ ...spring.gentle, delay: show ? 0.2 + i * 0.07 : 0 }}
          className="rounded-full border border-line bg-surface px-2.5 py-1 text-xs font-medium text-ink-soft"
        >
          {v}
        </motion.span>
      ))}
    </div>
  );
}
