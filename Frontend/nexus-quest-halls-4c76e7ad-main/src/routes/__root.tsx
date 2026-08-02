import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { GlobalBackground } from "@/components/global-background";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AuthProvider } from "@/hooks/use-auth";

function NotFoundComponent() {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 overflow-hidden">
      {/* Grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(to right, oklch(0.82 0.16 195) 1px, transparent 1px), linear-gradient(to bottom, oklch(0.82 0.16 195) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />
      {/* Hero glow */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[60vh] opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, color-mix(in oklab, oklch(0.82 0.16 195) 16%, transparent), transparent 65%)",
        }}
      />
      <div className="relative z-10 max-w-md text-center">
        {/* 404 large text */}
        <div
          className="font-display text-[8rem] font-bold leading-none tracking-tight"
          style={{
            backgroundImage:
              "linear-gradient(120deg, oklch(0.82 0.16 195), oklch(0.78 0.17 320) 55%, oklch(0.72 0.19 45))",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
          }}
        >
          404
        </div>
        <div
          className="mx-auto mb-6 h-px w-32"
          style={{
            background:
              "linear-gradient(to right, transparent, oklch(0.82 0.16 195 / 60%), transparent)",
          }}
        />
        <h2 className="font-display text-2xl font-bold uppercase tracking-widest text-foreground">
          Sector Not Found
        </h2>
        <p className="mt-3 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          This region of the arena doesn't exist or has been purged.
        </p>
        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 clip-blade bg-primary px-6 py-3 font-display text-xs font-bold uppercase tracking-widest text-primary-foreground shadow-[0_0_20px_-6px_oklch(0.82_0.16_195)] transition-all hover:scale-105 hover:shadow-[0_0_28px_-4px_oklch(0.82_0.16_195)]"
            style={{ clipPath: "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)" }}
          >
            Return to Base
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 overflow-hidden">
      {/* Grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(to right, oklch(0.82 0.16 195) 1px, transparent 1px), linear-gradient(to bottom, oklch(0.82 0.16 195) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[50vh] opacity-30"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, color-mix(in oklab, oklch(0.60 0.24 25) 16%, transparent), transparent 65%)",
        }}
      />
      <div className="relative z-10 max-w-md text-center">
        <div className="mb-4 text-5xl">⚠️</div>
        <h1 className="font-display text-2xl font-bold uppercase tracking-widest text-foreground">
          System Error
        </h1>
        <p className="mt-3 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          A critical failure occurred. Attempt a reconnect or return to base.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            style={{ clipPath: "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)" }}
            className="inline-flex items-center gap-2 bg-primary px-5 py-2.5 font-display text-xs font-bold uppercase tracking-widest text-primary-foreground transition-all hover:scale-105"
          >
            ↺ Try Again
          </button>
          <a
            href="/"
            style={{ clipPath: "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)" }}
            className="inline-flex items-center gap-2 border border-white/10 bg-white/5 px-5 py-2.5 font-display text-xs font-bold uppercase tracking-widest text-foreground backdrop-blur transition-all hover:border-primary/30 hover:text-primary"
          >
            ← Return to Base
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "MATCHFORGE ARENA — Competitive Game Matchmaking" },
      {
        name: "description",
        content: "Skill-based matchmaking and instant browser play across every arena.",
      },
      { name: "author", content: "Nexus Arena" },
      { property: "og:title", content: "MATCHFORGE ARENA — Competitive Game Matchmaking" },
      {
        property: "og:description",
        content: "Skill-based matchmaking and instant browser play across every arena.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@Lovable" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@500;600;700&family=Rajdhani:wght@400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap",
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {/* Persistent Three.js scene — fixed behind every page except home */}
        <GlobalBackground />
        {/* Page content sits above the fixed canvas */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <Outlet />
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}
