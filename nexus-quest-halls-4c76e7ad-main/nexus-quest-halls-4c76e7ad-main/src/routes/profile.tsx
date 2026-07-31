import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArenaShell, ActionButton, Alert, Field, Panel } from "@/components/arena-shell";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
  head: () => ({
    meta: [
      { title: "Operative Profile — Nexus Arena" },
      {
        name: "description",
        content: "Manage your Nexus Arena callsign, rank, squad roster and account security settings.",
      },
      { property: "og:title", content: "Operative Profile — Nexus Arena" },
      {
        property: "og:description",
        content: "Manage your callsign, rank, squad roster and security settings.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function ProfilePage() {
  const { user, loading, refresh } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [newpassword, setNewPassword] = useState("");
  const [friendId, setFriendId] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  if (!user) return <ArenaShell title="Loading profile…">{null}</ArenaShell>;

  async function run(fn: () => Promise<unknown>, ok: string) {
    setError(null);
    setNotice(null);
    try {
      await fn();
      setNotice(ok);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    }
  }

  return (
    <ArenaShell eyebrow="Dossier" title={user.username} subtitle={user.email}>
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Panel className="overflow-hidden p-0">
          {user.coverimage ? (
            <img
              src={user.coverimage}
              alt={`${user.username} cover art`}
              className="h-40 w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="h-40 w-full" style={{ background: "var(--gradient-edge)" }} />
          )}
          <div className="flex items-center gap-4 p-6">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={`${user.username} avatar`}
                className="h-16 w-16 clip-blade object-cover"
                loading="lazy"
              />
            ) : (
              <span className="grid h-16 w-16 place-items-center clip-blade bg-primary/15 font-display text-lg text-primary">
                {user.username.slice(0, 2).toUpperCase()}
              </span>
            )}
            <div>
              <div className="font-display text-xl font-bold uppercase tracking-[0.14em] text-foreground">
                {user.username}
              </div>
              <div className="mt-1 flex flex-wrap gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                <span className="clip-blade border border-primary/50 px-2 py-1 text-primary">
                  {user.rank || "unranked"}
                </span>
                <span className="clip-blade border border-border/60 px-2 py-1">
                  {user.role || "user"}
                </span>
                <span className="clip-blade border border-accent/50 px-2 py-1 text-accent">
                  {user.status || "offline"}
                </span>
              </div>
            </div>
          </div>
          <div className="border-t border-border/60 px-6 py-5">
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
              Squad · {user.friends?.length ?? 0}
            </span>
            <div className="mt-4 flex gap-2">
              <input
                value={friendId}
                onChange={(e) => setFriendId(e.target.value)}
                placeholder="Friend user id"
                className="flex-1 clip-blade border border-input bg-surface/60 px-4 py-2.5 text-sm outline-none focus:border-primary"
              />
              <ActionButton
                variant="ghost"
                onClick={() => run(() => api.addFriend(friendId), "Friend added")}
                disabled={!friendId}
              >
                Add
              </ActionButton>
            </div>
          </div>
        </Panel>

        <Panel>
          <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
            Security
          </span>
          <form
            className="mt-5 flex flex-col gap-5"
            onSubmit={(e) => {
              e.preventDefault();
              run(() => api.changePassword({ password, newpassword }), "Password updated").then(
                () => {
                  setPassword("");
                  setNewPassword("");
                },
              );
            }}
          >
            <Field
              label="Current password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Field
              label="New password"
              type="password"
              value={newpassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <ActionButton type="submit">Change password</ActionButton>
          </form>
          {notice && (
            <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
              {notice}
            </p>
          )}
          <div className="mt-5">
            <Alert>{error}</Alert>
          </div>
        </Panel>
      </div>
    </ArenaShell>
  );
}
