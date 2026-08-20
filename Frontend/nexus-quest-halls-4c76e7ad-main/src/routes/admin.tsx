import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ArenaShell, ActionButton, Alert, Panel } from "@/components/arena-shell";
import { api, Match } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({
    meta: [
      { title: "Operator Console — MatchForge" },
      {
        name: "description",
        content: "Admin console for MatchForge: manage registered operatives, roles and account removals.",
      },
      { property: "og:title", content: "Operator Console — MatchForge" },
      {
        property: "og:description",
        content: "Manage registered operatives, roles and account removals.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function AdminPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [blacklistHours, setBlacklistHours] = useState<Record<string, number>>({});
  const [searchMatchId, setSearchMatchId] = useState("");

  useEffect(() => {
    if (loading) return;
    if (!user) navigate({ to: "/login" });
    else if (user.role !== "admin") navigate({ to: "/play" });
  }, [loading, user, navigate]);

  const { data: users, isLoading: usersLoading, error: usersError } = useQuery({
    queryKey: ["admin-users"],
    queryFn: api.adminUsers,
    enabled: user?.role === "admin",
  });

  const { data: activeMatches, isLoading: matchesLoading, error: matchesError } = useQuery({
    queryKey: ["admin-matches"],
    queryFn: api.adminGetActiveMatches,
    enabled: user?.role === "admin",
    refetchInterval: 5000,
  });

  async function act(fn: () => Promise<unknown>, queryKey: string) {
    setError(null);
    try {
      await fn();
      await queryClient.invalidateQueries({ queryKey: [queryKey] });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    }
  }

  const handleBlacklist = (userId: string) => {
    const hours = blacklistHours[userId] || 1;
    act(() => api.adminBlacklistUser(userId, hours), "admin-users");
  };

  const handleDeclareWinner = (matchId: string, team: "teamA" | "teamB") => {
    act(() => api.adminSubmitFourPlayerResult(matchId, team), "admin-matches");
  };

  const filteredMatches = activeMatches?.filter((match: Match) => 
    match.matchId.toLowerCase().includes(searchMatchId.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <ArenaShell
        eyebrow="Operator Console"
        title="Active Operations"
        subtitle="Monitor ongoing matches and declare results."
      >
        {matchesError && <Alert>{(matchesError as Error).message}</Alert>}
        {error && <div className="mb-5"><Alert>{error}</Alert></div>}
        {matchesLoading && (
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            Scanning network for active matches…
          </p>
        )}

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by Lobby ID..."
            value={searchMatchId}
            onChange={(e) => setSearchMatchId(e.target.value)}
            className="w-full bg-background border border-border text-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-primary font-mono"
          />
        </div>

        <div className="grid gap-3">
          {filteredMatches?.length === 0 && !matchesLoading && (
            <p className="text-sm text-muted-foreground">No active matches found.</p>
          )}
          {filteredMatches?.map((match: Match) => (
            <Panel key={match.matchId} className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono text-xs uppercase tracking-widest text-primary">
                    {match.gameMode} Match
                  </span>
                  <span className="ml-2 font-mono text-[10px] text-muted-foreground">
                    ID: {match.matchId}
                  </span>
                </div>
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  STATUS: {match.status}
                </span>
              </div>
              
              {match.gameMode === "4v4" && match.status !== "completed" && (
                <div className="flex gap-4 items-center mt-2 border-t border-border pt-4">
                  <div className="flex-1">
                    <p className="font-display text-sm font-bold text-foreground mb-2">Team A</p>
                    <div className="flex flex-wrap gap-2">
                      {match.teamA?.map(p => (
                        <span key={p.userId} className="text-xs bg-primary/10 px-2 py-1">{p.username}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <ActionButton variant="primary" onClick={() => handleDeclareWinner(match.matchId, "teamA")}>
                      Declare A Win
                    </ActionButton>
                    <ActionButton variant="primary" onClick={() => handleDeclareWinner(match.matchId, "teamB")}>
                      Declare B Win
                    </ActionButton>
                  </div>
                  <div className="flex-1 text-right">
                    <p className="font-display text-sm font-bold text-foreground mb-2">Team B</p>
                    <div className="flex flex-wrap gap-2 justify-end">
                      {match.teamB?.map(p => (
                        <span key={p.userId} className="text-xs bg-primary/10 px-2 py-1">{p.username}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </Panel>
          ))}
        </div>
      </ArenaShell>

      <ArenaShell
        eyebrow="Network Roster"
        title="Registered operatives"
        subtitle="Manage accounts, roles, and access control."
      >
        {usersError && <Alert>{(usersError as Error).message}</Alert>}
        {usersLoading && (
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            Loading roster…
          </p>
        )}

        <div className="grid gap-3">
          {users?.map((u) => (
            <Panel key={u._id} className="flex flex-wrap items-center gap-4">
              {u.avatar ? (
                <img
                  src={u.avatar}
                  alt={`${u.username} avatar`}
                  className="h-11 w-11 object-cover"
                  loading="lazy"
                />
              ) : (
                <span className="grid h-11 w-11 place-items-center bg-primary/15 font-display text-sm text-primary">
                  {u.username.slice(0, 2).toUpperCase()}
                </span>
              )}
              <div className="flex-1 min-w-[10rem]">
                <div className="font-display text-sm font-bold tracking-[0.14em] text-foreground">
                  {u.username}
                </div>
                <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  {u.role} · {u.status || "offline"} · {u.rank || "unranked"}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <select 
                  className="bg-background border border-border text-xs py-2 px-2 focus:outline-none focus:ring-1 focus:ring-primary"
                  value={blacklistHours[u._id] || 1}
                  onChange={(e) => setBlacklistHours(prev => ({...prev, [u._id]: parseInt(e.target.value)}))}
                >
                  <option value={1}>1 Hour</option>
                  <option value={24}>24 Hours</option>
                  <option value={168}>7 Days</option>
                </select>
                <ActionButton
                  variant="ghost"
                  onClick={() => handleBlacklist(u._id)}
                >
                  Blacklist
                </ActionButton>
              </div>

              <ActionButton
                variant="ghost"
                onClick={() => act(() => api.adminUpdateRole(u._id, u.role === "admin" ? "user" : "admin"), "admin-users")}
              >
                {u.role === "admin" ? "Demote" : "Promote"}
              </ActionButton>
              <button
                onClick={() => act(() => api.adminDeleteUser(u._id), "admin-users")}
                className="border border-destructive/50 px-5 py-3 font-display text-xs font-bold tracking-[0.16em] text-destructive transition-colors hover:bg-destructive/10"
              >
                Remove
              </button>
            </Panel>
          ))}
        </div>
      </ArenaShell>
    </div>
  );
}

