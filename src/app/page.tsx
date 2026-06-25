import { PromptHero } from "@/components/landing/PromptHero";

export default function LandingPage() {
  return (
    <main className="grain relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden py-16">
      <div className="dawn-mesh animate-gradient-drift" aria-hidden />
      <header className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between px-6 py-5 sm:px-8">
        <div className="flex items-center gap-2 text-sm font-semibold tracking-tight text-ink">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary text-white">
            ◆
          </span>
          Companion
        </div>
        <span className="text-xs font-medium text-muted">Proof of concept</span>
      </header>

      <PromptHero />
    </main>
  );
}
