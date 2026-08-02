import { createFileRoute, Link } from "@tanstack/react-router";
import { ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";

const HeroScene = lazy(() => import("@/components/hero-scene"));
const IntroVideo = lazy(() => import("@/components/intro-video"));


export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "MATCHFORGE ARENA — Competitive Matchmaking & Instant Play" },
      {
        name: "description",
        content:
          "Skill-based matchmaking in under 8 seconds. Queue, drop into the arena, and climb the global ladder across every title you play.",
      },
      { property: "og:title", content: "MATCHFORGE ARENA — Competitive Matchmaking & Instant Play" },
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
  "SEASON 07 // ECLIPSE PROTOCOL LIVE",
  "GLOBAL LADDER RESET IN 04D 11H",
  "1,284,930 PLAYERS IN QUEUE",
  "CROSSPLAY ENABLED ON ALL REGIONS",
];

function SceneFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="h-40 w-40 rounded-full border border-primary/30 animate-pulse-ring" />
    </div>
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
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled ? "bg-background/85 backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <a href="/" className="flex items-center gap-3">
          <span className="relative grid h-9 w-9 place-items-center clip-blade bg-primary/15 glow-ring">
            <span className="h-2.5 w-2.5 rotate-45 bg-primary" />
          </span>
          <span className="font-display text-lg font-bold tracking-[0.35em] text-foreground">
            MATCHFORGE
          </span>
        </a>
        <nav className="hidden items-center gap-9 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground md:flex">
          <Link to="/play" className="transition-colors hover:text-primary">
            Matchmaking
          </Link>
          <a href="#modes" className="transition-colors hover:text-primary">
            Arenas
          </a>
          <Link to="/matches" className="transition-colors hover:text-primary">
            Ladder
          </Link>
          <Link to="/profile" className="transition-colors hover:text-primary">
            Clubs
          </Link>
        </nav>
        <Link
          to="/play"
          className="clip-blade bg-primary px-5 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground transition-transform hover:scale-105"
        >
          Enter Queue
        </Link>
      </div>
      <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
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
    <section className="relative h-screen min-h-[720px] w-full overflow-hidden scanlines">
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
      <div className="pointer-events-none absolute inset-y-0 left-0 w-full bg-gradient-to-r from-background via-background/80 to-transparent md:w-3/5" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-background to-transparent" />

      <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-center px-6">
        <div className="max-w-3xl">
          <div className="animate-rise inline-flex items-center gap-3 clip-blade panel px-4 py-2">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              Season 07 · Eclipse Protocol
            </span>
          </div>

          <h1
            className="animate-rise mt-7 font-display text-6xl font-bold uppercase leading-[0.9] tracking-tight sm:text-7xl lg:text-8xl"
            style={{ animationDelay: "0.1s" }}
          >
            <span className="block text-foreground">Matched</span>
            <span className="block text-gradient">in seconds.</span>
            <span className="block text-foreground/70">Legendary forever.</span>
          </h1>

          <p
            className="animate-rise mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground"
            style={{ animationDelay: "0.2s" }}
          >
            A matchmaking engine built for competitive integrity — skill-tuned lobbies, sub-20ms
            edge routing, and instant browser play across every arena on the network.
          </p>

          <div
            className="animate-rise mt-10 flex flex-wrap items-center gap-4"
            style={{ animationDelay: "0.3s" }}
          >
            <Link
              to="/play"
              className="group relative overflow-hidden clip-blade bg-primary px-9 py-4 font-display text-sm font-bold uppercase tracking-[0.22em] text-primary-foreground transition-transform hover:scale-[1.03]"
            >
              <span className="relative z-10">Find a Match</span>
              <span className="absolute inset-y-0 left-0 w-1/3 animate-sweep bg-background/25 blur-md" />
            </Link>
            <Link
              to="/login"
              className="clip-blade panel px-9 py-4 font-display text-sm font-bold uppercase tracking-[0.22em] text-foreground transition-colors hover:border-accent/60 hover:text-accent"
            >
              Log In
            </Link>
          </div>

          <div
            className="animate-rise mt-14 flex flex-wrap gap-10 border-t border-border/60 pt-6"
            style={{ animationDelay: "0.4s" }}
          >
            <div>
              <div className="font-mono text-2xl font-bold text-primary tabular-nums">
                {queue.toLocaleString()}
              </div>
              <div className="mt-1 text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                Players in queue
              </div>
            </div>
            <div>
              <div className="font-mono text-2xl font-bold text-accent">18ms</div>
              <div className="mt-1 text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                Edge latency
              </div>
            </div>
            <div>
              <div className="font-mono text-2xl font-bold text-foreground">42</div>
              <div className="mt-1 text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                Live arenas
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-[10px] uppercase tracking-[0.4em] text-muted-foreground animate-float-slow">
        Scroll
      </div>
    </section>
  );
}

function Ticker() {
  return (
    <div className="relative overflow-hidden border-y border-border/60 bg-surface/40 py-3">
      <div className="flex gap-16 whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
        {[...TICKER, ...TICKER, ...TICKER].map((t, i) => (
          <span key={i} className="flex items-center gap-16">
            {t}
            <span className="h-1 w-1 rounded-full bg-primary" />
          </span>
        ))}
      </div>
    </div>
  );
}

function Modes() {
  return (
    <section id="modes" className="relative mx-auto max-w-7xl px-6 py-28">
      <div className="flex flex-col gap-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.35em] text-primary">
          // The Network
        </span>
        <h2 className="max-w-2xl font-display text-4xl font-bold uppercase leading-tight sm:text-5xl">
          Three ways to <span className="text-gradient">drop in</span>
        </h2>
      </div>

      <div className="mt-14 grid gap-5 md:grid-cols-3">
        {MODES.map((m) => (
          <article
            key={m.tag}
            className="group relative clip-blade panel p-8 transition-all duration-300 hover:-translate-y-2 hover:border-primary/50"
          >
            <span className="font-mono text-xs tracking-[0.3em] text-accent">{m.tag}</span>
            <h3 className="mt-5 font-display text-2xl font-bold uppercase text-foreground">
              {m.name}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{m.copy}</p>
            <div className="mt-8 flex items-end justify-between border-t border-border/60 pt-5">
              <span className="font-mono text-3xl font-bold text-primary">{m.stat}</span>
              <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                {m.statLabel}
              </span>
            </div>
            <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          </article>
        ))}
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="relative mx-auto max-w-7xl px-6 pb-28">
      <div className="relative overflow-hidden clip-blade panel px-8 py-20 text-center">
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{ background: "var(--gradient-hero)" }}
        />
        <div className="relative">
          <h2 className="mx-auto max-w-3xl font-display text-4xl font-bold uppercase leading-tight sm:text-6xl">
            The lobby is <span className="text-gradient">waiting</span>
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-muted-foreground">
            Create a profile, link your titles, and let the engine find your perfect opponents.
          </p>
          <Link
            to="/register"
            className="mt-10 inline-block clip-blade bg-accent px-10 py-4 font-display text-sm font-bold uppercase tracking-[0.22em] text-accent-foreground transition-transform hover:scale-105"
          >
            Create Free Account
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border/60 py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 text-xs uppercase tracking-[0.25em] text-muted-foreground sm:flex-row">
        <span className="font-display font-bold tracking-[0.35em] text-foreground">MATCHFORGE ARENA</span>
        <span>© 2026 · All systems nominal</span>
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

