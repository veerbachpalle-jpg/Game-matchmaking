import { Link, useRouter } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";

const LINKS = [
  { to: "/play", label: "Matchmaking" },
  { to: "/matches", label: "Matches" },
  { to: "/profile", label: "Profile" },
] as const;

export function ArenaNav() {
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="grid h-7 w-7 place-items-center border border-primary/40">
            <span className="h-1.5 w-1.5 rotate-45 bg-primary" />
          </span>
          <span className="font-display text-sm font-bold tracking-[0.22em] text-foreground">
            MATCH<span className="text-primary">FORGE</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-[13px] text-muted-foreground md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeProps={{ className: "text-primary" }}
              className="transition-colors hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
          {user?.role === "admin" && (
            <Link
              to="/admin"
              activeProps={{ className: "text-primary" }}
              className="transition-colors hover:text-foreground"
            >
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden font-mono text-[11px] tracking-[0.14em] text-muted-foreground sm:inline">
                {user.username}
              </span>
              <button
                onClick={async () => {
                  await logout();
                  router.navigate({ to: "/login" });
                }}
                className="border border-border px-4 py-2 text-[12px] font-medium text-foreground transition-colors hover:border-primary/60 hover:text-primary"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="border border-border px-4 py-2 text-[12px] font-medium text-foreground transition-colors hover:border-primary/60 hover:text-primary"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="bg-primary px-4 py-2 text-[12px] font-semibold text-primary-foreground transition-colors hover:bg-accent"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
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
    <div className="min-h-screen bg-transparent">
      <ArenaNav />
      <div
        className="pointer-events-none fixed inset-x-0 top-0 h-[55vh]"
        style={{ background: "var(--gradient-hero)" }}
      />
      <main className="relative mx-auto max-w-6xl px-6 pb-24 pt-12">
        <div className="animate-rise border-b border-border/70 pb-8">
          {eyebrow && (
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary">
              {eyebrow}
            </span>
          )}
          <h1 className="mt-3 font-display text-3xl font-bold leading-tight tracking-[-0.03em] sm:text-4xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {subtitle}
            </p>
          )}
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
  return <div className={`plate p-6 ${className}`}>{children}</div>;
}

export function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
        {label}
      </span>
      <input
        {...props}
        className="mt-2 w-full border border-input bg-background/60 px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-primary"
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
    primary: "bg-primary text-primary-foreground hover:bg-accent",
    accent: "bg-accent text-accent-foreground hover:bg-primary",
    ghost: "border border-border text-foreground hover:border-primary/60 hover:text-primary",
  }[variant];
  return (
    <button
      {...props}
      className={`px-7 py-3 text-[13px] font-semibold tracking-wide transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${styles} ${className}`}
    >
      {children}
    </button>
  );
}

export function Alert({ children }: { children: ReactNode }) {
  if (!children) return null;
  return (
    <div className="border border-destructive/50 bg-destructive/10 px-4 py-3 font-mono text-[11px] tracking-[0.08em] text-destructive">
      {children}
    </div>
  );
}
