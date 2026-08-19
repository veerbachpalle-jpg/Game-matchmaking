import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArenaShell, Alert, Panel } from "@/components/arena-shell";
import { api, type Match } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/matches")({
  component: MatchesPage,
  head: () => ({
    meta: [
      { title: "Match History — MatchForge" },
      {
        name: "description",
        content: "Review your recent four-player MatchForge matches, lobby rosters, MMR snapshots and results.",
      },
      { property: "og:title", content: "Match History — MatchForge" },
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
  const tone =
    status === "completed"
      ? "border-primary/60 text-primary"
      : status === "cancelled"
        ? "border-destructive/60 text-destructive"
        : "border-accent/60 text-accent";
  return (
    <span className={`border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] ${tone}`}>
      {status}
    </span>
  );
}

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

  return (
    <ArenaShell
      eyebrow="Combat Log"
      title="Match history"
      subtitle="Your last 20 four-player engagements across every region."
    >
      {error && <Alert>{(error as Error).message}</Alert>}
      {isLoading && (
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          Loading combat log…
        </p>
      )}
      {data && data.length === 0 && (
        <Panel>
          <p className="text-sm text-muted-foreground">
            No matches yet.{" "}
            <Link to="/play" className="text-primary hover:text-accent">
              Enter the queue
            </Link>{" "}
            to record your first engagement.
          </p>
        </Panel>
      )}
      <div className="grid gap-4">
        {data?.map((m) => (
          <Link
            key={m.matchId}
            to="/match/$matchId"
            params={{ matchId: m.matchId }}
            className="group panel p-6 transition-all hover:-translate-y-1 hover:border-primary/50"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <StatusChip status={m.status} />
                <span className="font-display text-sm font-bold tracking-[0.18em] text-foreground">
                  {m.gameMode}
                </span>
              </div>
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                {new Date(m.createdAt).toLocaleString()}
              </span>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {m.players.map((p) => {
                const delta = m.result?.mmrChanges?.[p.userId];
                return (
                  <span
                    key={p.userId}
                    className={`border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] ${
                      m.result?.winnerId === p.userId
                        ? "border-accent/70 text-accent"
                        : "border-border/60 text-muted-foreground"
                    }`}
                  >
                    {p.username} · {p.mmrAtMatch ?? "—"}
                    {typeof delta === "number" && (
                      <span className={delta >= 0 ? "ml-2 text-primary" : "ml-2 text-destructive"}>
                        {delta >= 0 ? "+" : ""}
                        {Math.round(delta)}
                      </span>
                    )}
                  </span>
                );
              })}
            </div>
          </Link>
        ))}
      </div>
    </ArenaShell>
  );
}
