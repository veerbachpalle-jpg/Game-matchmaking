import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { ArenaShell, ActionButton, Alert, Field, Panel } from "@/components/arena-shell";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [
      { title: "Log In — Matchforge Arena Matchmaking" },
      {
        name: "description",
        content: "Sign in to Matchforge Arena to enter the competitive queue and track your match history.",
      },
      { property: "og:title", content: "Log In — Matchforge Arena Matchmaking" },
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
    <ArenaShell eyebrow="Access Terminal" title="Enter the arena" subtitle="Authenticate to join skill-based queues and compete across every region.">
      <div className="mx-auto max-w-md">
        {/* Feature badges */}
        <div className="mb-6 flex flex-wrap gap-2 animate-rise" style={{ animationDelay: "0.1s" }}>
          {["Skill-based MMR", "Live ping routing", "Instant matchmaking"].map((feat) => (
            <span
              key={feat}
              className="clip-blade border border-primary/20 bg-primary/5 px-3 py-1 font-mono text-[9px] uppercase tracking-widest text-primary/70"
            >
              {feat}
            </span>
          ))}
        </div>

        {/* Main card */}
        <Panel
          padding="p-8 animate-rise"
          className="shadow-[0_8px_60px_-20px_rgba(0,0,0,0.8)]"
          style={{ animationDelay: "0.15s" }}
        >
          {/* Card top accent */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          {/* Corner decoration */}
          <div className="absolute right-4 top-4 h-12 w-12 clip-blade border border-primary/10 opacity-30" />

          <div>
            <div className="mb-6 flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center clip-blade bg-primary/15 ring-1 ring-primary/30">
                <span className="h-2 w-2 rotate-45 bg-primary" />
              </span>
              <div>
                <div className="font-display text-sm font-bold uppercase tracking-widest text-foreground">
                  Operator Login
                </div>
                <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                  Secure auth · Encrypted session
                </div>
              </div>
            </div>

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

              {/* Admin toggle */}
              <label className="group flex cursor-pointer items-center gap-3">
                <div
                  className={`relative h-5 w-9 clip-blade transition-colors ${admin ? "bg-accent/30 ring-1 ring-accent/40" : "bg-white/5 ring-1 ring-white/10"}`}
                  onClick={() => setAdmin((v) => !v)}
                >
                  <input
                    type="checkbox"
                    checked={admin}
                    onChange={(e) => setAdmin(e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className={`absolute top-0.5 h-4 w-4 clip-blade transition-all duration-200 ${admin ? "left-4 bg-accent" : "left-0.5 bg-muted-foreground/40"}`}
                  />
                </div>
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground group-hover:text-foreground transition-colors">
                  Sign in as operator (admin)
                </span>
              </label>

              <Alert>{error}</Alert>

              <ActionButton type="submit" disabled={busy} className="w-full justify-center">
                {busy ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
                    Authenticating…
                  </span>
                ) : (
                  "Enter Arena"
                )}
              </ActionButton>
            </form>
          </div>

          {/* Bottom section */}
          <div className="mt-8 -mx-8 -mb-8 border-t border-border bg-background/20 px-8 py-4">
            <p className="text-center font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              No profile?{" "}
              <Link to="/register" className="text-primary transition-colors hover:text-accent">
                Create one →
              </Link>
            </p>
          </div>
        </Panel>

        {/* Decorative dots */}
        <div className="mt-8 flex justify-center gap-2 opacity-30">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-1 w-1 rounded-full bg-primary" style={{ opacity: 1 - i * 0.15 }} />
          ))}
        </div>
      </div>
    </ArenaShell>
  );
}
