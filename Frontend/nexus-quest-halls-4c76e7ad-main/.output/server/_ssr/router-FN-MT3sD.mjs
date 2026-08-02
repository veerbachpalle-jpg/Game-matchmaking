import { o as __toESM } from "../_runtime.mjs";
import { a as require_react, i as require_jsx_runtime, n as QueryClientProvider } from "../_libs/react+tanstack__react-query.mjs";
import { n as AuthProvider } from "./use-auth-xjOyXtJV.mjs";
import { c as HeadContent, d as createRouter, f as Outlet, g as Link, h as createRootRouteWithContext, l as useLocation, m as createFileRoute, p as lazyRouteComponent, s as Scripts, v as useRouter, y as ClientOnly } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { n as Route$1$1, t as Route$8 } from "./match._matchId-Bh5ZsMv2.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-FN-MT3sD.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* GlobalBackground – mounts the Three.js scene as a fixed, full-viewport layer
* behind all content on every page except the home page (which has its own
* full-opacity hero scene).  On the home page we render nothing so the hero's
* own canvas takes over.
*/
function GlobalBackground() {
	if (useLocation().pathname === "/") return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"aria-hidden": "true",
		style: {
			position: "fixed",
			inset: 0,
			zIndex: 0,
			pointerEvents: "none"
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClientOnly, { fallback: null }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: {
				position: "absolute",
				inset: 0,
				background: "linear-gradient(to bottom, rgba(8,17,26,0.62) 0%, rgba(8,17,26,0.45) 40%, rgba(8,17,26,0.62) 100%)",
				pointerEvents: "none"
			} }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: {
				position: "absolute",
				inset: 0,
				background: "radial-gradient(ellipse 70% 80% at 30% 50%, rgba(8,17,26,0.0) 0%, rgba(8,17,26,0.55) 100%)",
				pointerEvents: "none"
			} })
		]
	});
}
var styles_default = "/assets/styles-ya1Kw8w5.css";
function reportLovableError(error, context = {}) {
	if (typeof window === "undefined") return;
	window.__lovableEvents?.captureException?.(error, {
		source: "react_error_boundary",
		route: window.location.pathname,
		...context
	}, {
		mechanism: "react_error_boundary",
		handled: false,
		severity: "error"
	});
	const message = error instanceof Response ? `Response ${error.status}${error.url ? ` at ${error.url}` : ""}` : error instanceof Error ? error.message : String(error);
	window.__lovableReportRuntimeError?.({
		message,
		stack: error instanceof Error ? error.stack : void 0,
		filename: window.location.pathname
	});
}
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative flex min-h-screen items-center justify-center px-4 overflow-hidden",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-none absolute inset-0 opacity-[0.04]",
				style: {
					backgroundImage: "linear-gradient(to right, oklch(0.82 0.16 195) 1px, transparent 1px), linear-gradient(to bottom, oklch(0.82 0.16 195) 1px, transparent 1px)",
					backgroundSize: "80px 80px"
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-none absolute inset-x-0 top-0 h-[60vh] opacity-40",
				style: { background: "radial-gradient(ellipse 80% 60% at 50% 0%, color-mix(in oklab, oklch(0.82 0.16 195) 16%, transparent), transparent 65%)" }
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative z-10 max-w-md text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-display text-[8rem] font-bold leading-none tracking-tight",
						style: {
							backgroundImage: "linear-gradient(120deg, oklch(0.82 0.16 195), oklch(0.78 0.17 320) 55%, oklch(0.72 0.19 45))",
							backgroundClip: "text",
							WebkitBackgroundClip: "text",
							color: "transparent"
						},
						children: "404"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mx-auto mb-6 h-px w-32",
						style: { background: "linear-gradient(to right, transparent, oklch(0.82 0.16 195 / 60%), transparent)" }
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl font-bold uppercase tracking-widest text-foreground",
						children: "Sector Not Found"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 font-mono text-[11px] uppercase tracking-widest text-muted-foreground",
						children: "This region of the arena doesn't exist or has been purged."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-8",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/",
							className: "inline-flex items-center gap-2 clip-blade bg-primary px-6 py-3 font-display text-xs font-bold uppercase tracking-widest text-primary-foreground shadow-[0_0_20px_-6px_oklch(0.82_0.16_195)] transition-all hover:scale-105 hover:shadow-[0_0_28px_-4px_oklch(0.82_0.16_195)]",
							style: { clipPath: "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)" },
							children: "Return to Base"
						})
					})
				]
			})
		]
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		reportLovableError(error, { boundary: "tanstack_root_error_component" });
	}, [error]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative flex min-h-screen items-center justify-center px-4 overflow-hidden",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-none absolute inset-0 opacity-[0.04]",
				style: {
					backgroundImage: "linear-gradient(to right, oklch(0.82 0.16 195) 1px, transparent 1px), linear-gradient(to bottom, oklch(0.82 0.16 195) 1px, transparent 1px)",
					backgroundSize: "80px 80px"
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-none absolute inset-x-0 top-0 h-[50vh] opacity-30",
				style: { background: "radial-gradient(ellipse 80% 60% at 50% 0%, color-mix(in oklab, oklch(0.60 0.24 25) 16%, transparent), transparent 65%)" }
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative z-10 max-w-md text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mb-4 text-5xl",
						children: "⚠️"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-2xl font-bold uppercase tracking-widest text-foreground",
						children: "System Error"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 font-mono text-[11px] uppercase tracking-widest text-muted-foreground",
						children: "A critical failure occurred. Attempt a reconnect or return to base."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-8 flex flex-wrap justify-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => {
								router.invalidate();
								reset();
							},
							style: { clipPath: "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)" },
							className: "inline-flex items-center gap-2 bg-primary px-5 py-2.5 font-display text-xs font-bold uppercase tracking-widest text-primary-foreground transition-all hover:scale-105",
							children: "↺ Try Again"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "/",
							style: { clipPath: "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)" },
							className: "inline-flex items-center gap-2 border border-white/10 bg-white/5 px-5 py-2.5 font-display text-xs font-bold uppercase tracking-widest text-foreground backdrop-blur transition-all hover:border-primary/30 hover:text-primary",
							children: "← Return to Base"
						})]
					})
				]
			})
		]
	});
}
var Route$7 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "MATCHFORGE ARENA — Competitive Game Matchmaking" },
			{
				name: "description",
				content: "Skill-based matchmaking and instant browser play across every arena."
			},
			{
				name: "author",
				content: "Nexus Arena"
			},
			{
				property: "og:title",
				content: "MATCHFORGE ARENA — Competitive Game Matchmaking"
			},
			{
				property: "og:description",
				content: "Skill-based matchmaking and instant browser play across every arena."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			},
			{
				name: "twitter:site",
				content: "@Lovable"
			}
		],
		links: [
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@500;600;700&family=Rajdhani:wght@400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap"
			},
			{
				rel: "icon",
				href: "/favicon.ico",
				type: "image/x-icon"
			}
		]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
function RootComponent() {
	const { queryClient } = Route$7.useRouteContext();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryClientProvider, {
		client: queryClient,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AuthProvider, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GlobalBackground, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			style: {
				position: "relative",
				zIndex: 1
			},
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})
		})] })
	});
}
var $$splitComponentImporter$5 = () => import("./routes-az8G-XQv.mjs");
var Route$6 = createFileRoute("/")({
	component: lazyRouteComponent($$splitComponentImporter$5, "component"),
	head: () => ({ meta: [
		{ title: "MATCHFORGE ARENA — Competitive Matchmaking & Instant Play" },
		{
			name: "description",
			content: "Skill-based matchmaking in under 8 seconds. Queue, drop into the arena, and climb the global ladder across every title you play."
		},
		{
			property: "og:title",
			content: "MATCHFORGE ARENA — Competitive Matchmaking & Instant Play"
		},
		{
			property: "og:description",
			content: "Skill-based matchmaking in under 8 seconds. Queue, drop in, and climb the global ladder."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] })
});
var $$splitComponentImporter$4 = () => import("./admin-DdvfieyB.mjs");
var Route$5 = createFileRoute("/admin")({
	component: lazyRouteComponent($$splitComponentImporter$4, "component"),
	head: () => ({ meta: [
		{ title: "Operator Console — Matchforge Arena" },
		{
			name: "description",
			content: "Admin console for Matchforge Arena: manage registered operatives, roles and account removals."
		},
		{
			property: "og:title",
			content: "Operator Console — Matchforge Arena"
		},
		{
			property: "og:description",
			content: "Manage registered operatives, roles and account removals."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		},
		{
			name: "robots",
			content: "noindex"
		}
	] })
});
var $$splitComponentImporter$3 = () => import("./login-Dxd_WKdL.mjs");
var Route$4 = createFileRoute("/login")({
	component: lazyRouteComponent($$splitComponentImporter$3, "component"),
	head: () => ({ meta: [
		{ title: "Log In — Matchforge Arena Matchmaking" },
		{
			name: "description",
			content: "Sign in to Matchforge Arena to enter the competitive queue and track your match history."
		},
		{
			property: "og:title",
			content: "Log In — Matchforge Arena Matchmaking"
		},
		{
			property: "og:description",
			content: "Sign in to enter the competitive queue and track your match history."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] })
});
var $$splitComponentImporter$2 = () => import("./play-ZiCF8cQz.mjs");
var Route$3 = createFileRoute("/play")({
	component: lazyRouteComponent($$splitComponentImporter$2, "component"),
	head: () => ({ meta: [
		{ title: "Matchmaking Queue — Matchforge Arena" },
		{
			name: "description",
			content: "Pick a region and game mode, join the live skill-based queue, and drop into your match instantly."
		},
		{
			property: "og:title",
			content: "Matchmaking Queue — Matchforge Arena"
		},
		{
			property: "og:description",
			content: "Pick a region and mode, join the live queue, and drop into your match."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] })
});
var $$splitComponentImporter$1 = () => import("./profile-Dpc1hKlo.mjs");
var Route$2 = createFileRoute("/profile")({
	component: lazyRouteComponent($$splitComponentImporter$1, "component"),
	head: () => ({ meta: [
		{ title: "Operative Profile — Matchforge Arena" },
		{
			name: "description",
			content: "Manage your Matchforge Arena callsign, rank, squad roster and account security settings."
		},
		{
			property: "og:title",
			content: "Operative Profile — Matchforge Arena"
		},
		{
			property: "og:description",
			content: "Manage your callsign, rank, squad roster and security settings."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] })
});
var $$splitComponentImporter = () => import("./register-BTc5MS7g.mjs");
var Route$1 = createFileRoute("/register")({
	component: lazyRouteComponent($$splitComponentImporter, "component"),
	head: () => ({ meta: [
		{ title: "Create Profile — Matchforge Arena" },
		{
			name: "description",
			content: "Create your Matchforge Arena profile, upload your avatar, and start climbing the competitive ladder."
		},
		{
			property: "og:title",
			content: "Create Profile — Matchforge Arena"
		},
		{
			property: "og:description",
			content: "Create your profile and start climbing the competitive ladder."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] })
});
var BASE_URL = "";
var Route = createFileRoute("/sitemap.xml")({ server: { handlers: { GET: async () => {
	const xml = [
		`<?xml version="1.0" encoding="UTF-8"?>`,
		`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
		...[
			{
				path: "/",
				changefreq: "weekly",
				priority: "1.0"
			},
			{
				path: "/play",
				changefreq: "daily",
				priority: "0.9"
			},
			{
				path: "/login",
				changefreq: "monthly",
				priority: "0.5"
			},
			{
				path: "/register",
				changefreq: "monthly",
				priority: "0.6"
			}
		].map((e) => [
			`  <url>`,
			`    <loc>${BASE_URL}${e.path}</loc>`,
			e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
			e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
			e.priority ? `    <priority>${e.priority}</priority>` : null,
			`  </url>`
		].filter(Boolean).join("\n")),
		`</urlset>`
	].join("\n");
	return new Response(xml, { headers: {
		"Content-Type": "application/xml",
		"Cache-Control": "public, max-age=3600"
	} });
} } } });
var rootRouteChildren = {
	IndexRoute: Route$6.update({
		id: "/",
		path: "/",
		getParentRoute: () => Route$7
	}),
	AdminRoute: Route$5.update({
		id: "/admin",
		path: "/admin",
		getParentRoute: () => Route$7
	}),
	LoginRoute: Route$4.update({
		id: "/login",
		path: "/login",
		getParentRoute: () => Route$7
	}),
	MatchesRoute: Route$1$1.update({
		id: "/matches",
		path: "/matches",
		getParentRoute: () => Route$7
	}),
	PlayRoute: Route$3.update({
		id: "/play",
		path: "/play",
		getParentRoute: () => Route$7
	}),
	ProfileRoute: Route$2.update({
		id: "/profile",
		path: "/profile",
		getParentRoute: () => Route$7
	}),
	RegisterRoute: Route$1.update({
		id: "/register",
		path: "/register",
		getParentRoute: () => Route$7
	}),
	SitemapDotxmlRoute: Route.update({
		id: "/sitemap.xml",
		path: "/sitemap.xml",
		getParentRoute: () => Route$7
	}),
	MatchMatchIdRoute: Route$8.update({
		id: "/match/$matchId",
		path: "/match/$matchId",
		getParentRoute: () => Route$7
	})
};
var routeTree = Route$7._addFileChildren(rootRouteChildren)._addFileTypes();
var getRouter = () => {
	const queryClient = new QueryClient();
	return createRouter({
		routeTree,
		context: { queryClient },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { getRouter };
