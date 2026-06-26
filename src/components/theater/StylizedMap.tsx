"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import type { Plan } from "@/lib/types";
import { projectPlaces, type Point } from "@/lib/geo";
import { ease } from "@/lib/motion";

const VIEW_W = 520;
const VIEW_H = 380;

/** A gentle smoothed path through the points so the route reads as a journey. */
function smoothPath(points: Point[]): string {
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
  onHover,
}: {
  plan: Plan;
  showPins: boolean;
  showRoute: boolean;
  activeId?: string | null;
  /** Hovering a pin lifts the matching timeline card — the reverse link. */
  onHover?: (id: string | null) => void;
}) {
  const points = useMemo(
    () => projectPlaces(plan.items.map((i) => i.place), VIEW_W, VIEW_H, 56),
    [plan],
  );
  const routeD = useMemo(() => smoothPath(points), [points]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-3xl border border-line bg-[#F3F4F8]">
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="h-full w-full"
        preserveAspectRatio="xMidYMid slice"
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

        {/* Land */}
        <rect width={VIEW_W} height={VIEW_H} fill="#F3F4F8" />

        {/* Abstract bay/ocean to the west + north (SF's coastline reads left/top). */}
        <path
          d={`M0,0 L150,0 Q120,90 150,150 Q90,210 130,300 Q70,340 0,330 Z`}
          fill="url(#water)"
          opacity={0.9}
        />
        <path
          d={`M0,${VIEW_H} L0,300 Q120,330 200,${VIEW_H} Z`}
          fill="url(#water)"
          opacity={0.7}
        />

        {/* Soft parks */}
        <circle cx={170} cy={120} r={46} fill="#DCE9D6" opacity={0.8} />
        <circle cx={120} cy={250} r={34} fill="#DCE9D6" opacity={0.7} />

        {/* Faint street grid for texture */}
        <g stroke="#E2E4EC" strokeWidth={1}>
          {Array.from({ length: 9 }).map((_, i) => (
            <line key={`v${i}`} x1={(i + 1) * 52} y1={0} x2={(i + 1) * 52} y2={VIEW_H} />
          ))}
          {Array.from({ length: 7 }).map((_, i) => (
            <line key={`h${i}`} x1={0} y1={(i + 1) * 52} x2={VIEW_W} y2={(i + 1) * 52} />
          ))}
        </g>

        {/* Route */}
        {routeD && (
          <motion.path
            d={routeD}
            fill="none"
            stroke="url(#route)"
            strokeWidth={3}
            strokeLinecap="round"
            strokeDasharray="1 7"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={
              showRoute
                ? { pathLength: 1, opacity: 0.9 }
                : { pathLength: 0, opacity: 0 }
            }
            transition={{ duration: 1.1, ease: ease.out }}
          />
        )}

        {/* Pins */}
        {points.map((pt, i) => {
          const item = plan.items[i];
          const isActive = activeId === item.id;
          return (
            <motion.g
              key={item.id}
              initial={{ opacity: 0, y: -18, scale: 0.6 }}
              animate={
                showPins
                  ? { opacity: 1, y: 0, scale: isActive ? 1.08 : 1 }
                  : { opacity: 0, y: -18, scale: 0.6 }
              }
              transition={{
                type: "spring",
                stiffness: 280,
                damping: 24,
                delay: showPins ? i * 0.1 : 0,
              }}
              style={{
                transformOrigin: "center",
                transformBox: "fill-box",
                cursor: "pointer",
              }}
              onPointerEnter={() => onHover?.(item.id)}
              onPointerLeave={() => onHover?.(null)}
            >
              {/* A soft, static halo marks focus — calm, not pulsing. */}
              {isActive && (
                <circle cx={pt.x} cy={pt.y} r={19} fill="#5B57D6" opacity={0.1} />
              )}
              <circle
                cx={pt.x}
                cy={pt.y}
                r={13}
                fill="#fff"
                stroke="#5B57D6"
                strokeWidth={isActive ? 2.5 : 2}
                style={{ filter: "drop-shadow(0 3px 6px rgba(23,23,31,0.14))" }}
              />
              {/* Generous transparent hit area so pins are easy to hover. */}
              <circle cx={pt.x} cy={pt.y} r={20} fill="transparent" />
              <text
                x={pt.x}
                y={pt.y + 4}
                textAnchor="middle"
                fontSize={12}
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
