import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArenaShell, ActionButton, Alert, Panel } from "@/components/arena-shell";
import { useAuth } from "@/hooks/use-auth";
import { useMatchmaking } from "@/hooks/use-matchmaking";

export const Route = createFileRoute("/play")({
  component: PlayPage,
  head: () => ({
    meta: [
      { title: "Matchmaking Queue — Nexus Arena" },
      {
        name: "description",
        content: "Pick a region and game mode, join the live skill-based queue, and drop into your match instantly.",
      },
      { property: "og:title", content: "Matchmaking Queue — Nexus Arena" },
      {
        property: "og:description",
        content: "Pick a region and mode, join the live queue, and drop into your match.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

const REGIONS = ["mid-india", "south-india", "north-india"] as const;
const MODES = [
  { id: "1v1", label: "Duel · 1v1", copy: "Pure skill. One opponent, no excuses." },
  { id: "four-player", label: "Free-for-all · 4P", copy: "Four operatives, last one standing." },
] as const;

function PlayPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"1v1" | "four-player">("1v1");
  const [region, setRegion] = useState<string>(REGIONS[0]);

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
        <div className="h-40 w-40 rounded-full border border-primary/30 animate-pulse-ring" />
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
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* ── Left panel: queue config ── */}
        <Panel className="scanlines">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
              Gateway
            </span>
            <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em]">
              <span
                className={`h-1.5 w-1.5 rounded-full ${mm.connected ? "bg-primary animate-pulse" : "bg-destructive"}`}
              />
              {mm.connected ? "Connected" : "Offline"}
            </span>
          </div>

          {/* Mode selection */}
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                disabled={searching}
                onClick={() => setMode(m.id)}
                className={`clip-blade border p-5 text-left transition-colors disabled:opacity-60 ${
                  mode === m.id
                    ? "border-primary/70 bg-primary/10"
                    : "border-border/60 bg-surface/40 hover:border-primary/40"
                }`}
              >
                <div className="font-display text-sm font-bold uppercase tracking-[0.18em] text-foreground">
                  {m.label}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{m.copy}</p>
              </button>
            ))}
          </div>

          {/* Region + Ping row */}
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                Region
              </span>
              <div className="mt-2 flex flex-wrap gap-2">
                {REGIONS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    disabled={searching}
                    onClick={() => setRegion(r)}
                    className={`clip-blade border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors disabled:opacity-60 ${
                      region === r
                        ? "border-accent/70 bg-accent/15 text-accent"
                        : "border-border/60 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                Detected Ping
              </span>
              <div className="mt-2 flex items-center gap-2 clip-blade border border-border/60 bg-surface/40 px-3 py-2">
                <span
                  className={`h-2 w-2 rounded-full ${
                    !mm.ping
                      ? "bg-muted-foreground animate-pulse"
                      : mm.ping < 60
                      ? "bg-emerald-400"
                      : mm.ping < 120
                      ? "bg-amber-400"
                      : "bg-destructive"
                  }`}
                />
                <span className="font-mono text-xs font-bold text-foreground">
                  {mm.ping ? `${mm.ping} ms` : "Measuring..."}
                </span>
                <span className="ml-auto font-mono text-[9px] uppercase tracking-[0.18em] text-primary">
                  Live
                </span>
              </div>
            </div>
          </div>

          {/* Queue actions */}
          <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-border/60 pt-6">
            {searching ? (
              <>
                <ActionButton variant="ghost" onClick={() => mm.leaveQueue()}>
                  Cancel queue
                </ActionButton>
                <span className="font-mono text-2xl font-bold tabular-nums text-primary">
                  {String(Math.floor(mm.elapsed / 60)).padStart(2, "0")}:
                  {String(mm.elapsed % 60).padStart(2, "0")}
                </span>
                <span className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                  Searching {mode} · {region}
                </span>
              </>
            ) : (
              <ActionButton
                disabled={!mm.connected}
                onClick={() => mm.joinQueue({ gamemode: mode, region, ping: mm.ping ?? 35 })}
              >
                Enter queue
              </ActionButton>
            )}
          </div>

          {mm.message && <div className="mt-5"><Alert>{mm.message}</Alert></div>}
        </Panel>

        {/* ── Right panel: lobby / queue status ── */}
        <Panel>
          <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
            Lobby
          </span>

          {mm.state === "matched" && mm.match ? (
            /* Match found */
            <div className="mt-5 animate-rise">
              <h2 className="font-display text-2xl font-bold uppercase text-gradient">
                Match found
              </h2>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                {mm.match.gameMode} · {mm.match.region}
                {mm.match.avgMmr ? ` · avg mmr ${mm.match.avgMmr}` : ""}
              </p>
              <ul className="mt-5 flex flex-col gap-2">
                {mm.match.players.map((p) => (
                  <li
                    key={p.userId}
                    className="flex items-center justify-between clip-blade border border-border/60 bg-surface/40 px-4 py-3"
                  >
                    <span className="font-display text-sm font-bold uppercase tracking-[0.12em] text-foreground">
                      {p.username}
                      {p.username.startsWith("bot_") && (
                        <span className="ml-2 text-[9px] text-muted-foreground">(bot)</span>
                      )}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      {p.mmr} mmr · {p.ping}ms
                    </span>
                  </li>
                ))}
              </ul>
              <Link
                to="/match/$matchId"
                params={{ matchId: mm.match.matchId }}
                className="mt-6 inline-block clip-blade bg-accent px-7 py-3 font-display text-xs font-bold uppercase tracking-[0.22em] text-accent-foreground transition-transform hover:scale-[1.02]"
              >
                Open match room →
              </Link>
            </div>

          ) : searching ? (
            /* Waiting for players — live queue status */
            <div className="mt-6 flex flex-col items-center gap-5 py-4 text-center">
              {/* Radar animation */}
              <div className="relative h-24 w-24">
                <div className="absolute inset-0 rounded-full border border-primary/40 animate-pulse-ring" />
                <div
                  className="absolute inset-3 rounded-full border border-primary/20 animate-pulse-ring"
                  style={{ animationDelay: "0.5s" }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-mono text-sm font-bold text-primary">
                    {qs ? qs.playersInQueue : "…"}
                  </span>
                </div>
              </div>

              {/* Status text */}
              <div className="flex flex-col gap-1">
                <p className="font-display text-sm font-bold uppercase tracking-widest text-foreground">
                  {qs && qs.playersInQueue >= (mode === "1v1" ? 2 : 4)
                    ? "Forming match…"
                    : "Waiting for opponent…"}
                </p>
                <p className="font-mono text-[10px] text-muted-foreground">
                  {qs
                    ? `${qs.playersInQueue} real player${qs.playersInQueue !== 1 ? "s" : ""} in queue`
                    : "Scanning region for operatives…"}
                </p>
              </div>

              {/* Stats cards */}
              {qs && (
                <div className="w-full grid grid-cols-2 gap-2">
                  <div className="clip-blade border border-border/50 bg-surface/40 p-3 text-center">
                    <div className="font-mono text-xl font-bold text-primary tabular-nums">
                      {qs.playersInQueue}
                    </div>
                    <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground mt-1">
                      In queue
                    </div>
                  </div>
                  <div className="clip-blade border border-border/50 bg-surface/40 p-3 text-center">
                    <div
                      className={`font-mono text-xl font-bold tabular-nums ${
                        qs.botFillIn <= 10 ? "text-amber-400" : "text-foreground"
                      }`}
                    >
                      {qs.botFillIn > 0 ? `${qs.botFillIn}s` : "Now"}
                    </div>
                    <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground mt-1">
                      Bot fills in
                    </div>
                  </div>
                </div>
              )}

              {/* Warning when bot fill is imminent */}
              {qs && qs.botFillIn > 0 && qs.botFillIn <= 15 && (
                <p className="w-full clip-blade border border-amber-400/30 bg-amber-400/10 px-3 py-2 font-mono text-[10px] text-amber-400 animate-pulse">
                  ⚠ No real opponent found — a bot operative will fill in {qs.botFillIn}s
                </p>
              )}
              {qs && qs.botFillIn === 0 && (
                <p className="w-full clip-blade border border-primary/30 bg-primary/10 px-3 py-2 font-mono text-[10px] text-primary animate-pulse">
                  ⚡ Filling slot with bot operative…
                </p>
              )}
            </div>

          ) : (
            /* Idle */
            <div className="mt-8 flex flex-col items-center py-10 text-center">
              <div className="h-24 w-24 rounded-full border border-primary/40 animate-float-slow" />
              <p className="mt-8 max-w-[22ch] text-sm text-muted-foreground">
                No active lobby. Configure your queue and drop in.
              </p>
            </div>
          )}
        </Panel>
      </div>
    </ArenaShell>
  );
}
