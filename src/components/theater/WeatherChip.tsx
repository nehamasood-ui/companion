"use client";

import { motion } from "framer-motion";
import { Sun } from "lucide-react";
import { spring } from "@/lib/motion";

export function WeatherChip({
  tempF,
  summary,
  show,
}: {
  tempF: number;
  summary: string;
  show: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.9 }}
      animate={show ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: -8, scale: 0.9 }}
      transition={spring.settle}
      className="inline-flex items-center gap-2 rounded-full border border-sunset/20 bg-sunset-soft px-3 py-1.5 text-sm font-medium text-ink shadow-card"
    >
      <Sun className="h-4 w-4 text-sunset" strokeWidth={2} />
      <span className="tabular-nums">{tempF}°</span>
      <span className="text-ink-soft">{summary}</span>
    </motion.div>
  );
}
