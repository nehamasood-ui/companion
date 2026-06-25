"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { useCompanion } from "@/lib/store";
import { usePlaceholder } from "@/lib/usePlaceholder";
import { spring, staggerContainer, riseIn, fadeIn } from "@/lib/motion";
import { VibeChips } from "./VibeChips";
import { PartyStepper } from "./PartyStepper";

const EXAMPLES = [
  "Plan a girls' day in San Francisco for 5 — coffee, painting, a scenic walk, sunset, and dinner. Around $60 each.",
  "A chill Sunday in Brooklyn for 3 — brunch, a gallery, a long walk, then natural wine.",
  "Bachelorette weekend in Austin — tacos, live music, a pool afternoon, rooftop dinner.",
  "First date in Paris — a quiet café, a tucked-away bookshop, the river at golden hour.",
];

export function PromptHero() {
  const router = useRouter();
  const submitRequest = useCompanion((s) => s.submitRequest);

  const [prompt, setPrompt] = useState("");
  const [partySize, setPartySize] = useState(5);
  const [vibes, setVibes] = useState<string[]>([]);
  const [focused, setFocused] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const placeholder = usePlaceholder(EXAMPLES, prompt.length === 0 && !focused);

  const toggleVibe = (vibe: string) =>
    setVibes((prev) =>
      prev.includes(vibe) ? prev.filter((v) => v !== vibe) : [...prev, vibe],
    );

  const submit = () => {
    const text =
      prompt.trim().length > 0 ? prompt.trim() : EXAMPLES[0]; // never dead-end on empty
    submitRequest({ prompt: text, partySize, vibes });
    router.push("/plan");
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey || !e.shiftKey)) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <motion.div
      variants={staggerContainer(0.1, 0.05)}
      initial="hidden"
      animate="show"
      className="relative z-10 mx-auto flex w-full max-w-2xl flex-col items-center px-6 text-center"
    >
      <motion.div
        variants={riseIn}
        className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-surface/80 px-3.5 py-1.5 text-xs font-medium text-ink-soft backdrop-blur"
      >
        <Sparkles className="h-3.5 w-3.5 text-primary" strokeWidth={2} />
        AI gets you to a great first draft — together you make it yours
      </motion.div>

      <motion.h1
        variants={riseIn}
        className="text-display font-semibold tracking-tight text-ink"
      >
        Describe the day
        <br className="hidden sm:block" /> you want.
      </motion.h1>

      <motion.p
        variants={riseIn}
        className="mt-5 max-w-md text-base leading-relaxed text-ink-soft sm:text-lg"
      >
        Companion turns a sentence into a beautiful plan — then becomes the
        place your group actually shapes it together.
      </motion.p>

      {/* Prompt input */}
      <motion.div variants={riseIn} className="mt-9 w-full">
        <div
          className={[
            "group relative rounded-3xl border bg-surface p-2 transition-all duration-300",
            focused
              ? "border-primary/40 shadow-glow"
              : "border-line shadow-card hover:border-primary/25",
          ].join(" ")}
        >
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={onKeyDown}
            rows={3}
            placeholder={placeholder}
            aria-label="Describe the day you want"
            className="w-full resize-none bg-transparent px-4 py-3 text-left text-base leading-relaxed text-ink outline-none placeholder:text-muted/80 sm:text-lg"
          />

          <div className="flex items-center justify-between gap-3 px-2 pb-1 pt-1">
            <PartyStepper value={partySize} onChange={setPartySize} />
            <motion.button
              type="button"
              onClick={submit}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              transition={spring.snappy}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-glow outline-none transition-colors hover:bg-primary-ink focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              Plan it
              <ArrowRight className="h-4 w-4" strokeWidth={2.25} />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Vibe chips */}
      <motion.div variants={fadeIn} className="mt-7">
        <VibeChips selected={vibes} onToggle={toggleVibe} />
      </motion.div>

      <motion.p variants={fadeIn} className="mt-8 text-xs text-muted">
        No account needed · Press Enter to plan
      </motion.p>
    </motion.div>
  );
}
