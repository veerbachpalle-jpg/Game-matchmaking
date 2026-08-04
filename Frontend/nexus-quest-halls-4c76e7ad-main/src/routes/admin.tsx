import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ArenaShell, ActionButton, Alert, Panel } from "@/components/arena-shell";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({
    meta: [
      { title: "Operator Console — Nexus Arena" },
      {
        name: "description",
        content: "Admin console for Nexus Arena: manage registered operatives, roles and account removals.",
      },
      { property: "og:title", content: "Operator Console — Nexus Arena" },
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

  useEffect(() => {
    if (loading) return;
    if (!user) navigate({ to: "/login" });
    else if (user.role !== "admin") navigate({ to: "/play" });
  }, [loading, user, navigate]);

  const { data, isLoading, error: queryError } = useQuery({
    queryKey: ["admin-users"],
    queryFn: api.adminUsers,
    enabled: user?.role === "admin",
  });

  async function act(fn: () => Promise<unknown>) {
    setError(null);
    try {
      await fn();
      await queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    }
  }

  return (
    <ArenaShell
      eyebrow="Operator Console"
      title="Registered operatives"
      subtitle="Promote, demote, or purge accounts from the network."
    >
      {queryError && <Alert>{(queryError as Error).message}</Alert>}
      {error && <div className="mb-5"><Alert>{error}</Alert></div>}
      {isLoading && (
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          Loading roster…
        </p>
      )}

      <div className="grid gap-3">
        {data?.map((u) => (
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
            <ActionButton
              variant="ghost"
              onClick={() => act(() => api.adminUpdateRole(u._id, u.role === "admin" ? "user" : "admin"))}
            >
              {u.role === "admin" ? "Demote" : "Promote"}
            </ActionButton>
            <button
              onClick={() => act(() => api.adminDeleteUser(u._id))}
              className="border border-destructive/50 px-5 py-3 font-display text-xs font-bold tracking-[0.16em] text-destructive transition-colors hover:bg-destructive/10"
            >
              Remove
            </button>
          </Panel>
        ))}
      </div>
    </ArenaShell>
  );
}
