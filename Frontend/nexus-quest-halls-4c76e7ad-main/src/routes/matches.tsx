import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArenaShell, Alert, Panel, SectionLabel } from "@/components/arena-shell";
import { api, type Match } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/matches")({
  component: MatchesPage,
  head: () => ({
    meta: [
      { title: "Match History — Matchforge Arena" },
      {
        name: "description",
        content: "Review your recent four-player Matchforge Arena matches, lobby rosters, MMR snapshots and results.",
      },
      { property: "og:title", content: "Match History — Matchforge Arena" },
      {
        property: "og:description",
        content: "Review your recent matches, rosters, MMR snapshots and results.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

export function StatusChip({ status }: { status: Match["status"] }) {
  const config = {
    completed: {
      style: "border-primary/50 text-primary bg-primary/8 shadow-[0_0_8px_-4px_var(--color-primary)]",
      dot: "bg-primary",
      label: "Completed",
    },
    cancelled: {
      style: "border-destructive/50 text-destructive bg-destructive/8",
      dot: "bg-destructive",
      label: "Cancelled",
    },
    ongoing: {
      style: "border-accent/50 text-accent bg-accent/8 animate-pulse",
      dot: "bg-accent",
      label: "Live",
    },
  }[status] ?? {
    style: "border-border/60 text-muted-foreground",
    dot: "bg-muted-foreground",
    label: status,
  };

  return (
    <span
      className={`clip-blade flex items-center gap-1.5 border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] ${config.style}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${config.dot}`} />
      {config.label}
    </span>
  );
}

const MODE_ICON: Record<string, string> = {
  "1v1": "",
  "four-player": "",
};

function MatchesPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["matches", user?._id],
    queryFn: api.myMatches,
    enabled: Boolean(user),
  });

  const completed = data?.filter((m) => m.status === "completed").length ?? 0;
  const wins =
    data?.filter((m) => m.result?.winnerId === user?._id).length ?? 0;

  return (
    <ArenaShell
      eyebrow="Combat Log"
      title="Match history"
      subtitle="Your last 20 engagements across every region. Click any record to view the full dossier."
    >
      {data && data.length > 0 && (
        <div
          className="mb-6 grid grid-cols-3 gap-3 animate-rise"
          style={{ animationDelay: "0s" }}
        >
          {[
            { label: "Total Matches", value: data.length },
            { label: "Completed", value: completed },
            { label: "Wins", value: wins, accent: true },
          ].map(({ label, value, accent }) => (
            <div
              key={label}
              className="clip-blade border border-white/6 bg-surface/30 p-4 text-center backdrop-blur"
            >
              <div
                className={`font-mono text-2xl font-bold tabular-nums ${accent ? "text-accent shadow-[0_0_12px_-4px_var(--color-ember)]" : "text-primary"}`}
              >
                {value}
              </div>
              <div className="mt-1 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                {label}
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="mb-5">
          <Alert>{(error as Error).message}</Alert>
        </div>
      )}

      {isLoading && (
        <div className="flex flex-col gap-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="clip-blade border border-white/5 bg-surface/20 p-6 animate-pulse"
              style={{ animationDelay: `${i * 0.1}s`, opacity: 1 - i * 0.15 }}
            >
              <div className="flex items-center gap-3">
                <div className="h-4 w-20 rounded bg-white/5" />
                <div className="h-4 w-16 rounded bg-white/5" />
                <div className="ml-auto h-3 w-28 rounded bg-white/5" />
              </div>
              <div className="mt-4 flex gap-2">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="h-6 w-20 rounded bg-white/5" />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {data && data.length === 0 && (
        <Panel padding="p-8" className="shadow-[0_8px_32px_-16px_rgba(0,0,0,0.8)]">
          <div className="flex flex-col items-center gap-4 py-20 text-center px-8">
            <div>
              <p className="font-display text-lg font-bold uppercase tracking-widest text-foreground">
                No engagements yet
              </p>
              <p className="mt-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                Your combat history will appear here
              </p>
            </div>
            <Link
              to="/play"
              className="clip-blade bg-primary px-6 py-3 font-display text-xs font-bold uppercase tracking-widest text-primary-foreground shadow-[0_0_20px_-6px_var(--color-primary)] transition-all hover:scale-105 hover:shadow-[0_0_28px_-4px_var(--color-primary)]"
            >
              Enter the Queue
            </Link>
          </div>
        </Panel>
      )}

      {/* Match list */}
      {data && data.length > 0 && (
        <div className="flex flex-col gap-3">
          <SectionLabel>Recent Engagements · {data.length} records</SectionLabel>
          <div className="flex flex-col gap-3 mt-2">
            {data.map((m, idx) => {
              const isWinner = m.result?.winnerId === user?._id;
              const myPlayer = m.players.find((p) => p.userId === user?._id);
              const mmrChange = m.result?.mmrChanges?.[user?._id ?? ""];

              return (
                <Link
                  key={m.matchId}
                  to="/match/$matchId"
                  params={{ matchId: m.matchId }}
                  className="group relative clip-blade overflow-hidden border border-border bg-surface/30 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-surface/50 hover:shadow-[0_8px_32px_-12px_rgba(0,0,0,0.6)]"
                  style={{
                    animationDelay: `${idx * 0.05}s`,
                  }}
                >
                  {/* Left accent line */}
                  <div
                    className={`absolute left-0 inset-y-0 w-0.5 transition-all ${
                      isWinner
                        ? "bg-accent shadow-[1px_0_8px_var(--color-ember)]"
                        : m.status === "completed"
                        ? "bg-destructive/60"
                        : m.status === "ongoing"
                        ? "bg-primary animate-pulse"
                        : "bg-border/40"
                    }`}
                  />

                  {/* Hover glow */}
                  <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-primary/3 to-transparent" />

                  <div className="px-6 py-5">
                    {/* Top row */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center clip-blade bg-surface/60 text-lg ring-1 ring-border">
                          {MODE_ICON[m.gameMode] ?? "🎮"}
                        </span>
                        <div>
                          <StatusChip status={m.status} />
                        </div>
                        <span className="font-display text-sm font-bold uppercase tracking-[0.18em] text-foreground">
                          {m.gameMode}
                        </span>
                        {isWinner && (
                          <span className="clip-blade border border-accent/40 bg-accent/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-accent">
                            ★ Win
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        {mmrChange !== undefined && (
                          <span
                            className={`font-mono text-sm font-bold tabular-nums ${
                              mmrChange > 0 ? "text-primary" : mmrChange < 0 ? "text-destructive" : "text-muted-foreground"
                            }`}
                          >
                            {mmrChange > 0 ? `+${mmrChange}` : mmrChange} MMR
                          </span>
                        )}
                        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                          {new Date(m.createdAt).toLocaleString()}
                        </span>
                        <span className="font-mono text-[9px] text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                          View →
                        </span>
                      </div>
                    </div>

                    {/* Players */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {m.players.map((p) => {
                        const isWinnerPlayer = m.result?.winnerId === p.userId;
                        const isMe = p.userId === user?._id;
                        return (
                          <span
                            key={p.userId}
                            className={`clip-blade border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] transition-all ${
                              isWinnerPlayer
                                ? "border-accent/60 bg-accent/10 text-accent"
                                : isMe
                                ? "border-primary/40 bg-primary/8 text-primary"
                                : "border-border/50 text-muted-foreground"
                            }`}
                          >
                            {isMe ? "YOU" : p.username}
                            {p.username.startsWith("bot_") && (
                              <span className="ml-1 opacity-50">·bot</span>
                            )}
                            {" "}
                            <span className="opacity-60">· {p.mmrAtMatch ?? "—"}</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </ArenaShell>
  );
}
