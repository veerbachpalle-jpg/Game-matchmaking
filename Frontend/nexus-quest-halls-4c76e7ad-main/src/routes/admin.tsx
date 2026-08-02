import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ArenaShell, ActionButton, Alert, Panel, SectionLabel, Badge, StatCard } from "@/components/arena-shell";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({
    meta: [
      { title: "Operator Console — Matchforge Arena" },
      {
        name: "description",
        content: "Admin console for Matchforge Arena: manage registered operatives, roles and account removals.",
      },
      { property: "og:title", content: "Operator Console — Matchforge Arena" },
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
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "admin" | "user">("all");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

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

  const filtered = data?.filter((u) => {
    const matchesSearch =
      !search ||
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = filter === "all" || u.role === filter;
    return matchesSearch && matchesRole;
  });

  const admins = data?.filter((u) => u.role === "admin").length ?? 0;
  const users = data?.filter((u) => u.role !== "admin").length ?? 0;

  return (
    <ArenaShell
      eyebrow="Operator Console"
      title="Registered operatives"
      subtitle="Promote, demote, or purge accounts from the network. Use with care."
    >
      {/* Stats */}
      <div className="mb-6 grid grid-cols-3 gap-3 animate-rise">
        <StatCard label="Total Operatives" value={data?.length ?? "—"} />
        <StatCard label="Operators (Admin)" value={admins} accent />
        <StatCard label="Standard Users" value={users} />
      </div>

      {/* Control bar */}
      <div
        className="mb-5 flex flex-wrap items-center gap-3 animate-rise"
        style={{ animationDelay: "0.05s" }}
      >
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 font-mono text-[10px]">
            🔍
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by callsign or email…"
            className="w-full clip-blade border border-border bg-background/50 pl-8 pr-4 py-2.5 font-mono text-sm text-foreground outline-none backdrop-blur placeholder:text-muted-foreground/40 focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all"
          />
        </div>

        {/* Role filter */}
        <div className="flex gap-1">
          {(["all", "admin", "user"] as const).map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => setFilter(role)}
              className={`clip-blade px-4 py-2.5 font-mono text-[10px] uppercase tracking-widest transition-all cursor-pointer ${
                filter === role
                  ? "bg-primary/15 text-primary ring-1 ring-primary/30"
                  : "border border-border bg-surface/30 text-muted-foreground hover:text-foreground"
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Errors */}
      {queryError && (
        <div className="mb-5">
          <Alert>{(queryError as Error).message}</Alert>
        </div>
      )}
      {error && (
        <div className="mb-5">
          <Alert>{error}</Alert>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex flex-col gap-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="clip-blade border border-border bg-surface/20 p-5 animate-pulse flex items-center gap-4"
              style={{ opacity: 1 - i * 0.1 }}
            >
              <div className="h-11 w-11 clip-blade bg-white/5" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-32 rounded bg-white/5" />
                <div className="h-2 w-48 rounded bg-white/5" />
              </div>
              <div className="flex gap-2">
                <div className="h-8 w-20 clip-blade bg-white/5" />
                <div className="h-8 w-20 clip-blade bg-white/5" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* User list */}
      {filtered && filtered.length === 0 && !isLoading && (
        <Panel padding="py-16 text-center">
          <div className="text-4xl mb-3 opacity-30">👤</div>
          <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            No operatives match your filters
          </p>
        </Panel>
      )}

      {filtered && filtered.length > 0 && (
        <div className="flex flex-col gap-2">
          <SectionLabel>{filtered.length} operative{filtered.length !== 1 ? "s" : ""} found</SectionLabel>
          <div className="flex flex-col gap-2 mt-2">
            {filtered.map((u, idx) => (
              <div
                key={u._id}
                className="group clip-blade relative overflow-hidden border border-border bg-surface/30 backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-surface/50"
                style={{ animationDelay: `${idx * 0.03}s` }}
              >
                {/* Role accent line */}
                <div
                  className={`absolute left-0 inset-y-0 w-0.5 ${
                    u.role === "admin" ? "bg-accent shadow-[1px_0_6px_var(--color-ember)]" : "bg-primary/30"
                  }`}
                />

                <div className="px-5 py-4 flex flex-wrap items-center gap-4">
                  {/* Avatar */}
                  {u.avatar ? (
                    <img
                      src={u.avatar}
                      alt={`${u.username} avatar`}
                      className="h-11 w-11 clip-blade object-cover ring-1 ring-border"
                      loading="lazy"
                    />
                  ) : (
                    <span className="flex h-11 w-11 items-center justify-center clip-blade bg-primary/10 font-display text-sm text-primary ring-1 ring-primary/20">
                      {u.username.slice(0, 2).toUpperCase()}
                    </span>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-[10rem]">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-display text-sm font-bold uppercase tracking-[0.14em] text-foreground">
                        {u.username}
                      </span>
                      <Badge variant={u.role === "admin" ? "accent" : "default"}>
                        {u.role}
                      </Badge>
                      {u.rank && (
                        <Badge variant="primary">{u.rank}</Badge>
                      )}
                    </div>
                    <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                      {u.email ?? "no email"} · {u.status || "online"}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <ActionButton
                      variant="ghost"
                      className="py-2 px-4"
                      onClick={() =>
                        act(() => api.adminUpdateRole(u._id, u.role === "admin" ? "user" : "admin"))
                      }
                    >
                      {u.role === "admin" ? "Demote" : "Promote"}
                    </ActionButton>

                    {confirmDelete === u._id ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            act(() => api.adminDeleteUser(u._id));
                            setConfirmDelete(null);
                          }}
                          className="clip-blade bg-destructive/20 border border-destructive/50 px-4 py-2 font-display text-[10px] font-bold uppercase tracking-widest text-destructive hover:bg-destructive/30 transition-colors cursor-pointer"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(u._id)}
                        className="clip-blade border border-destructive/30 px-4 py-2 font-display text-[10px] font-bold uppercase tracking-widest text-destructive/70 transition-all hover:border-destructive/60 hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </ArenaShell>
  );
}
