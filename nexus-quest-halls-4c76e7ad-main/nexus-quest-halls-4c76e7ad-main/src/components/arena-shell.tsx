import { Link, useRouter } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";

import { useMatchmaking } from "@/hooks/use-matchmaking";

const LINKS = [
  { to: "/play", label: "Matchmaking" },
  { to: "/matches", label: "Matches" },
  { to: "/profile", label: "Profile" },
] as const;

export function ArenaNav() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const mm = useMatchmaking(Boolean(user));

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
        <Link to="/" className="flex items-center gap-3">
          <span className="relative grid h-9 w-9 place-items-center clip-blade bg-primary/15 glow-ring">
            <span className="h-2.5 w-2.5 rotate-45 bg-primary" />
          </span>
          <span className="font-display text-lg font-bold tracking-[0.35em] text-foreground">
            NEXUS
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeProps={{ className: "text-primary" }}
              className="transition-colors hover:text-primary"
            >
              {l.label}
            </Link>
          ))}
          {user?.role === "admin" && (
            <Link
              to="/admin"
              activeProps={{ className: "text-accent" }}
              className="text-accent/80 transition-colors hover:text-accent"
            >
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              {mm.connected && mm.ping !== null && (
                <span className="hidden items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground sm:flex">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      mm.ping < 60 ? "bg-emerald-400" : mm.ping < 120 ? "bg-amber-400" : "bg-destructive"
                    }`}
                  />
                  {mm.ping}ms
                </span>
              )}
              <span className="hidden font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground sm:inline">
                {user.username}
              </span>
              <button
                onClick={async () => {
                  await logout();
                  router.navigate({ to: "/login" });
                }}
                className="clip-blade panel px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-foreground transition-colors hover:text-accent"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="clip-blade panel px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-foreground transition-colors hover:text-primary"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="clip-blade bg-primary px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-primary-foreground transition-transform hover:scale-105"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
      <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
    </header>
  );
}

export function ArenaShell({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <ArenaNav />
      <div
        className="pointer-events-none fixed inset-x-0 top-0 h-[60vh]"
        style={{ background: "var(--gradient-hero)" }}
      />
      <main className="relative mx-auto max-w-7xl px-6 pb-24 pt-12">
        <div className="animate-rise">
          {eyebrow && (
            <span className="font-mono text-[11px] uppercase tracking-[0.35em] text-primary">
              // {eyebrow}
            </span>
          )}
          <h1 className="mt-3 font-display text-4xl font-bold uppercase leading-tight sm:text-5xl">
            {title}
          </h1>
          {subtitle && <p className="mt-3 max-w-2xl text-muted-foreground">{subtitle}</p>}
        </div>
        <div className="mt-10">{children}</div>
      </main>
    </div>
  );
}

export function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`clip-blade panel p-6 ${className}`}>{children}</div>;
}

export function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
        {label}
      </span>
      <input
        {...props}
        className="mt-2 w-full clip-blade border border-input bg-surface/60 px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary"
      />
    </label>
  );
}

export function ActionButton({
  children,
  variant = "primary",
  className = "",
  ...props
}: {
  variant?: "primary" | "accent" | "ghost";
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const styles = {
    primary: "bg-primary text-primary-foreground hover:scale-[1.02]",
    accent: "bg-accent text-accent-foreground hover:scale-[1.02]",
    ghost: "panel text-foreground hover:text-primary",
  }[variant];
  return (
    <button
      {...props}
      className={`clip-blade px-7 py-3 font-display text-xs font-bold uppercase tracking-[0.22em] transition-transform disabled:cursor-not-allowed disabled:opacity-50 ${styles} ${className}`}
    >
      {children}
    </button>
  );
}

export function Alert({ children }: { children: ReactNode }) {
  if (!children) return null;
  return (
    <div className="clip-blade border border-destructive/50 bg-destructive/10 px-4 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-destructive">
      {children}
    </div>
  );
}
