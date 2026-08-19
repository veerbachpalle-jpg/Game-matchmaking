import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArenaShell, ActionButton, Alert, Panel } from "@/components/arena-shell";
import { FriendsPanel } from "@/components/friends-panel";
import { useAuth } from "@/hooks/use-auth";
import { useMatchmaking, type GameMode } from "@/hooks/use-matchmaking";
import { useGroups } from "@/hooks/use-groups";

export const Route = createFileRoute("/play")({
  component: PlayPage,
  head: () => ({
    meta: [
      { title: "Matchmaking Queue — MatchForge" },
      {
        name: "description",
        content:
          "Pick a region and game mode, join the live MMR-based queue, and drop into your match the moment a lobby forms.",
      },
      { property: "og:title", content: "Matchmaking Queue — MatchForge" },
      {
        property: "og:description",
        content: "Pick a region and mode, join the live queue, and drop into your match.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

export const REGIONS = [
  { id: "mid-india", label: "Mid India" },
  { id: "south-india", label: "South India" },
  { id: "north-india", label: "North India" },
] as const;

const MODES: { id: GameMode; label: string; copy: string; slots: string }[] = [
  {
    id: "1v1",
    label: "Duel · 1v1",
    copy: "Head-to-head XOX. Elo-rated, K=32. Winner takes the MMR.",
    slots: "2 operatives",
  },
  {
    id: "4v4",
    label: "Warzone · 4v4",
    copy: "Eight operatives split into two balanced teams by MMR. Group with friends or solo-queue.",
    slots: "8 operatives",
  },
];

function Meter({
  label,
  value,
  tone = "primary",
}: {
  label: string;
  value: string;
  tone?: "primary" | "accent" | "foreground";
}) {
  const color =
    tone === "accent" ? "text-accent" : tone === "foreground" ? "text-foreground" : "text-primary";
  return (
    <div className="border-l border-border/60 pl-4">
      <div className={`font-mono text-xl font-bold tabular-nums ${color}`}>{value}</div>
      <div className="mt-1 text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

function RadarSweep({ active }: { active: boolean }) {
  return (
    <div className="relative mx-auto grid h-52 w-52 place-items-center">
      <div className="absolute inset-0 rounded-full border border-primary/25" />
      <div className="absolute inset-6 rounded-full border border-primary/20" />
      <div className="absolute inset-12 rounded-full border border-primary/15" />
      {active && (
        <>
          <div className="absolute inset-0 rounded-full border border-primary/40 animate-pulse-ring" />
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "conic-gradient(from 0deg, transparent 0deg, color-mix(in oklab, var(--primary) 28%, transparent) 40deg, transparent 90deg)",
              animation: "radar-spin 2.6s linear infinite",
            }}
          />
        </>
      )}
      <div
        className={`h-3 w-3 rotate-45 ${active ? "bg-primary" : "bg-muted-foreground/40"}`}
        aria-hidden
      />
    </div>
  );
}

/** Renders a player row in the team display */
function PlayerRow({
  username,
  mmr,
  isBot,
}: {
  username: string;
  mmr: number;
  isBot: boolean;
}) {
  return (
    <li className="flex items-center justify-between border border-border/60 bg-surface/40 px-3 py-2">
      <span className="font-display text-xs font-bold tracking-[0.16em] text-foreground">
        {username}
        {isBot && (
          <span className="ml-2 font-mono text-[9px] tracking-[0.16em] text-accent">AI</span>
        )}
      </span>
      <span className="font-mono text-[10px] text-muted-foreground">{mmr} mmr</span>
    </li>
  );
}

function PlayPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<GameMode>("1v1");
  const [region, setRegion] = useState<string>(REGIONS[0].id);

  const mm = useMatchmaking();
  const { group, queueGroup, toggleReady } = useGroups();

  const isLeader = group ? group.leaderId === user?._id : true;
  const allMembersReady = group ? group.members.every(m => m.userId === group.leaderId || m.ready) : true;
  const iAmReady = group ? group.members.find(m => m.userId === user?._id)?.ready : false;

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  // The moment the server forms a lobby, drop the player into the match room.
  useEffect(() => {
    if (mm.state === "matched" && mm.match?.matchId) {
      const id = mm.match.matchId;
      const t = setTimeout(() => navigate({ to: "/match/$matchId", params: { matchId: id } }), 1600);
      return () => clearTimeout(t);
    }
  }, [mm.state, mm.match?.matchId, navigate]);

  if (loading || !user) {
    return (
      <ArenaShell title="Loading arena…">
        <div className="h-40 w-40 rounded-full border border-primary/30 animate-pulse-ring" />
      </ArenaShell>
    );
  }

  const searching = mm.state === "searching";
  const matched = mm.state === "matched" && mm.match;
  const is4v4 = matched && mm.match?.gameMode === "4v4";

  function handleJoinQueue() {
    if (group && group.members.length > 1) {
      // Queue the entire group
      queueGroup({ gamemode: mode, region, ping: mm.ping ?? 40 });
    } else {
      mm.joinQueue({ gamemode: mode, region });
    }
  }

  return (
    <ArenaShell
      eyebrow="Matchmaking"
      title="Find a match"
      subtitle="Tickets are grouped by MMR (±100, widening +50 every 5s) and ping (±80ms). After 60 seconds the server fills empty slots with bots."
    >
      <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        {/* ── Left column: controls + friends ─────────────── */}
        <div className="flex flex-col gap-6">
          <Panel className="scanlines">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                Gateway
              </span>
              <span className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.16em]">
                <span className="text-muted-foreground">{mm.ping || "—"}ms</span>
                <span className="flex items-center gap-2">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      mm.connected ? "bg-primary animate-pulse" : "bg-destructive"
                    }`}
                  />
                  {mm.connected ? "Linked" : "Offline"}
                </span>
              </span>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {MODES.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  disabled={searching}
                  onClick={() => setMode(m.id)}
                  className={`border p-5 text-left transition-colors disabled:opacity-60 ${
                    mode === m.id
                      ? "border-primary/70 bg-primary/10"
                      : "border-border/60 bg-surface/40 hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-display text-sm font-bold tracking-[0.18em] text-foreground">
                      {m.label}
                    </span>
                    <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-accent">
                      {m.slots}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{m.copy}</p>
                </button>
              ))}
            </div>

            <div className="mt-6">
              <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                Region
              </span>
              <div className="mt-3 flex flex-wrap gap-2">
                {REGIONS.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    disabled={searching}
                    onClick={() => setRegion(r.id)}
                    className={`border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors disabled:opacity-60 ${
                      region === r.id
                        ? "border-accent/70 bg-accent/10 text-accent"
                        : "border-border/60 text-muted-foreground hover:border-accent/40"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Group indicator */}
            {group && group.members.length > 1 && (
              <div className="mt-5 border border-primary/20 bg-primary/5 px-4 py-2.5 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-primary">
                  Queuing as group · {group.members.length} members
                </span>
              </div>
            )}

            <div className="mt-8 flex flex-wrap items-center gap-3">
              {!searching ? (
                group && !isLeader ? (
                  <ActionButton
                    disabled={!mm.connected || Boolean(matched)}
                    onClick={toggleReady}
                    variant={iAmReady ? "ghost" : "primary"}
                  >
                    {iAmReady ? "Unready" : "Ready Up"}
                  </ActionButton>
                ) : (
                  <ActionButton
                    disabled={!mm.connected || Boolean(matched) || !allMembersReady}
                    onClick={handleJoinQueue}
                  >
                    {group && group.members.length > 1 
                      ? (!allMembersReady ? "Waiting for members..." : "Queue group")
                      : "Join queue"}
                  </ActionButton>
                )
              ) : (
                <ActionButton variant="ghost" onClick={mm.leaveQueue}>
                  Leave queue
                </ActionButton>
              )}
              <Link
                to="/matches"
                className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-primary"
              >
                View combat log →
              </Link>
            </div>

            {mm.message && (
              <div className="mt-6">
                <Alert>{mm.message}</Alert>
              </div>
            )}
          </Panel>

          {/* ── Friends Panel ────────────────────────────── */}
          <FriendsPanel />
        </div>

        {/* ── Right column: radar + match info ───────────── */}
        <Panel className="flex flex-col">
          <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
            {matched ? "Lobby formed" : searching ? "Scanning network" : "Standby"}
          </span>

          <div className="mt-6">
            <RadarSweep active={searching || Boolean(matched)} />
          </div>

          {matched ? (
            <div className="mt-6">
              <p className="text-center font-display text-2xl font-bold text-gradient">
                Match found
              </p>

              {/* ── 4v4: show two teams ──────────────── */}
              {is4v4 && mm.match!.teamA && mm.match!.teamB ? (
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-primary">
                        Team Alpha
                      </span>
                      <span className="font-mono text-[9px] text-muted-foreground">
                        avg {mm.match!.teamAAvgMmr} mmr
                      </span>
                    </div>
                    <ul className="flex flex-col gap-1.5">
                      {mm.match!.teamA!.map((p) => (
                        <PlayerRow
                          key={p.userId}
                          username={p.username}
                          mmr={p.mmr}
                          isBot={p.username.startsWith("bot_")}
                        />
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-accent">
                        Team Bravo
                      </span>
                      <span className="font-mono text-[9px] text-muted-foreground">
                        avg {mm.match!.teamBAvgMmr} mmr
                      </span>
                    </div>
                    <ul className="flex flex-col gap-1.5">
                      {mm.match!.teamB!.map((p) => (
                        <PlayerRow
                          key={p.userId}
                          username={p.username}
                          mmr={p.mmr}
                          isBot={p.username.startsWith("bot_")}
                        />
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                /* ── 1v1: flat player list ──────────────── */
                <ul className="mt-5 flex flex-col gap-2">
                  {mm.match!.players.map((p) => (
                    <PlayerRow
                      key={p.userId}
                      username={p.username}
                      mmr={p.mmr}
                      isBot={p.username.startsWith("bot_")}
                    />
                  ))}
                </ul>
              )}

              <p className="mt-5 text-center font-mono text-[10px] uppercase tracking-[0.16em] text-primary">
                Entering match room…
              </p>
            </div>
          ) : searching ? (
            <div className="mt-8 grid grid-cols-2 gap-5">
              <Meter label="In queue" value={String(mm.status?.playersInQueue ?? 1)} />
              <Meter
                label="Waiting"
                value={`${mm.status?.waitSeconds ?? mm.elapsed}s`}
                tone="foreground"
              />
              <Meter
                label="Bot fill in"
                value={mm.status ? `${mm.status.botFillIn}s` : "60s"}
                tone="accent"
              />
              <Meter label="Your ping" value={`${mm.ping || 40}ms`} tone="foreground" />
            </div>
          ) : (
            <p className="mt-8 text-center text-sm leading-relaxed text-muted-foreground">
              Choose a mode and region, then join the queue. Live queue depth, wait time and bot
              fill-in countdown appear here.
            </p>
          )}
        </Panel>
      </div>
    </ArenaShell>
  );
}
