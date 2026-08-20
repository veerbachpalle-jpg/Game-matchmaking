import { createFileRoute, Link } from "@tanstack/react-router";
import { ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";

const HeroScene = lazy(() => import("@/components/hero-scene"));
const IntroVideo = lazy(() => import("@/components/intro-video"));

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "VECTOR PAIR — Competitive Matchmaking & Instant Play" },
      {
        name: "description",
        content:
          "Skill-based matchmaking in under 8 seconds. Queue, drop into the arena, and climb the global ladder across every title you play.",
      },
      { property: "og:title", content: "VECTOR PAIR — Competitive Matchmaking & Instant Play" },
      {
        property: "og:description",
        content:
          "Skill-based matchmaking in under 8 seconds. Queue, drop in, and climb the global ladder.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

// Removed MODES and TICKER arrays

function SceneFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="h-40 w-40 rounded-full border border-primary/20 animate-pulse-ring" />
    </div>
  );
}

function Mark() {
  return (
    <span className="flex items-center gap-2.5">
      <span className="grid h-7 w-7 place-items-center rounded bg-primary/10 border border-primary/30">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
          <path d="M4 4l8 16 8-16" />
        </svg>
      </span>
      <span className="font-display text-sm font-bold tracking-[0.22em] text-foreground">
        VECTOR<span className="text-primary">PAIR</span>
      </span>
    </span>
  );
}

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "border-b border-border/70 bg-background/90 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="/" aria-label="Vector Pair home">
          <Mark />
        </a>
        <nav className="hidden items-center gap-8 text-[13px] text-muted-foreground md:flex">
          <Link to="/play" className="transition-colors hover:text-foreground">
            Matchmaking
          </Link>
          <a href="#modes" className="transition-colors hover:text-foreground">
            Arenas
          </a>
          <Link to="/matches" className="transition-colors hover:text-foreground">
            Ladder
          </Link>
          <Link to="/profile" className="transition-colors hover:text-foreground">
            Profile
          </Link>
        </nav>
        <Link
          to="/play"
          className="border border-primary/50 px-4 py-2 text-[12px] font-medium tracking-wide text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
        >
          Enter queue
        </Link>
      </div>
    </header>
  );
}

function Hero() {
  const [queue, setQueue] = useState(1284930);
  useEffect(() => {
    const t = setInterval(() => setQueue((q) => q + Math.floor(Math.random() * 40) - 12), 1400);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative flex min-h-[760px] w-full items-center overflow-hidden scanlines lg:h-screen">
      <div className="absolute inset-0">
        <ClientOnly fallback={<SceneFallback />}>
          <Suspense fallback={<SceneFallback />}>
            <HeroScene />
          </Suspense>
        </ClientOnly>
      </div>

      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "var(--gradient-hero)" }}
      />
      <div className="pointer-events-none absolute inset-y-0 left-0 w-full bg-gradient-to-r from-background via-background/85 to-transparent lg:w-[62%]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-background to-transparent" />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 pt-28 pb-16">
        <div className="max-w-2xl">
          <h1
            className="animate-rise mt-8 font-display text-[clamp(2.9rem,7vw,5.5rem)] font-bold leading-[0.94] tracking-[-0.035em]"
            style={{ animationDelay: "0.08s" }}
          >
            <span className="block text-foreground">Matched in seconds.</span>
            <span className="block text-gradient">Play instantly.</span>
          </h1>

          <p
            className="animate-rise mt-7 max-w-lg text-[15px] leading-relaxed text-muted-foreground"
            style={{ animationDelay: "0.16s" }}
          >
            A clean matchmaking engine built for competitive play — skill-tuned lobbies and fast edge routing.
          </p>

          <div
            className="animate-rise mt-9 flex flex-wrap items-center gap-3"
            style={{ animationDelay: "0.24s" }}
          >
            <Link
              to="/play"
              className="group relative overflow-hidden bg-primary px-8 py-3.5 text-[13px] font-semibold tracking-wide text-primary-foreground transition-colors hover:bg-accent"
            >
              <span className="relative z-10">Find a match</span>
              <span className="absolute inset-y-0 left-0 w-1/4 animate-sweep bg-background/20 blur-md" />
            </Link>
            <Link
              to="/login"
              className="border border-border px-8 py-3.5 text-[13px] font-semibold tracking-wide text-foreground transition-colors hover:border-primary/60 hover:text-primary"
            >
              Log in
            </Link>
          </div>

          <dl
            className="animate-rise mt-14 grid max-w-lg grid-cols-3 gap-px overflow-hidden border border-border/70 bg-border/70"
            style={{ animationDelay: "0.32s" }}
          >
            {[
              { v: queue.toLocaleString(), l: "In queue", gold: true },
              { v: "18ms", l: "Edge latency", gold: false },
              { v: "42", l: "Live arenas", gold: false },
            ].map((s) => (
              <div key={s.l} className="bg-background/85 px-4 py-4">
                <dt className="font-mono text-[9px] uppercase tracking-[0.24em] text-muted-foreground">
                  {s.l}
                </dt>
                <dd
                  className={`mt-2 font-mono text-xl font-medium tabular-nums ${
                    s.gold ? "text-primary" : "text-foreground"
                  }`}
                >
                  {s.v}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 font-mono text-[9px] uppercase tracking-[0.4em] text-muted-foreground/70 animate-float-slow">
        Scroll
      </div>
    </section>
  );
}

// Removed Ticker and Modes helper components

function CTA() {
  return (
    <section className="relative mx-auto max-w-6xl px-6 pb-24">
      <div className="relative overflow-hidden plate px-8 py-20 text-center">
        <div
          className="pointer-events-none absolute inset-0 opacity-80"
          style={{ background: "var(--gradient-hero)" }}
        />
        <div className="relative">
          <h2 className="mx-auto max-w-2xl font-display text-3xl font-bold leading-tight tracking-[-0.03em] sm:text-5xl">
            The lobby is <span className="text-gradient">waiting</span>
          </h2>
          <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-muted-foreground">
            Create a profile, link your titles, and let the engine find your perfect opponents.
          </p>
          <Link
            to="/register"
            className="mt-9 inline-block bg-primary px-9 py-3.5 text-[13px] font-semibold tracking-wide text-primary-foreground transition-colors hover:bg-accent"
          >
            Create free account
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border/70 py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-xs text-muted-foreground sm:flex-row">
        <Mark />
        <span className="font-mono text-[10px] uppercase tracking-[0.22em]">
          © 2026 · All systems nominal
        </span>
      </div>
    </footer>
  );
}

function Index() {
  const [introDone, setIntroDone] = useState(false);

  return (
    <main className="min-h-screen bg-background">
      {!introDone && (
        <ClientOnly>
          <Suspense fallback={null}>
            <IntroVideo onDone={() => setIntroDone(true)} />
          </Suspense>
        </ClientOnly>
      )}
      <Nav />
      <Hero />
      <CTA />
      <Footer />
    </main>
  );
}
