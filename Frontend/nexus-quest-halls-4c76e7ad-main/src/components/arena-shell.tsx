import { Link, useRouter } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMatchmaking } from "@/hooks/use-matchmaking";

const LINKS = [
  { to: "/play", label: "Matchmaking" },
  { to: "/matches", label: "Matches" },
  { to: "/profile", label: "Profile" },
] as const;

export function CornerScrew({ position }: { position: "top-left" | "bottom-right" }) {
  const posClass = position === "top-left" ? "top-2 left-2" : "bottom-2 right-2";
  return (
    <div
      className={`pointer-events-none absolute ${posClass} z-20 flex h-3.5 w-3.5 items-center justify-center rounded-full border border-slate-500 bg-gradient-to-br from-slate-300 via-slate-600 to-slate-950 shadow-[inset_0_1px_1px_rgba(255,255,255,0.7),0_2px_4px_rgba(0,0,0,0.95)]`}
    >
      <div className="h-2 w-0.5 rotate-45 bg-slate-950 shadow-[0_0_1px_rgba(255,255,255,0.4)]" />
      <div className="absolute h-2 w-0.5 -rotate-45 bg-slate-950 shadow-[0_0_1px_rgba(255,255,255,0.4)]" />
    </div>
  );
}

export function ArenaNav() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const mm = useMatchmaking(Boolean(user));

  return (
    <header className="sticky top-0 z-50">
      <div className="relative border-b border-cyan-500/20 bg-background/80 backdrop-blur-xl">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent" />

        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3.5">
          <Link to="/" className="group flex items-center gap-3">
            <span className="relative flex h-9 w-9 items-center justify-center clip-blade bg-gradient-to-br from-cyan-500/40 via-cyan-600/20 to-orange-600/30 ring-1 ring-cyan-400/50 shadow-[0_0_18px_-2px_rgba(6,182,212,0.5)] transition-all group-hover:shadow-[0_0_26px_0px_rgba(6,182,212,0.7)]">
              <span className="h-2.5 w-2.5 rotate-45 bg-cyan-400 transition-transform group-hover:rotate-[135deg] duration-500 shadow-[0_0_8px_rgba(6,182,212,0.9)]" />
            </span>
            <span className="font-display text-lg font-bold tracking-[0.35em] text-foreground group-hover:text-cyan-300 transition-all">
              MATCHFORGE
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                activeProps={{
                  className:
                    "bg-cyan-500/15 text-cyan-300 ring-1 ring-cyan-400/40 shadow-[0_0_14px_-2px_rgba(6,182,212,0.4)]",
                }}
                className="flex items-center gap-1.5 rounded-sm clip-blade px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground transition-all hover:bg-white/5 hover:text-foreground"
              >
                {l.label}
              </Link>
            ))}
            {user?.role === "admin" && (
              <Link
                to="/admin"
                activeProps={{ className: "bg-orange-500/15 text-orange-400 ring-1 ring-orange-400/40" }}
                className="flex items-center gap-1.5 rounded-sm clip-blade px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-orange-400/80 transition-all hover:bg-orange-500/10 hover:text-orange-300"
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
                      className={`h-1.5 w-1.5 rounded-full animate-pulse ${
                        mm.ping < 60 ? "bg-emerald-400 shadow-[0_0_6px_1px_#34d399]" : mm.ping < 120 ? "bg-amber-400" : "bg-destructive"
                      }`}
                    />
                    {mm.ping}ms
                  </span>
                )}
                <span className="hidden items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground sm:flex">
                  <span className="clip-blade bg-cyan-500/15 px-2.5 py-1 text-cyan-300 ring-1 ring-cyan-400/30">
                    {user.username}
                  </span>
                </span>
                <button
                  onClick={async () => {
                    await logout();
                    router.navigate({ to: "/login" });
                  }}
                  className="clip-blade relative border border-slate-600/70 bg-gradient-to-b from-[#334155] via-[#1e293b] to-[#0f172a] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] transition-all hover:border-destructive/60 hover:text-destructive"
                >
                  <CornerScrew position="top-left" />
                  <CornerScrew position="bottom-right" />
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="clip-blade relative border border-slate-600/70 bg-gradient-to-b from-[#334155] via-[#1e293b] to-[#0f172a] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] transition-all hover:border-cyan-400/50 hover:text-cyan-300"
                >
                  <CornerScrew position="top-left" />
                  <CornerScrew position="bottom-right" />
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="clip-blade relative border border-cyan-500/80 bg-gradient-to-b from-[#0284c7] via-[#0369a1] to-[#0f172a] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_0_16px_rgba(6,182,212,0.4)] transition-all hover:scale-105"
                >
                  <CornerScrew position="top-left" />
                  <CornerScrew position="bottom-right" />
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
      </div>
    </header>
  );
}

function SceneOverlay() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div
        className="absolute inset-x-0 top-0 h-[50vh] opacity-35"
        style={{ background: "var(--gradient-hero)" }}
      />
      <div
        className="absolute inset-y-0 left-0 w-2/3"
        style={{
          background:
            "linear-gradient(to right, rgba(8,17,26,0.35) 0%, transparent 100%)",
        }}
      />
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="animate-rise mb-10">
      {eyebrow && (
        <div className="mb-3 flex items-center gap-3">
          <div className="h-px w-8 bg-gradient-to-r from-transparent to-cyan-400/70" />
          <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-cyan-400">
            {eyebrow}
          </span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-cyan-400/30" />
        </div>
      )}
      <h1 className="font-display text-4xl font-bold uppercase leading-tight tracking-tight sm:text-5xl">
        <span className="text-gradient">{title}</span>
      </h1>
      {subtitle && (
        <p className="mt-3 max-w-2xl text-base text-muted-foreground/80 leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
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
    <div className="relative min-h-screen bg-transparent">
      <SceneOverlay />
      <ArenaNav />
      <main className="relative z-10 mx-auto max-w-7xl px-6 pb-24 pt-10">
        <PageHeader eyebrow={eyebrow} title={title} subtitle={subtitle} />
        {children}
      </main>
    </div>
  );
}

export function Panel({
  children,
  className = "",
  glow = false,
  padding = "p-6",
  ...props
}: {
  children: ReactNode;
  className?: string;
  glow?: boolean;
  padding?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`clip-blade relative overflow-hidden border border-slate-700/80 bg-gradient-to-b from-surface/60 to-surface/30 backdrop-blur-md ${
        glow ? "shadow-[0_0_40px_-12px_rgba(6,182,212,0.5)] ring-1 ring-cyan-400/30" : "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_8px_32px_rgba(0,0,0,0.6)]"
      } ${className}`}
      {...props}
    >
      <CornerScrew position="top-left" />
      <CornerScrew position="bottom-right" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />
      <div className={padding}>{children}</div>
    </div>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.32em] text-cyan-400/90">
      <span className="h-px w-4 bg-cyan-400/60" />
      {children}
    </span>
  );
}

export function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="group block">
      <span className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
        <span className="h-px w-3 bg-cyan-400/50 transition-all group-focus-within:w-5 group-focus-within:bg-cyan-400" />
        {label}
      </span>
      <input
        {...props}
        className="w-full clip-blade border border-white/10 bg-background/70 px-4 py-3 text-sm text-foreground outline-none backdrop-blur-sm transition-all placeholder:text-muted-foreground/40 focus:border-cyan-400/70 focus:bg-background/90 focus:shadow-[0_0_16px_-4px_rgba(6,182,212,0.5)] focus:ring-1 focus:ring-cyan-400/30"
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
  variant?: "primary" | "accent" | "ghost" | "danger";
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const styles = {
    primary:
      "bg-gradient-to-b from-[#334155] via-[#1e293b] to-[#0f172a] text-slate-100 border border-slate-500/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.35),inset_0_-2px_4px_rgba(0,0,0,0.8),0_4px_14px_rgba(0,0,0,0.85)] hover:border-cyan-400 hover:text-cyan-200 hover:shadow-[0_0_16px_rgba(6,182,212,0.4)] hover:scale-[1.02]",
    accent:
      "bg-gradient-to-b from-[#9a3412] via-[#7c2d12] to-[#1c1917] text-stone-100 border border-[#c2410c] shadow-[inset_0_1px_0_rgba(255,255,255,0.3),inset_0_-2px_4px_rgba(0,0,0,0.85),0_4px_16px_rgba(154,52,18,0.5)] hover:border-[#ea580c] hover:text-white hover:scale-[1.02]",
    ghost:
      "bg-gradient-to-b from-[#1e293b]/80 to-[#0f172a]/90 text-slate-200 border border-slate-600/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_2px_8px_rgba(0,0,0,0.8)] hover:border-cyan-400/60 hover:text-cyan-200",
    danger:
      "bg-gradient-to-b from-[#991b1b] via-[#7f1d1d] to-[#0f172a] text-red-100 border border-red-600/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_4px_14px_rgba(0,0,0,0.85)] hover:border-red-400 hover:text-white",
  }[variant];

  return (
    <button
      {...props}
      className={`clip-blade relative overflow-hidden px-7 py-3 font-display text-xs font-bold uppercase tracking-[0.22em] transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40 ${styles} ${className}`}
    >
      <CornerScrew position="top-left" />
      <CornerScrew position="bottom-right" />
      {children}
    </button>
  );
}

// ── Alert ─────────────────────────────────────────────────────────────────────
export function Alert({ children }: { children: ReactNode }) {
  if (!children) return null;
  return (
    <div className="clip-blade flex items-center gap-3 border border-destructive/40 bg-destructive/8 px-4 py-3 backdrop-blur">
      <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-destructive shadow-[0_0_6px_1px_var(--color-destructive)]" />
      <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-destructive">
        {children}
      </span>
    </div>
  );
}

// ── SuccessNotice ─────────────────────────────────────────────────────────────
export function SuccessNotice({ children }: { children: ReactNode }) {
  if (!children) return null;
  return (
    <div className="clip-blade flex items-center gap-3 border border-primary/30 bg-primary/8 px-4 py-3 backdrop-blur">
      <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary shadow-[0_0_6px_1px_var(--color-primary)]" />
      <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
        {children}
      </span>
    </div>
  );
}

// ── StatCard ──────────────────────────────────────────────────────────────────
export function StatCard({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: ReactNode;
  accent?: boolean;
}) {
  return (
    <div className="clip-blade border border-border bg-background/40 p-4 text-center backdrop-blur">
      <div
        className={`font-mono text-2xl font-bold tabular-nums ${accent ? "text-accent" : "text-primary"}`}
      >
        {value}
      </div>
      <div className="mt-1 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

// ── Badge ──────────────────────────────────────────────────────────────────────
export function Badge({
  children,
  variant = "default",
}: {
  children: ReactNode;
  variant?: "default" | "primary" | "accent" | "danger" | "success";
}) {
  const styles = {
    default: "border-border/60 text-muted-foreground",
    primary: "border-primary/50 text-primary bg-primary/8",
    accent: "border-accent/50 text-accent bg-accent/8",
    danger: "border-destructive/50 text-destructive bg-destructive/8",
    success: "border-emerald-400/50 text-emerald-400 bg-emerald-400/8",
  }[variant];
  return (
    <span
      className={`clip-blade border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.2em] ${styles}`}
    >
      {children}
    </span>
  );
}
