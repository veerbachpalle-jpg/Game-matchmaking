import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { ArenaShell, ActionButton, Alert, Field, Panel } from "@/components/arena-shell";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [
      { title: "Log In — MatchForge" },
      {
        name: "description",
        content: "Sign in to MatchForge to enter the competitive queue and track your match history.",
      },
      { property: "og:title", content: "Log In — MatchForge" },
      {
        property: "og:description",
        content: "Sign in to enter the competitive queue and track your match history.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [admin, setAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const user = await login({ identifier, password, admin });
      router.navigate({ to: admin || user.role === "admin" ? "/admin" : "/play" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ArenaShell eyebrow="Access Terminal" title="Enter the arena" subtitle="Authenticate to join skill-based queues.">
      <div className="mx-auto max-w-md">
        <Panel>
          <form onSubmit={onSubmit} className="flex flex-col gap-5">
            <Field
              label="Username or email"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="shadowstrike"
              autoComplete="username"
              required
            />
            <Field
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
            <label className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              <input
                type="checkbox"
                checked={admin}
                onChange={(e) => setAdmin(e.target.checked)}
                className="h-3.5 w-3.5 accent-[var(--accent)]"
              />
              Sign in as operator (admin)
            </label>
            <Alert>{error}</Alert>
            <ActionButton type="submit" disabled={busy}>
              {busy ? "Authenticating…" : "Log in"}
            </ActionButton>
          </form>
        </Panel>
        <p className="mt-6 text-center font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          No profile?{" "}
          <Link to="/register" className="text-primary hover:text-accent">
            Create one
          </Link>
        </p>
      </div>
    </ArenaShell>
  );
}
