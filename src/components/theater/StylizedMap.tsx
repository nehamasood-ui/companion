"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import type { Plan } from "@/lib/types";
import { projectPlaces, fitBounds, viewBoxString } from "@/lib/geo";
import { ease, spring } from "@/lib/motion";

const BASE_W = 520;
const BASE_H = 340;

function smoothPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const midX = (prev.x + curr.x) / 2;
    d += ` Q ${midX} ${prev.y} ${midX} ${(prev.y + curr.y) / 2}`;
    d += ` T ${curr.x} ${curr.y}`;
  }
  return d;
}

export function StylizedMap({
  plan,
  showPins,
  showRoute,
  activeId,
}: {
  plan: Plan;
  showPins: boolean;
  showRoute: boolean;
  activeId?: string | null;
}) {
  const points = useMemo(
    () => projectPlaces(plan.items.map((i) => i.place), BASE_W, BASE_H, 40),
    [plan],
  );
  const bounds = useMemo(() => fitBounds(points, 32), [points]);
  const vb = useMemo(() => viewBoxString(bounds), [bounds]);
  const routeD = useMemo(() => smoothPath(points), [points]);

  return (
    <div className="relative aspect-[3/2] w-full max-h-[220px] overflow-hidden rounded-xl border border-line bg-[#F3F4F8] sm:max-h-[240px] lg:rounded-2xl">
      <svg
        viewBox={vb}
        className="h-full w-full"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={`Map of ${plan.city} with ${plan.items.length} stops`}
      >
        <defs>
          <linearGradient id="water" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#DCE7F2" />
            <stop offset="100%" stopColor="#CBDDEC" />
          </linearGradient>
          <linearGradient id="route" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#5B57D6" />
            <stop offset="100%" stopColor="#F2784B" />
          </linearGradient>
        </defs>

        <rect
          x={bounds.minX}
          y={bounds.minY}
          width={bounds.width}
          height={bounds.height}
          fill="#F3F4F8"
        />

        <path
          d={`M${bounds.minX},${bounds.minY} L${bounds.minX + bounds.width * 0.25},${bounds.minY} Q${bounds.minX + bounds.width * 0.2},${bounds.minY + bounds.height * 0.35} ${bounds.minX + bounds.width * 0.28},${bounds.minY + bounds.height * 0.55} Z`}
          fill="url(#water)"
          opacity={0.85}
        />

        <circle
          cx={bounds.minX + bounds.width * 0.35}
          cy={bounds.minY + bounds.height * 0.3}
          r={bounds.width * 0.08}
          fill="#DCE9D6"
          opacity={0.75}
        />

        <g stroke="#E2E4EC" strokeWidth={0.75} opacity={0.6}>
          {Array.from({ length: 6 }).map((_, i) => (
            <line
              key={`v${i}`}
              x1={bounds.minX + ((i + 1) * bounds.width) / 7}
              y1={bounds.minY}
              x2={bounds.minX + ((i + 1) * bounds.width) / 7}
              y2={bounds.minY + bounds.height}
            />
          ))}
        </g>

        {routeD && (
          <motion.path
            d={routeD}
            fill="none"
            stroke="url(#route)"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeDasharray="1 6"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={
              showRoute
                ? { pathLength: 1, opacity: 0.9 }
                : { pathLength: 0, opacity: 0 }
            }
            transition={{ duration: 1.1, ease: ease.out }}
          />
        )}

        {points.map((pt, i) => {
          const item = plan.items[i];
          const isActive = activeId === item.id;
          return (
            <motion.g
              key={item.id}
              initial={{ opacity: 0, y: -6 }}
              animate={
                showPins
                  ? { opacity: 1, y: 0, scale: isActive ? 1.1 : 1 }
                  : { opacity: 0, y: -6, scale: 1 }
              }
              transition={{
                ...spring.pin,
                delay: showPins ? i * 0.08 : 0,
              }}
              style={{ transformOrigin: "center", transformBox: "fill-box" }}
            >
              {isActive && (
                <circle cx={pt.x} cy={pt.y} r={16} fill="#5B57D6" opacity={0.12} />
              )}
              <circle
                cx={pt.x}
                cy={pt.y}
                r={11}
                fill="#fff"
                stroke="#5B57D6"
                strokeWidth={isActive ? 2.5 : 2}
                style={{ filter: "drop-shadow(0 3px 6px rgba(23,23,31,0.15))" }}
              />
              <text
                x={pt.x}
                y={pt.y + 3.5}
                textAnchor="middle"
                fontSize={10}
                fontWeight={700}
                fill="#3F3BB0"
              >
                {i + 1}
              </text>
            </motion.g>
          );
        })}
      </svg>
    </div>
  );
}
