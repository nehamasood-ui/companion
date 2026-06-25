"use client";

import { motion } from "framer-motion";
import { Minus, Plus, Users } from "lucide-react";
import { spring } from "@/lib/motion";

export function PartyStepper({
  value,
  onChange,
  min = 1,
  max = 12,
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
}) {
  const set = (n: number) => onChange(Math.min(max, Math.max(min, n)));

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-line bg-surface px-2 py-1.5 text-ink-soft shadow-card">
      <Users className="ml-1.5 mr-0.5 h-4 w-4 text-muted" strokeWidth={1.75} />
      <StepButton label="Fewer people" onClick={() => set(value - 1)} disabled={value <= min}>
        <Minus className="h-4 w-4" strokeWidth={2} />
      </StepButton>
      <div className="min-w-[2.5rem] text-center text-sm font-semibold tabular-nums text-ink">
        {value}
        <span className="ml-1 text-xs font-normal text-muted">{value === 1 ? "person" : "people"}</span>
      </div>
      <StepButton label="More people" onClick={() => set(value + 1)} disabled={value >= max}>
        <Plus className="h-4 w-4" strokeWidth={2} />
      </StepButton>
    </div>
  );
}

function StepButton({
  children,
  onClick,
  disabled,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      whileTap={{ scale: 0.88 }}
      transition={spring.snappy}
      className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-primary-soft hover:text-primary-ink disabled:cursor-not-allowed disabled:opacity-30"
    >
      {children}
    </motion.button>
  );
}
