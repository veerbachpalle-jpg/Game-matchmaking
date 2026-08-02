import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArenaShell, ActionButton, Alert, Panel, SectionLabel, StatCard } from "@/components/arena-shell";
import { useAuth } from "@/hooks/use-auth";
import { useMatchmaking } from "@/hooks/use-matchmaking";

export const Route = createFileRoute("/play")({
  component: PlayPage,
  head: () => ({
    meta: [
      { title: "Matchmaking Queue — Matchforge Arena" },
      {
        name: "description",
        content: "Pick a region and game mode, join the live skill-based queue, and drop into your match instantly.",
      },
      { property: "og:title", content: "Matchmaking Queue — Matchforge Arena" },
      {
        property: "og:description",
        content: "Pick a region and mode, join the live queue, and drop into your match.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

const REGIONS = [
  { id: "mid-india", label: "Mid India", flag: "🇮🇳" },
  { id: "south-india", label: "South India", flag: "🇮🇳" },
  { id: "north-india", label: "North India", flag: "🇮🇳" },
] as const;

const MODES = [
  {
    id: "1v1",
    label: "Duel",
    sublabel: "1v1",
    copy: "Pure skill. One opponent, no excuses.",
    icon: "⚔️",
    color: "primary",
  },
  {
    id: "four-player",
    label: "Free-for-all",
    sublabel: "4P",
    copy: "Four operatives, last one standing.",
    icon: "",
    color: "accent",
  },
] as const;

function PlayPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"1v1" | "four-player">("1v1");
  const [region, setRegion] = useState<string>(REGIONS[0].id);

  const mm = useMatchmaking(Boolean(user));

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (mm.state === "matched" && mm.match?.matchId) mm.joinGameRoom(mm.match.matchId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mm.state, mm.match?.matchId]);

  if (loading || !user) {
    return (
      <ArenaShell title="Loading arena…">
        <div className="flex items-center justify-center py-20">
          <div className="relative h-32 w-32">
            <div className="absolute inset-0 rounded-full border border-primary/30 animate-pulse-ring" />
            <div
              className="absolute inset-4 rounded-full border border-primary/20 animate-pulse-ring"
              style={{ animationDelay: "0.6s" }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-mono text-xs uppercase tracking-widest text-primary/50">
                Loading…
              </span>
            </div>
          </div>
        </div>
      </ArenaShell>
    );
  }

  const searching = mm.state === "searching";
  const qs = mm.queueStatus;

  return (
    <ArenaShell
      eyebrow="Matchmaking"
      title="Find a match"
      subtitle="MMR-tuned lobbies with ping-aware grouping. The queue widens the longer you wait."
    >
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        {/* ── Left: Queue Config ── */}
        <Panel
          padding="p-6"
          className="shadow-[0_8px_40px_-16px_rgba(0,0,0,0.7)] animate-rise"
        >
          {/* Top accent */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

          {/* Scanlines */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage: "repeating-linear-gradient(to bottom, transparent 0 3px, var(--color-primary) 3px 4px)",
            }}
          />

          <div>
            {/* Connection status bar */}
            <div className="mb-6 flex items-center justify-between clip-blade border border-border bg-background/30 px-4 py-3">
              <SectionLabel>Gateway Status</SectionLabel>
              <div className="flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${
                    mm.connected
                      ? "bg-emerald-400 shadow-[0_0_6px_2px_#34d399] animate-pulse"
                      : "bg-destructive"
                  }`}
                />
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  {mm.connected ? "Connected" : "Offline"}
                </span>
                {mm.connected && mm.ping !== null && (
                  <span
                    className={`font-mono text-[10px] font-bold ${
                      mm.ping < 60 ? "text-emerald-400" : mm.ping < 120 ? "text-amber-400" : "text-destructive"
                    }`}
                  >
                    · {mm.ping}ms
                  </span>
                )}
              </div>
            </div>

            {/* Mode selection */}
            <div className="mb-1">
              <SectionLabel>Game Mode</SectionLabel>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {MODES.map((m) => {
                const isSelected = mode === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    disabled={searching}
                    onClick={() => setMode(m.id)}
                    className={`group clip-blade relative overflow-hidden border p-5 text-left transition-all duration-200 disabled:opacity-60 ${
                      isSelected
                        ? m.color === "primary"
                          ? "border-primary/60 bg-primary/10 shadow-[0_0_20px_-8px_var(--color-primary)]"
                          : "border-accent/60 bg-accent/10 shadow-[0_0_20px_-8px_var(--color-ember)]"
                        : "border-border bg-background/30 hover:border-primary/30 hover:bg-primary/5"
                    }`}
                  >
                    {isSelected && (
                      <div
                        className={`absolute inset-x-0 top-0 h-px ${
                          m.color === "primary"
                            ? "bg-gradient-to-r from-transparent via-primary/60 to-transparent"
                            : "bg-gradient-to-r from-transparent via-accent/60 to-transparent"
                        }`}
                      />
                    )}
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{m.icon}</span>
                      <div>
                        <div className="font-display text-sm font-bold uppercase tracking-[0.18em] text-foreground">
                          {m.label}
                        </div>
                        <div
                          className={`font-mono text-[9px] uppercase tracking-widest font-bold ${
                            isSelected
                              ? m.color === "primary"
                                ? "text-primary"
                                : "text-accent"
                              : "text-muted-foreground"
                          }`}
                        >
                          {m.sublabel}
                        </div>
                      </div>
                      {isSelected && (
                        <span className="ml-auto clip-blade border border-current px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-widest text-primary">
                          Selected
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{m.copy}</p>
                  </button>
                );
              })}
            </div>

            {/* Region */}
            <div className="mt-6">
              <SectionLabel>Region</SectionLabel>
              <div className="mt-3 flex flex-wrap gap-2">
                {REGIONS.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    disabled={searching}
                    onClick={() => setRegion(r.id)}
                    className={`clip-blade border px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.18em] transition-all disabled:opacity-60 ${
                      region === r.id
                        ? "border-accent/60 bg-accent/12 text-accent shadow-[0_0_12px_-6px_var(--color-ember)]"
                        : "border-border bg-background/30 text-muted-foreground hover:border-primary/30 hover:text-foreground"
                    }`}
                  >
                    {r.flag} {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Ping indicator */}
            <div className="mt-5">
              <SectionLabel>Detected Ping</SectionLabel>
              <div className="mt-3 flex items-center gap-3 clip-blade border border-border bg-background/30 px-4 py-3">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    !mm.ping
                      ? "bg-muted-foreground/50 animate-pulse"
                      : mm.ping < 60
                      ? "bg-emerald-400 shadow-[0_0_8px_2px_#34d399]"
                      : mm.ping < 120
                      ? "bg-amber-400 shadow-[0_0_8px_2px_#fbbf24]"
                      : "bg-destructive shadow-[0_0_8px_2px_var(--color-destructive)]"
                  }`}
                />
                <span className="font-mono text-lg font-bold tabular-nums text-foreground">
                  {mm.ping ? `${mm.ping}` : "—"}
                  <span className="ml-1 text-xs font-normal text-muted-foreground">ms</span>
                </span>
                <span className="ml-auto font-mono text-[9px] uppercase tracking-widest text-primary animate-pulse">
                  Live
                </span>
              </div>
            </div>

            {/* Queue actions */}
            <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-border pt-6">
              {searching ? (
                <>
                  <ActionButton variant="ghost" onClick={() => mm.leaveQueue()}>
                    ✕ Cancel Queue
                  </ActionButton>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-3xl font-bold tabular-nums text-primary shadow-[0_0_16px_-4px_var(--color-primary)]">
                      {String(Math.floor(mm.elapsed / 60)).padStart(2, "0")}:
                      {String(mm.elapsed % 60).padStart(2, "0")}
                    </span>
                    <div>
                      <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                        Searching
                      </div>
                      <div className="font-mono text-[10px] uppercase tracking-widest text-foreground">
                        {mode} · {region}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <ActionButton
                  disabled={!mm.connected}
                  onClick={() => mm.joinQueue({ gamemode: mode, region, ping: mm.ping ?? 35 })}
                  className="w-full sm:w-auto"
                >
                  Enter Queue
                </ActionButton>
              )}
            </div>

            {mm.message && (
              <div className="mt-5">
                <Alert>{mm.message}</Alert>
              </div>
            )}
          </div>
        </Panel>

        {/* ── Right: Lobby / Queue Status ── */}
        <Panel
          padding="p-6"
          className="shadow-[0_8px_40px_-16px_rgba(0,0,0,0.7)] animate-rise"
          style={{ animationDelay: "0.1s" }}
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

          <div>
            <SectionLabel>Lobby</SectionLabel>

            {/* ── Match Found ── */}
            {mm.state === "matched" && mm.match ? (
              <div className="mt-6 animate-rise">
                {/* Header */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex h-10 w-10 items-center justify-center clip-blade bg-accent/20 ring-1 ring-accent/40 shadow-[0_0_16px_-4px_var(--color-ember)]" />
                  <div>
                    <h2 className="font-display text-xl font-bold uppercase tracking-widest text-accent">
                      Match Found!
                    </h2>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      {mm.match.gameMode} · {mm.match.region}
                      {mm.match.avgMmr ? ` · avg ${mm.match.avgMmr} MMR` : ""}
                    </p>
                  </div>
                </div>

                {/* Player cards */}
                <ul className="flex flex-col gap-2 mb-6">
                  {mm.match.players.map((p, idx) => (
                    <li
                      key={p.userId}
                      className="flex items-center justify-between clip-blade border border-border bg-background/40 px-4 py-3 transition-all hover:border-primary/20"
                      style={{ animationDelay: `${idx * 0.06}s` }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center clip-blade bg-primary/10 font-display text-xs text-primary">
                          {p.username.slice(0, 2).toUpperCase()}
                        </span>
                        <div>
                          <span className="font-display text-sm font-bold uppercase tracking-[0.12em] text-foreground">
                            {p.username}
                            {p.username.startsWith("bot_") && (
                              <span className="ml-2 text-[9px] text-muted-foreground normal-case">
                                (bot)
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
                          {p.mmr} MMR
                        </div>
                        <div className="font-mono text-[9px] text-muted-foreground">
                          {p.ping}ms
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                <Link
                  to="/match/$matchId"
                  params={{ matchId: mm.match.matchId }}
                  className="flex w-full items-center justify-center gap-2 clip-blade bg-accent px-7 py-4 font-display text-sm font-bold uppercase tracking-[0.22em] text-accent-foreground shadow-[0_0_24px_-8px_var(--color-ember)] transition-all hover:scale-[1.02] hover:shadow-[0_0_32px_-6px_var(--color-ember)]"
                >
                  Open Match Room →
                </Link>
              </div>

            ) : searching ? (
              /* ── Searching ── */
              <div className="mt-6 flex flex-col items-center gap-6 py-4 text-center">
                {/* Radar */}
                <div className="relative h-28 w-28">
                  <div className="absolute inset-0 rounded-full border border-primary/30 animate-pulse-ring" />
                  <div
                    className="absolute inset-3 rounded-full border border-primary/20 animate-pulse-ring"
                    style={{ animationDelay: "0.5s" }}
                  />
                  <div
                    className="absolute inset-6 rounded-full border border-primary/10 animate-pulse-ring"
                    style={{ animationDelay: "1s" }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-mono text-xl font-bold text-primary tabular-nums">
                      {qs ? qs.playersInQueue : "…"}
                    </span>
                  </div>
                </div>

                {/* Status text */}
                <div className="flex flex-col gap-1.5">
                  <p className="font-display text-sm font-bold uppercase tracking-widest text-foreground">
                    {qs && qs.playersInQueue >= (mode === "1v1" ? 2 : 4)
                      ? "Forming match…"
                      : "Scanning for opponents…"}
                  </p>
                  <p className="font-mono text-[10px] text-muted-foreground">
                    {qs
                      ? `${qs.playersInQueue} real player${qs.playersInQueue !== 1 ? "s" : ""} in queue`
                      : "Scanning region for operatives…"}
                  </p>
                </div>

                {/* Stats */}
                {qs && (
                  <div className="w-full grid grid-cols-2 gap-3">
                    <div className="clip-blade border border-border bg-background/30 p-3 text-center">
                      <div className="font-mono text-xl font-bold text-primary tabular-nums">
                        {qs.playersInQueue}
                      </div>
                      <div className="mt-1 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                        In queue
                      </div>
                    </div>
                    <div className="clip-blade border border-border bg-background/30 p-3 text-center">
                      <div
                        className={`font-mono text-xl font-bold tabular-nums ${
                          qs.botFillIn <= 10 ? "text-amber-400" : "text-foreground"
                        }`}
                      >
                        {qs.botFillIn > 0 ? `${qs.botFillIn}s` : "Now"}
                      </div>
                      <div className="mt-1 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                        Bot fills in
                      </div>
                    </div>
                  </div>
                )}

                {/* Bot fill warnings */}
                {qs && qs.botFillIn > 0 && qs.botFillIn <= 15 && (
                  <div className="w-full clip-blade border border-amber-400/30 bg-amber-400/8 px-4 py-3">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-amber-400 animate-pulse">
                      ⚠ No real opponent — bot fills in {qs.botFillIn}s
                    </p>
                  </div>
                )}
                {qs && qs.botFillIn === 0 && (
                  <div className="w-full clip-blade border border-primary/30 bg-primary/8 px-4 py-3">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-primary animate-pulse">
                      Filling slot with bot operative…
                    </p>
                  </div>
                )}
              </div>

            ) : (
              <div className="mt-8 flex flex-col items-center gap-6 py-10 text-center">
                <div className="relative">
                  <div className="h-24 w-24 rounded-full border border-primary/20 animate-float-slow" />
                  <div
                    className="absolute inset-3 rounded-full border border-primary/10 animate-float-slow"
                    style={{ animationDelay: "0.8s" }}
                  />
                </div>
                <div>
                  <p className="font-display text-sm font-bold uppercase tracking-widest text-foreground">
                    No Active Lobby
                  </p>
                  <p className="mt-2 font-mono text-[10px] max-w-[24ch] text-muted-foreground leading-relaxed">
                    Configure your queue on the left and hit Enter Queue to find a match.
                  </p>
                </div>

                <div className="w-full flex flex-col gap-2">
                  {[
                    "MMR-balanced matchmaking",
                    "Ping-aware region routing",
                    "Bot fill if no real match",
                  ].map((text) => (
                    <div
                      key={text}
                      className="flex items-center gap-3 clip-blade border border-border/60 bg-background/30 px-3 py-2.5"
                    >
                      <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        {text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Panel>
      </div>
    </ArenaShell>
  );
}
