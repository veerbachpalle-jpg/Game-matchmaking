import { o as __toESM } from "../_runtime.mjs";
import { a as require_react, i as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { a as useAuth, r as api } from "./use-auth-DmMqZnzY.mjs";
import { _ as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Field, c as StatCard, i as Badge, l as SuccessNotice, n as Alert, o as Panel, r as ArenaShell, s as SectionLabel, t as ActionButton } from "./arena-shell-DirkRN1v.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/profile-D1WPUHLP.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ProfilePage() {
	const { user, loading, refresh } = useAuth();
	const navigate = useNavigate();
	const [password, setPassword] = (0, import_react.useState)("");
	const [newpassword, setNewPassword] = (0, import_react.useState)("");
	const [friendId, setFriendId] = (0, import_react.useState)("");
	const [notice, setNotice] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	const [activeTab, setActiveTab] = (0, import_react.useState)("overview");
	const [uploadingAvatar, setUploadingAvatar] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (!loading && !user) navigate({ to: "/login" });
	}, [
		loading,
		user,
		navigate
	]);
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArenaShell, {
		title: "Loading profile…",
		children: null
	});
	async function handleAvatarChange(e) {
		const file = e.target.files?.[0];
		if (!file) return;
		setUploadingAvatar(true);
		setError(null);
		setNotice(null);
		try {
			const formData = new FormData();
			formData.append("avatar", file);
			await api.updateAvatar(formData);
			setNotice("Profile picture updated successfully!");
			await refresh();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to update avatar");
		} finally {
			setUploadingAvatar(false);
		}
	}
	async function run(fn, ok) {
		setError(null);
		setNotice(null);
		try {
			await fn();
			setNotice(ok);
			await refresh();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Request failed");
		}
	}
	const TABS = [
		{
			id: "overview",
			label: "Overview"
		},
		{
			id: "squad",
			label: `Squad · ${user.friends?.length ?? 0}`
		},
		{
			id: "security",
			label: "Security"
		}
	];
	const userRankLower = user.rank?.toLowerCase();
	const rankColor = userRankLower === "diamond" ? "text-cyan-300 border-cyan-400/50 bg-cyan-400/8" : userRankLower === "platinum" ? "text-violet-300 border-violet-400/50 bg-violet-400/8" : userRankLower === "gold" ? "text-amber-300 border-amber-400/50 bg-amber-400/8" : userRankLower === "silver" ? "text-slate-300 border-slate-400/50 bg-slate-400/8" : "text-muted-foreground border-border bg-background/40";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArenaShell, {
		eyebrow: "Dossier",
		title: user.username,
		subtitle: user.email,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-6 lg:grid-cols-[300px_1fr]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
					padding: "p-0 animate-rise",
					className: "shadow-[0_8px_40px_-16px_rgba(0,0,0,0.8)]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative h-36 overflow-hidden",
							children: [user.coverimage ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: user.coverimage,
								alt: `${user.username} cover art`,
								className: "h-full w-full object-cover",
								loading: "lazy"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-full w-full",
								style: { background: "linear-gradient(135deg, oklch(0.22 0.06 250), oklch(0.18 0.04 280) 50%, oklch(0.22 0.06 300))" }
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-t from-surface/85 to-transparent" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative -mt-10 px-5 pb-5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-end gap-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "relative group cursor-pointer",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										htmlFor: "avatar-upload",
										className: "cursor-pointer block relative",
										children: [user.avatar ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
											src: user.avatar,
											alt: `${user.username} avatar`,
											className: "h-20 w-20 clip-blade object-cover ring-2 ring-primary/30 shadow-[0_0_20px_-6px_var(--color-primary)] transition-all group-hover:brightness-75",
											loading: "lazy"
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "flex h-20 w-20 items-center justify-center clip-blade bg-primary/15 font-display text-2xl text-primary ring-2 ring-primary/30 shadow-[0_0_20px_-6px_var(--color-primary)] transition-all group-hover:brightness-75",
											children: user.username.slice(0, 2).toUpperCase()
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity clip-blade text-[10px] font-mono uppercase tracking-tighter text-white font-bold",
											children: uploadingAvatar ? "Uploading…" : "Change"
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										id: "avatar-upload",
										type: "file",
										accept: "image/*",
										className: "hidden",
										onChange: handleAvatarChange,
										disabled: uploadingAvatar
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "pb-1 flex-1 min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "font-display text-lg font-bold uppercase tracking-[0.14em] text-foreground truncate",
										children: user.username
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "font-mono text-[9px] uppercase tracking-widest text-muted-foreground",
										children: user.email
									})]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 flex flex-wrap gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: `clip-blade border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.2em] font-bold ${rankColor}`,
										children: user.rank || "Unranked"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: user.role === "admin" ? "accent" : "default",
										children: user.role || "user"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: "success",
										children: "online"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: "success",
										children: "VERIFIED"
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" })
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-2 gap-3 animate-rise",
					style: { animationDelay: "0.1s" },
					children: [{
						label: "Squad Size",
						value: user.friends?.length ?? 0,
						accent: false
					}, {
						label: "MMR Tier",
						value: user.rank ? user.rank.toUpperCase() : "—",
						accent: true
					}].map(({ label, value, accent }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label,
						value,
						accent
					}, label))
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-4 animate-rise",
				style: { animationDelay: "0.15s" },
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "clip-blade border border-border bg-surface/30 backdrop-blur-md p-1 flex gap-1",
						children: TABS.map((tab) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setActiveTab(tab.id),
							className: `flex flex-1 items-center justify-center gap-2 clip-blade px-4 py-2.5 font-mono text-[10px] uppercase tracking-widest transition-all cursor-pointer ${activeTab === tab.id ? "bg-primary/15 text-primary ring-1 ring-primary/30 shadow-[0_0_12px_-4px_var(--color-primary)]" : "text-muted-foreground hover:text-foreground hover:bg-white/5"}`,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "hidden sm:inline",
								children: tab.label
							})
						}, tab.id))
					}),
					activeTab === "overview" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
						padding: "p-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col gap-5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionLabel, { children: "Account Information" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid gap-3",
								children: [
									{
										label: "Username",
										value: user.username
									},
									{
										label: "Email",
										value: user.email
									},
									{
										label: "Email Status",
										value: "VERIFIED"
									},
									{
										label: "Role",
										value: user.role || "user"
									},
									{
										label: "Status",
										value: "online"
									},
									{
										label: "Rank",
										value: user.rank || "Unranked"
									},
									{
										label: "User ID",
										value: user._id?.slice(-8)?.toUpperCase() ?? "—"
									}
								].map(({ label, value }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between clip-blade border border-border bg-background/30 px-4 py-3 group hover:border-primary/20 hover:bg-primary/5 transition-all",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-mono text-[10px] uppercase tracking-widest text-muted-foreground",
										children: label
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-mono text-xs text-foreground truncate max-w-[60%] text-right",
										children: value
									})]
								}, label))
							})]
						})]
					}),
					activeTab === "squad" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
						padding: "p-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col gap-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SectionLabel, { children: [
									"Squad Roster · ",
									user.friends?.length ?? 0,
									" members"
								] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										value: friendId,
										onChange: (e) => setFriendId(e.target.value),
										placeholder: "Enter friend user ID…",
										className: "flex-1 clip-blade border border-border bg-background/40 px-4 py-3 text-sm text-foreground outline-none backdrop-blur placeholder:text-muted-foreground/40 focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActionButton, {
										variant: "ghost",
										onClick: () => run(() => api.addFriend(friendId), "Squad member added"),
										disabled: !friendId,
										children: "Add"
									})]
								}),
								notice && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SuccessNotice, { children: notice }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Alert, { children: error }),
								user.friends && user.friends.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex flex-col gap-2",
									children: user.friends.map((fid) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-3 clip-blade border border-border bg-background/30 px-4 py-3",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "flex h-8 w-8 items-center justify-center clip-blade bg-primary/10 font-display text-xs text-primary",
												children: "OP"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-mono text-[10px] uppercase tracking-widest text-foreground",
												children: fid
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												variant: "success",
												children: "Online"
											})
										]
									}, fid))
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex flex-col items-center gap-3 py-10 text-center",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-mono text-[11px] uppercase tracking-widest text-muted-foreground",
										children: "Your squad is empty. Add operatives by ID."
									})
								})
							]
						})]
					}),
					activeTab === "security" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
						padding: "p-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col gap-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionLabel, { children: "Change Password" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "clip-blade border border-amber-400/15 bg-amber-400/5 px-4 py-3",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-mono text-[10px] uppercase tracking-widest text-amber-400/80",
										children: "Use a strong passphrase. Your account protects your competitive history."
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
									className: "flex flex-col gap-5",
									onSubmit: (e) => {
										e.preventDefault();
										run(() => api.changePassword({
											password,
											newpassword
										}), "Password updated").then(() => {
											setPassword("");
											setNewPassword("");
										});
									},
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "Current password",
											type: "password",
											value: password,
											onChange: (e) => setPassword(e.target.value),
											required: true
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "New password",
											type: "password",
											value: newpassword,
											onChange: (e) => setNewPassword(e.target.value),
											required: true
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActionButton, {
											type: "submit",
											children: "Update Password"
										})
									]
								}),
								notice && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SuccessNotice, { children: notice }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Alert, { children: error })
							]
						})]
					})
				]
			})]
		})
	});
}
//#endregion
export { ProfilePage as component };
