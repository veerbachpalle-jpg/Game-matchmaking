import { createFileRoute, Link } from "@tanstack/react-router";
import { ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";

const HeroScene = lazy(() => import("@/components/hero-scene"));
const IntroVideo = lazy(() => import("@/components/intro-video"));

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "NEXUS ARENA — Competitive Matchmaking & Instant Play" },
      {
        name: "description",
        content:
          "Skill-based matchmaking in under 8 seconds. Queue, drop into the arena, and climb the global ladder across every title you play.",
      },
      { property: "og:title", content: "NEXUS ARENA — Competitive Matchmaking & Instant Play" },
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

const MODES = [
  {
    tag: "01",
    name: "Ranked Ladder",
    copy: "Elo-tuned brackets, seasonal resets, and anti-smurf detection on every queue.",
    stat: "7.4s",
    statLabel: "avg queue",
  },
  {
    tag: "02",
    name: "Squad Arena",
    copy: "Auto-built five-stacks from role preference, latency, and voice comfort.",
    stat: "12M",
    statLabel: "matches run",
  },
  {
    tag: "03",
    name: "Instant Play",
    copy: "Zero install. Stream any supported title straight into the browser at 60fps.",
    stat: "18ms",
    statLabel: "edge latency",
  },
];

const TICKER = [
  "Season 07 — Eclipse Protocol live",
  "Global ladder reset in 04d 11h",
  "Crossplay enabled on all regions",
  "Anti-smurf model v4 deployed",
];

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
      <span className="grid h-7 w-7 place-items-center border border-primary/40">
        <span className="h-1.5 w-1.5 rotate-45 bg-primary" />
      </span>
      <span className="font-display text-sm font-bold tracking-[0.22em] text-foreground">
        NEXUS<span className="text-primary">.</span>
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
        <a href="/" aria-label="Nexus Arena home">
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
          <div className="animate-rise flex items-center gap-3">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">
              Season 07
            </span>
            <span className="h-px w-10 bg-border" />
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Eclipse Protocol
            </span>
          </div>

          <h1
            className="animate-rise mt-8 font-display text-[clamp(2.9rem,7vw,5.5rem)] font-bold leading-[0.94] tracking-[-0.035em]"
            style={{ animationDelay: "0.08s" }}
          >
            <span className="block text-foreground">Matched in seconds.</span>
            <span className="block text-gradient">Legendary forever.</span>
          </h1>

          <p
            className="animate-rise mt-7 max-w-lg text-[15px] leading-relaxed text-muted-foreground"
            style={{ animationDelay: "0.16s" }}
          >
            A matchmaking engine built for competitive integrity — skill-tuned lobbies, sub-20ms
            edge routing, and instant browser play across every arena on the network.
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

function Ticker() {
  return (
    <div className="relative overflow-hidden border-y border-border/70 bg-surface/25 py-2.5">
      <div className="flex gap-12 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
        {[...TICKER, ...TICKER, ...TICKER].map((t, i) => (
          <span key={i} className="flex items-center gap-12">
            {t}
            <span className="h-1 w-1 rotate-45 bg-primary/70" />
          </span>
        ))}
      </div>
    </div>
  );
}

function Modes() {
  return (
    <section id="modes" className="relative mx-auto max-w-6xl px-6 py-24">
      <div className="flex flex-col gap-4 border-b border-border/70 pb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary">
            The network
          </span>
          <h2 className="mt-3 max-w-xl font-display text-3xl font-bold leading-tight tracking-[-0.03em] sm:text-4xl">
            Three ways to drop in
          </h2>
        </div>
        <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
          Every queue runs on the same rating core — pick the format, the engine handles the rest.
        </p>
      </div>

      <div className="mt-px grid gap-px bg-border/70 md:grid-cols-3">
        {MODES.map((m) => (
          <article
            key={m.tag}
            className="group relative flex flex-col justify-between bg-background p-8 transition-colors duration-300 hover:bg-surface/40"
          >
            <div>
              <span className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground">
                {m.tag}
              </span>
              <h3 className="mt-6 font-display text-xl font-bold tracking-[-0.02em] text-foreground">
                {m.name}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{m.copy}</p>
            </div>
            <div className="mt-12 flex items-baseline justify-between border-t border-border/70 pt-5">
              <span className="font-mono text-2xl font-medium text-primary">{m.stat}</span>
              <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-muted-foreground">
                {m.statLabel}
              </span>
            </div>
            <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-primary opacity-0 transition-opacity group-hover:opacity-100" />
          </article>
        ))}
      </div>
    </section>
  );
}

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
      <Ticker />
      <Modes />
      <CTA />
      <Footer />
    </main>
  );
}
