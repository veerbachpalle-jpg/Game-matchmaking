import { o as __toESM } from "../_runtime.mjs";
import { a as require_react, i as require_jsx_runtime, r as useQueryClient, t as useQuery } from "../_libs/react+tanstack__react-query.mjs";
import { a as useAuth, r as api } from "./use-auth-DmMqZnzY.mjs";
import { _ as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as StatCard, i as Badge, n as Alert, o as Panel, r as ArenaShell, s as SectionLabel, t as ActionButton } from "./arena-shell-DirkRN1v.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-C5rnVpNY.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AdminPage() {
	const { user, loading } = useAuth();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [error, setError] = (0, import_react.useState)(null);
	const [search, setSearch] = (0, import_react.useState)("");
	const [filter, setFilter] = (0, import_react.useState)("all");
	const [confirmDelete, setConfirmDelete] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (loading) return;
		if (!user) navigate({ to: "/login" });
		else if (user.role !== "admin") navigate({ to: "/play" });
	}, [
		loading,
		user,
		navigate
	]);
	const { data, isLoading, error: queryError } = useQuery({
		queryKey: ["admin-users"],
		queryFn: api.adminUsers,
		enabled: user?.role === "admin"
	});
	async function act(fn) {
		setError(null);
		try {
			await fn();
			await queryClient.invalidateQueries({ queryKey: ["admin-users"] });
		} catch (err) {
			setError(err instanceof Error ? err.message : "Action failed");
		}
	}
	const filtered = data?.filter((u) => {
		const matchesSearch = !search || u.username.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
		const matchesRole = filter === "all" || u.role === filter;
		return matchesSearch && matchesRole;
	});
	const admins = data?.filter((u) => u.role === "admin").length ?? 0;
	const users = data?.filter((u) => u.role !== "admin").length ?? 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ArenaShell, {
		eyebrow: "Operator Console",
		title: "Registered operatives",
		subtitle: "Promote, demote, or purge accounts from the network. Use with care.",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-6 grid grid-cols-3 gap-3 animate-rise",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Total Operatives",
						value: data?.length ?? "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Operators (Admin)",
						value: admins,
						accent: true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Standard Users",
						value: users
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-5 flex flex-wrap items-center gap-3 animate-rise",
				style: { animationDelay: "0.05s" },
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative flex-1 min-w-[200px]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 font-mono text-[10px]",
						children: "🔍"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: search,
						onChange: (e) => setSearch(e.target.value),
						placeholder: "Search by callsign or email…",
						className: "w-full clip-blade border border-border bg-background/50 pl-8 pr-4 py-2.5 font-mono text-sm text-foreground outline-none backdrop-blur placeholder:text-muted-foreground/40 focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex gap-1",
					children: [
						"all",
						"admin",
						"user"
					].map((role) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setFilter(role),
						className: `clip-blade px-4 py-2.5 font-mono text-[10px] uppercase tracking-widest transition-all cursor-pointer ${filter === role ? "bg-primary/15 text-primary ring-1 ring-primary/30" : "border border-border bg-surface/30 text-muted-foreground hover:text-foreground"}`,
						children: role
					}, role))
				})]
			}),
			queryError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-5",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Alert, { children: queryError.message })
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-5",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Alert, { children: error })
			}),
			isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-col gap-3",
				children: [...Array(5)].map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "clip-blade border border-border bg-surface/20 p-5 animate-pulse flex items-center gap-4",
					style: { opacity: 1 - i * .1 },
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-11 w-11 clip-blade bg-white/5" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex-1 space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-3 w-32 rounded bg-white/5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-2 w-48 rounded bg-white/5" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-8 w-20 clip-blade bg-white/5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-8 w-20 clip-blade bg-white/5" })]
						})
					]
				}, i))
			}),
			filtered && filtered.length === 0 && !isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				padding: "py-16 text-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-4xl mb-3 opacity-30",
					children: "👤"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-[11px] uppercase tracking-widest text-muted-foreground",
					children: "No operatives match your filters"
				})]
			}),
			filtered && filtered.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SectionLabel, { children: [
					filtered.length,
					" operative",
					filtered.length !== 1 ? "s" : "",
					" found"
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-col gap-2 mt-2",
					children: filtered.map((u, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "group clip-blade relative overflow-hidden border border-border bg-surface/30 backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-surface/50",
						style: { animationDelay: `${idx * .03}s` },
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `absolute left-0 inset-y-0 w-0.5 ${u.role === "admin" ? "bg-accent shadow-[1px_0_6px_var(--color-ember)]" : "bg-primary/30"}` }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "px-5 py-4 flex flex-wrap items-center gap-4",
							children: [
								u.avatar ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: u.avatar,
									alt: `${u.username} avatar`,
									className: "h-11 w-11 clip-blade object-cover ring-1 ring-border",
									loading: "lazy"
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "flex h-11 w-11 items-center justify-center clip-blade bg-primary/10 font-display text-sm text-primary ring-1 ring-primary/20",
									children: u.username.slice(0, 2).toUpperCase()
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex-1 min-w-[10rem]",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap items-center gap-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-display text-sm font-bold uppercase tracking-[0.14em] text-foreground",
												children: u.username
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												variant: u.role === "admin" ? "accent" : "default",
												children: u.role
											}),
											u.rank && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												variant: "primary",
												children: u.rank
											})
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground",
										children: [
											u.email ?? "no email",
											" · ",
											u.status || "online"
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActionButton, {
										variant: "ghost",
										className: "py-2 px-4",
										onClick: () => act(() => api.adminUpdateRole(u._id, u.role === "admin" ? "user" : "admin")),
										children: u.role === "admin" ? "Demote" : "Promote"
									}), confirmDelete === u._id ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => {
												act(() => api.adminDeleteUser(u._id));
												setConfirmDelete(null);
											},
											className: "clip-blade bg-destructive/20 border border-destructive/50 px-4 py-2 font-display text-[10px] font-bold uppercase tracking-widest text-destructive hover:bg-destructive/30 transition-colors cursor-pointer",
											children: "Confirm"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => setConfirmDelete(null),
											className: "font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors cursor-pointer",
											children: "Cancel"
										})]
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => setConfirmDelete(u._id),
										className: "clip-blade border border-destructive/30 px-4 py-2 font-display text-[10px] font-bold uppercase tracking-widest text-destructive/70 transition-all hover:border-destructive/60 hover:bg-destructive/10 hover:text-destructive cursor-pointer",
										children: "Remove"
									})]
								})
							]
						})]
					}, u._id))
				})]
			})
		]
	});
}
//#endregion
export { AdminPage as component };
