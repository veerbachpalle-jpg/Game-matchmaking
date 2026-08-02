import { o as __toESM } from "../_runtime.mjs";
import { a as require_react, i as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { a as useAuth, i as getToken, t as API_BASE_URL } from "./use-auth-xjOyXtJV.mjs";
import { g as Link, v as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as lookup } from "../_libs/socket.io-client+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/arena-shell-pp1dsK4G.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function useMatchmaking(enabled) {
	const socketRef = (0, import_react.useRef)(null);
	const [connected, setConnected] = (0, import_react.useState)(false);
	const [state, setState] = (0, import_react.useState)("idle");
	const [message, setMessage] = (0, import_react.useState)(null);
	const [match, setMatch] = (0, import_react.useState)(null);
	const [elapsed, setElapsed] = (0, import_react.useState)(0);
	const [ping, setPing] = (0, import_react.useState)(null);
	const [queueStatus, setQueueStatus] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (!enabled || typeof window === "undefined") return;
		const socket = lookup(API_BASE_URL, {
			withCredentials: true,
			auth: { token: getToken() ?? void 0 },
			transports: ["websocket", "polling"]
		});
		socketRef.current = socket;
		socket.on("connect", () => {
			setConnected(true);
			setMessage(null);
		});
		socket.on("disconnect", () => {
			setConnected(false);
			setPing(null);
			setQueueStatus(null);
		});
		socket.on("connect_error", (err) => {
			setConnected(false);
			setPing(null);
			setMessage(err.message || "Cannot reach the matchmaking server");
		});
		socket.on("queue-joined", () => setState("searching"));
		socket.on("queue left", () => {
			setState("idle");
			setQueueStatus(null);
		});
		socket.on("queue-status", (status) => {
			setQueueStatus(status);
		});
		socket.on("four-player-match", (payload) => {
			setMatch(payload);
			setState("matched");
			setQueueStatus(null);
		});
		socket.on("match-found", (payload) => {
			setMatch(payload);
			setState("matched");
			setQueueStatus(null);
		});
		socket.on("error", (payload) => {
			setState("error");
			setMessage(payload?.message ?? "Matchmaking error");
		});
		return () => {
			socket.removeAllListeners();
			socket.disconnect();
			socketRef.current = null;
		};
	}, [enabled]);
	(0, import_react.useEffect)(() => {
		if (!connected || !socketRef.current) return;
		const measurePing = () => {
			const start = Date.now();
			socketRef.current?.emit("ping-check", start, (sentTime) => {
				const latency = Math.max(1, Math.round(Date.now() - sentTime));
				setPing(latency);
			});
		};
		measurePing();
		const interval = setInterval(measurePing, 3e3);
		return () => clearInterval(interval);
	}, [connected]);
	(0, import_react.useEffect)(() => {
		if (state !== "searching") {
			setElapsed(0);
			return;
		}
		const t = setInterval(() => setElapsed((e) => e + 1), 1e3);
		return () => clearInterval(t);
	}, [state]);
	const joinQueue = (opts) => {
		setMatch(null);
		setMessage(null);
		setQueueStatus(null);
		setState("searching");
		socketRef.current?.emit("join-queue", opts);
	};
	const leaveQueue = () => {
		setState("idle");
		setQueueStatus(null);
		socketRef.current?.emit("leave-queue", {});
	};
	const joinGameRoom = (roomId) => {
		socketRef.current?.emit("join-game-room", { roomId });
	};
	return {
		connected,
		state,
		message,
		match,
		elapsed,
		ping,
		queueStatus,
		joinQueue,
		leaveQueue,
		joinGameRoom
	};
}
var LINKS = [
	{
		to: "/play",
		label: "Matchmaking"
	},
	{
		to: "/matches",
		label: "Matches"
	},
	{
		to: "/profile",
		label: "Profile"
	}
];
function CornerScrew({ position }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `pointer-events-none absolute ${position === "top-left" ? "top-2 left-2" : "bottom-2 right-2"} z-20 flex h-3.5 w-3.5 items-center justify-center rounded-full border border-slate-500 bg-gradient-to-br from-slate-300 via-slate-600 to-slate-950 shadow-[inset_0_1px_1px_rgba(255,255,255,0.7),0_2px_4px_rgba(0,0,0,0.95)]`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-2 w-0.5 rotate-45 bg-slate-950 shadow-[0_0_1px_rgba(255,255,255,0.4)]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute h-2 w-0.5 -rotate-45 bg-slate-950 shadow-[0_0_1px_rgba(255,255,255,0.4)]" })]
	});
}
function ArenaNav() {
	const { user, logout } = useAuth();
	const router = useRouter();
	const mm = useMatchmaking(Boolean(user));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
		className: "sticky top-0 z-50",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative border-b border-cyan-500/20 bg-background/80 backdrop-blur-xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/",
							className: "group flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "relative flex h-9 w-9 items-center justify-center clip-blade bg-gradient-to-br from-cyan-500/40 via-cyan-600/20 to-orange-600/30 ring-1 ring-cyan-400/50 shadow-[0_0_18px_-2px_rgba(6,182,212,0.5)] transition-all group-hover:shadow-[0_0_26px_0px_rgba(6,182,212,0.7)]",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-2.5 w-2.5 rotate-45 bg-cyan-400 transition-transform group-hover:rotate-[135deg] duration-500 shadow-[0_0_8px_rgba(6,182,212,0.9)]" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-display text-lg font-bold tracking-[0.35em] text-foreground group-hover:text-cyan-300 transition-all",
								children: "MATCHFORGE"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
							className: "hidden items-center gap-1 md:flex",
							children: [LINKS.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: l.to,
								activeProps: { className: "bg-cyan-500/15 text-cyan-300 ring-1 ring-cyan-400/40 shadow-[0_0_14px_-2px_rgba(6,182,212,0.4)]" },
								className: "flex items-center gap-1.5 rounded-sm clip-blade px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground transition-all hover:bg-white/5 hover:text-foreground",
								children: l.label
							}, l.to)), user?.role === "admin" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/admin",
								activeProps: { className: "bg-orange-500/15 text-orange-400 ring-1 ring-orange-400/40" },
								className: "flex items-center gap-1.5 rounded-sm clip-blade px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-orange-400/80 transition-all hover:bg-orange-500/10 hover:text-orange-300",
								children: "Admin"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex items-center gap-3",
							children: user ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								mm.connected && mm.ping !== null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "hidden items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground sm:flex",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `h-1.5 w-1.5 rounded-full animate-pulse ${mm.ping < 60 ? "bg-emerald-400 shadow-[0_0_6px_1px_#34d399]" : mm.ping < 120 ? "bg-amber-400" : "bg-destructive"}` }),
										mm.ping,
										"ms"
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "hidden items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground sm:flex",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "clip-blade bg-cyan-500/15 px-2.5 py-1 text-cyan-300 ring-1 ring-cyan-400/30",
										children: user.username
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									onClick: async () => {
										await logout();
										router.navigate({ to: "/login" });
									},
									className: "clip-blade relative border border-slate-600/70 bg-gradient-to-b from-[#334155] via-[#1e293b] to-[#0f172a] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] transition-all hover:border-destructive/60 hover:text-destructive",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CornerScrew, { position: "top-left" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CornerScrew, { position: "bottom-right" }),
										"Log out"
									]
								})
							] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/login",
								className: "clip-blade relative border border-slate-600/70 bg-gradient-to-b from-[#334155] via-[#1e293b] to-[#0f172a] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] transition-all hover:border-cyan-400/50 hover:text-cyan-300",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CornerScrew, { position: "top-left" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CornerScrew, { position: "bottom-right" }),
									"Log in"
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/register",
								className: "clip-blade relative border border-cyan-500/80 bg-gradient-to-b from-[#0284c7] via-[#0369a1] to-[#0f172a] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_0_16px_rgba(6,182,212,0.4)] transition-all hover:scale-105",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CornerScrew, { position: "top-left" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CornerScrew, { position: "bottom-right" }),
									"Sign up"
								]
							})] })
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" })
			]
		})
	});
}
function SceneOverlay() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pointer-events-none fixed inset-0 z-0 overflow-hidden",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "absolute inset-x-0 top-0 h-[50vh] opacity-35",
			style: { background: "var(--gradient-hero)" }
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "absolute inset-y-0 left-0 w-2/3",
			style: { background: "linear-gradient(to right, rgba(8,17,26,0.35) 0%, transparent 100%)" }
		})]
	});
}
function PageHeader({ eyebrow, title, subtitle }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "animate-rise mb-10",
		children: [
			eyebrow && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-3 flex items-center gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-px w-8 bg-gradient-to-r from-transparent to-cyan-400/70" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono text-[10px] uppercase tracking-[0.4em] text-cyan-400",
						children: eyebrow
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-px flex-1 bg-gradient-to-l from-transparent to-cyan-400/30" })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-4xl font-bold uppercase leading-tight tracking-tight sm:text-5xl",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-gradient",
					children: title
				})
			}),
			subtitle && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 max-w-2xl text-base text-muted-foreground/80 leading-relaxed",
				children: subtitle
			})
		]
	});
}
function ArenaShell({ eyebrow, title, subtitle, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative min-h-screen bg-transparent",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SceneOverlay, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArenaNav, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "relative z-10 mx-auto max-w-7xl px-6 pb-24 pt-10",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
					eyebrow,
					title,
					subtitle
				}), children]
			})
		]
	});
}
function Panel({ children, className = "", glow = false, padding = "p-6", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `clip-blade relative overflow-hidden border border-slate-700/80 bg-gradient-to-b from-surface/60 to-surface/30 backdrop-blur-md ${glow ? "shadow-[0_0_40px_-12px_rgba(6,182,212,0.5)] ring-1 ring-cyan-400/30" : "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_8px_32px_rgba(0,0,0,0.6)]"} ${className}`,
		...props,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CornerScrew, { position: "top-left" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CornerScrew, { position: "bottom-right" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: padding,
				children
			})
		]
	});
}
function SectionLabel({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.32em] text-cyan-400/90",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px w-4 bg-cyan-400/60" }), children]
	});
}
function Field({ label, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "group block",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px w-3 bg-cyan-400/50 transition-all group-focus-within:w-5 group-focus-within:bg-cyan-400" }), label]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			...props,
			className: "w-full clip-blade border border-white/10 bg-background/70 px-4 py-3 text-sm text-foreground outline-none backdrop-blur-sm transition-all placeholder:text-muted-foreground/40 focus:border-cyan-400/70 focus:bg-background/90 focus:shadow-[0_0_16px_-4px_rgba(6,182,212,0.5)] focus:ring-1 focus:ring-cyan-400/30"
		})]
	});
}
function ActionButton({ children, variant = "primary", className = "", ...props }) {
	const styles = {
		primary: "bg-gradient-to-b from-[#334155] via-[#1e293b] to-[#0f172a] text-slate-100 border border-slate-500/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.35),inset_0_-2px_4px_rgba(0,0,0,0.8),0_4px_14px_rgba(0,0,0,0.85)] hover:border-cyan-400 hover:text-cyan-200 hover:shadow-[0_0_16px_rgba(6,182,212,0.4)] hover:scale-[1.02]",
		accent: "bg-gradient-to-b from-[#9a3412] via-[#7c2d12] to-[#1c1917] text-stone-100 border border-[#c2410c] shadow-[inset_0_1px_0_rgba(255,255,255,0.3),inset_0_-2px_4px_rgba(0,0,0,0.85),0_4px_16px_rgba(154,52,18,0.5)] hover:border-[#ea580c] hover:text-white hover:scale-[1.02]",
		ghost: "bg-gradient-to-b from-[#1e293b]/80 to-[#0f172a]/90 text-slate-200 border border-slate-600/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_2px_8px_rgba(0,0,0,0.8)] hover:border-cyan-400/60 hover:text-cyan-200",
		danger: "bg-gradient-to-b from-[#991b1b] via-[#7f1d1d] to-[#0f172a] text-red-100 border border-red-600/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_4px_14px_rgba(0,0,0,0.85)] hover:border-red-400 hover:text-white"
	}[variant];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		...props,
		className: `clip-blade relative overflow-hidden px-7 py-3 font-display text-xs font-bold uppercase tracking-[0.22em] transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40 ${styles} ${className}`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CornerScrew, { position: "top-left" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CornerScrew, { position: "bottom-right" }),
			children
		]
	});
}
function Alert({ children }) {
	if (!children) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "clip-blade flex items-center gap-3 border border-destructive/40 bg-destructive/8 px-4 py-3 backdrop-blur",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-1.5 w-1.5 flex-shrink-0 rounded-full bg-destructive shadow-[0_0_6px_1px_var(--color-destructive)]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-mono text-[11px] uppercase tracking-[0.18em] text-destructive",
			children
		})]
	});
}
function SuccessNotice({ children }) {
	if (!children) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "clip-blade flex items-center gap-3 border border-primary/30 bg-primary/8 px-4 py-3 backdrop-blur",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary shadow-[0_0_6px_1px_var(--color-primary)]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-mono text-[11px] uppercase tracking-[0.18em] text-primary",
			children
		})]
	});
}
function StatCard({ label, value, accent = false }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "clip-blade border border-border bg-background/40 p-4 text-center backdrop-blur",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: `font-mono text-2xl font-bold tabular-nums ${accent ? "text-accent" : "text-primary"}`,
			children: value
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-1 font-mono text-[9px] uppercase tracking-widest text-muted-foreground",
			children: label
		})]
	});
}
function Badge({ children, variant = "default" }) {
	const styles = {
		default: "border-border/60 text-muted-foreground",
		primary: "border-primary/50 text-primary bg-primary/8",
		accent: "border-accent/50 text-accent bg-accent/8",
		danger: "border-destructive/50 text-destructive bg-destructive/8",
		success: "border-emerald-400/50 text-emerald-400 bg-emerald-400/8"
	}[variant];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: `clip-blade border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.2em] ${styles}`,
		children
	});
}
//#endregion
export { Field as a, StatCard as c, Badge as i, SuccessNotice as l, Alert as n, Panel as o, ArenaShell as r, SectionLabel as s, ActionButton as t, useMatchmaking as u };
