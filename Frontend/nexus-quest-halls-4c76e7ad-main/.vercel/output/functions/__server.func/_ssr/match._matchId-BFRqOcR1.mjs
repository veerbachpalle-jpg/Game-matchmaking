import { i as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { m as createFileRoute, p as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/match._matchId-BFRqOcR1.js
var import_jsx_runtime = require_jsx_runtime();
var $$splitComponentImporter$1 = () => import("./matches-TEPbz7FH.mjs");
var Route$1 = createFileRoute("/matches")({
	component: lazyRouteComponent($$splitComponentImporter$1, "component"),
	head: () => ({ meta: [
		{ title: "Match History — Matchforge Arena" },
		{
			name: "description",
			content: "Review your recent four-player Matchforge Arena matches, lobby rosters, MMR snapshots and results."
		},
		{
			property: "og:title",
			content: "Match History — Matchforge Arena"
		},
		{
			property: "og:description",
			content: "Review your recent matches, rosters, MMR snapshots and results."
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
function StatusChip({ status }) {
	const config = {
		completed: {
			style: "border-primary/50 text-primary bg-primary/8 shadow-[0_0_8px_-4px_var(--color-primary)]",
			dot: "bg-primary",
			label: "Completed"
		},
		cancelled: {
			style: "border-destructive/50 text-destructive bg-destructive/8",
			dot: "bg-destructive",
			label: "Cancelled"
		},
		ongoing: {
			style: "border-accent/50 text-accent bg-accent/8 animate-pulse",
			dot: "bg-accent",
			label: "Live"
		}
	}[status] ?? {
		style: "border-border/60 text-muted-foreground",
		dot: "bg-muted-foreground",
		label: status
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: `clip-blade flex items-center gap-1.5 border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] ${config.style}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `h-1.5 w-1.5 rounded-full flex-shrink-0 ${config.dot}` }), config.label]
	});
}
var $$splitComponentImporter = () => import("./match._matchId-BqYXuKKg.mjs");
var Route = createFileRoute("/match/$matchId")({
	component: lazyRouteComponent($$splitComponentImporter, "component"),
	head: () => ({ meta: [
		{ title: "Match Room — Matchforge Arena" },
		{
			name: "description",
			content: "Live match room with the full lobby roster, MMR snapshots and the final scoreboard."
		},
		{
			property: "og:title",
			content: "Match Room — Matchforge Arena"
		},
		{
			property: "og:description",
			content: "Live lobby roster, MMR snapshots and the final scoreboard."
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
//#endregion
export { Route$1 as n, StatusChip as r, Route as t };
