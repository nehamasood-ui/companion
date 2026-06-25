"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { THEATER_STEPS } from "./theater";

export interface TheaterClock {
  /** Index of the step currently running (0-based). */
  activeStep: number;
  /** How many steps have fully completed — drives progressive assembly. */
  completed: number;
  /** True once all acts have finished and the workspace has settled. */
  done: boolean;
  /** Jump straight to the settled state. */
  skip: () => void;
}

// Drives the workflow theater. Critically, this clock is fully client-side and
// time-boxed — it never waits on a network call, so the reveal always plays at
// the same considered pace.
export function useTheater(): TheaterClock {
  const reduce = useReducedMotion();
  const [activeStep, setActiveStep] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [done, setDone] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const finished = useRef(false);

  const clearAll = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    clearAll();
    setCompleted(THEATER_STEPS.length);
    setActiveStep(THEATER_STEPS.length - 1);
    setDone(true);
  };

  useEffect(() => {
    // Honor reduced-motion: collapse the theater to a brief, calm settle.
    if (reduce) {
      const t = setTimeout(finish, 500);
      timers.current.push(t);
      return clearAll;
    }

    let elapsed = 0;
    THEATER_STEPS.forEach((step, i) => {
      const startAt = elapsed;
      timers.current.push(setTimeout(() => setActiveStep(i), startAt));
      timers.current.push(
        setTimeout(() => setCompleted(i + 1), startAt + step.duration),
      );
      elapsed += step.duration;
    });
    // Small beat after the last act before settling.
    timers.current.push(setTimeout(finish, elapsed + 350));

    return clearAll;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce]);

  return { activeStep, completed, done, skip: finish };
}
