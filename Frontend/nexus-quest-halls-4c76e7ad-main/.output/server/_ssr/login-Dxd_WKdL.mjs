import { o as __toESM } from "../_runtime.mjs";
import { a as require_react, i as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { a as useAuth } from "./use-auth-xjOyXtJV.mjs";
import { g as Link, v as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Field, n as Alert, o as Panel, r as ArenaShell, t as ActionButton } from "./arena-shell-pp1dsK4G.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-Dxd_WKdL.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function LoginPage() {
	const { login } = useAuth();
	const router = useRouter();
	const [identifier, setIdentifier] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [admin, setAdmin] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	async function onSubmit(e) {
		e.preventDefault();
		setBusy(true);
		setError(null);
		try {
			const user = await login({
				identifier,
				password,
				admin
			});
			router.navigate({ to: admin || user.role === "admin" ? "/admin" : "/play" });
		} catch (err) {
			setError(err instanceof Error ? err.message : "Login failed");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArenaShell, {
		eyebrow: "Access Terminal",
		title: "Enter the arena",
		subtitle: "Authenticate to join skill-based queues and compete across every region.",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-md",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mb-6 flex flex-wrap gap-2 animate-rise",
					style: { animationDelay: "0.1s" },
					children: [
						"Skill-based MMR",
						"Live ping routing",
						"Instant matchmaking"
					].map((feat) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "clip-blade border border-primary/20 bg-primary/5 px-3 py-1 font-mono text-[9px] uppercase tracking-widest text-primary/70",
						children: feat
					}, feat))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
					padding: "p-8 animate-rise",
					className: "shadow-[0_8px_60px_-20px_rgba(0,0,0,0.8)]",
					style: { animationDelay: "0.15s" },
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute right-4 top-4 h-12 w-12 clip-blade border border-primary/10 opacity-30" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-6 flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "flex h-8 w-8 items-center justify-center clip-blade bg-primary/15 ring-1 ring-primary/30",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-2 w-2 rotate-45 bg-primary" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-display text-sm font-bold uppercase tracking-widest text-foreground",
								children: "Operator Login"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-mono text-[9px] uppercase tracking-widest text-muted-foreground",
								children: "Secure auth · Encrypted session"
							})] })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							onSubmit,
							className: "flex flex-col gap-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Username or email",
									value: identifier,
									onChange: (e) => setIdentifier(e.target.value),
									placeholder: "shadowstrike",
									autoComplete: "username",
									required: true
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Password",
									type: "password",
									value: password,
									onChange: (e) => setPassword(e.target.value),
									placeholder: "••••••••",
									autoComplete: "current-password",
									required: true
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "group flex cursor-pointer items-center gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: `relative h-5 w-9 clip-blade transition-colors ${admin ? "bg-accent/30 ring-1 ring-accent/40" : "bg-white/5 ring-1 ring-white/10"}`,
										onClick: () => setAdmin((v) => !v),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "checkbox",
											checked: admin,
											onChange: (e) => setAdmin(e.target.checked),
											className: "sr-only"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `absolute top-0.5 h-4 w-4 clip-blade transition-all duration-200 ${admin ? "left-4 bg-accent" : "left-0.5 bg-muted-foreground/40"}` })]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground group-hover:text-foreground transition-colors",
										children: "Sign in as operator (admin)"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Alert, { children: error }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActionButton, {
									type: "submit",
									disabled: busy,
									className: "w-full justify-center",
									children: busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "flex items-center justify-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-1.5 w-1.5 animate-pulse rounded-full bg-current" }), "Authenticating…"]
									}) : "Enter Arena"
								})
							]
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-8 -mx-8 -mb-8 border-t border-border bg-background/20 px-8 py-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-center font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground",
								children: [
									"No profile?",
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/register",
										className: "text-primary transition-colors hover:text-accent",
										children: "Create one →"
									})
								]
							})
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-8 flex justify-center gap-2 opacity-30",
					children: [...Array(5)].map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-1 w-1 rounded-full bg-primary",
						style: { opacity: 1 - i * .15 }
					}, i))
				})
			]
		})
	});
}
//#endregion
export { LoginPage as component };
