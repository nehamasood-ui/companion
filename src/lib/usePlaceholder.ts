"use client";

import { useEffect, useRef, useState } from "react";

// A gentle typewriter that cycles through example prompts in the input's
// placeholder. It types a line, holds, deletes, and moves to the next.
export function usePlaceholder(lines: string[], enabled = true): string {
  const [text, setText] = useState("");
  const state = useRef({ line: 0, char: 0, deleting: false });

  useEffect(() => {
    if (!enabled || lines.length === 0) {
      setText(lines[0] ?? "");
      return;
    }

    let timeout: ReturnType<typeof setTimeout>;

    const tick = () => {
      const s = state.current;
      const current = lines[s.line];

      if (!s.deleting) {
        s.char += 1;
        setText(current.slice(0, s.char));
        if (s.char >= current.length) {
          s.deleting = true;
          timeout = setTimeout(tick, 2200); // hold the full line
          return;
        }
        timeout = setTimeout(tick, 26 + Math.random() * 30);
      } else {
        s.char -= 1;
        setText(current.slice(0, Math.max(0, s.char)));
        if (s.char <= 0) {
          s.deleting = false;
          s.line = (s.line + 1) % lines.length;
          timeout = setTimeout(tick, 320);
          return;
        }
        timeout = setTimeout(tick, 14);
      }
    };

    timeout = setTimeout(tick, 700);
    return () => clearTimeout(timeout);
  }, [lines, enabled]);

  return text;
}
