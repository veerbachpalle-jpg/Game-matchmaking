import { o as __toESM } from "../_runtime.mjs";
import { a as require_react, i as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { a as useAuth, r as api } from "./use-auth-xjOyXtJV.mjs";
import { g as Link, v as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Field, n as Alert, o as Panel, r as ArenaShell, t as ActionButton } from "./arena-shell-pp1dsK4G.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/register-BTc5MS7g.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function FileField({ label, hint, onChange, required }) {
	const [name, setName] = (0, import_react.useState)("");
	const [preview, setPreview] = (0, import_react.useState)(null);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "group block cursor-pointer",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px w-3 bg-primary/40 transition-all group-hover:w-5 group-hover:bg-primary" }), label]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative clip-blade border border-dashed border-border bg-background/40 backdrop-blur transition-all group-hover:border-primary/30 group-hover:bg-primary/5",
			children: [preview ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative h-24 overflow-hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: preview,
					alt: "Preview",
					className: "h-full w-full object-cover opacity-60"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "absolute inset-0 flex items-center justify-center bg-background/40 backdrop-blur-sm",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-center",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-1 truncate px-4 font-mono text-[10px] text-primary",
							children: name
						})
					})
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-4 px-5 py-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-mono text-xs text-muted-foreground",
						children: name || hint
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-0.5 font-mono text-[9px] uppercase tracking-widest text-muted-foreground/50",
						children: "Click to browse"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "clip-blade border border-primary/30 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-primary transition-all group-hover:bg-primary/10",
					children: "Browse"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				type: "file",
				accept: "image/*",
				required,
				className: "hidden",
				onChange: (e) => {
					const file = e.target.files?.[0] ?? null;
					setName(file?.name ?? "");
					onChange(file);
					if (file) {
						const url = URL.createObjectURL(file);
						setPreview(url);
					} else setPreview(null);
				}
			})]
		})]
	});
}
var STEPS = [
	"Account",
	"Identity",
	"Review",
	"Verification"
];
function RegisterPage() {
	const router = useRouter();
	const { login } = useAuth();
	const [step, setStep] = (0, import_react.useState)(0);
	const [username, setUsername] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [avatar, setAvatar] = (0, import_react.useState)(null);
	const [coverimage, setCover] = (0, import_react.useState)(null);
	const [otp, setOtp] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)(null);
	const [notice, setNotice] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	async function onSubmitRegistration(e) {
		e.preventDefault();
		setBusy(true);
		setError(null);
		setNotice(null);
		try {
			const form = new FormData();
			form.append("username", username);
			form.append("email", email);
			form.append("password", password);
			if (avatar) form.append("avatar", avatar);
			if (coverimage) form.append("coverimage", coverimage);
			await api.register(form);
			await login({
				identifier: username,
				password
			});
			setNotice("Account created. A 6-digit OTP has been sent to your email (expires in 1 hour).");
			setStep(3);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Registration failed");
		} finally {
			setBusy(false);
		}
	}
	async function onVerifyOtp(e) {
		e.preventDefault();
		if (!otp) return;
		setBusy(true);
		setError(null);
		try {
			await api.verifyEmail(otp);
			router.navigate({ to: "/play" });
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to verify OTP");
		} finally {
			setBusy(false);
		}
	}
	async function onResendOtp() {
		setBusy(true);
		setError(null);
		try {
			await api.resendOtp();
			setNotice("A new 6-digit OTP has been sent to your email (expires in 1 hour).");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to resend OTP");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArenaShell, {
		eyebrow: "New Operative",
		title: "Create your profile",
		subtitle: "Your callsign and avatar appear in every lobby you drop into. Make them count.",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-lg",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-8 flex items-center gap-0 animate-rise",
				children: STEPS.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => i < step && step < 3 && setStep(i),
						className: `relative flex h-8 w-8 items-center justify-center clip-blade font-mono text-[10px] font-bold transition-all ${i < step ? "bg-primary/20 text-primary ring-1 ring-primary/40 cursor-pointer" : i === step ? "bg-primary text-primary-foreground shadow-[0_0_16px_-4px_var(--color-primary)]" : "bg-white/5 text-muted-foreground/50 cursor-default"}`,
						children: i < step ? "✓" : i + 1
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mx-2 hidden sm:block",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-mono text-[9px] uppercase tracking-widest text-muted-foreground",
								children: s
							})
						}), i < STEPS.length - 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `h-px w-12 transition-all ${i < step ? "bg-primary/50" : "bg-white/10"}` })]
					})]
				}, s))
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				padding: "p-8 animate-rise",
				className: "shadow-[0_8px_60px_-20px_rgba(0,0,0,0.8)]",
				style: { animationDelay: "0.1s" },
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" }), step < 3 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: onSubmitRegistration,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						step === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col gap-5 animate-rise",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Callsign",
									value: username,
									onChange: (e) => setUsername(e.target.value),
									placeholder: "shadowstrike",
									required: true
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Email",
									type: "email",
									value: email,
									onChange: (e) => setEmail(e.target.value),
									placeholder: "you@arena.gg",
									required: true
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Password",
									type: "password",
									value: password,
									onChange: (e) => setPassword(e.target.value),
									placeholder: "••••••••",
									autoComplete: "new-password",
									required: true
								})
							]
						}),
						step === 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col gap-5 animate-rise",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileField, {
								label: "Avatar (required)",
								hint: "Select a profile image",
								onChange: setAvatar,
								required: true
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileField, {
								label: "Cover image (optional)",
								hint: "Select a cover banner",
								onChange: setCover
							})]
						}),
						step === 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col gap-4 animate-rise",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-display text-sm font-bold uppercase tracking-widest text-foreground mb-2",
								children: "Confirm your details"
							}), [
								{
									label: "Callsign",
									value: username
								},
								{
									label: "Email",
									value: email
								},
								{
									label: "Avatar",
									value: avatar?.name || "None"
								},
								{
									label: "Cover",
									value: coverimage?.name || "None (optional)"
								}
							].map(({ label, value }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between clip-blade border border-border bg-background/30 px-4 py-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono text-[10px] uppercase tracking-widest text-muted-foreground",
									children: label
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono text-xs text-foreground truncate max-w-[60%] text-right",
									children: value
								})]
							}, label))]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Alert, { children: error })
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-8 -mx-8 -mb-8 border-t border-border bg-background/20 px-8 py-5 flex items-center justify-between gap-4",
						children: [step > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setStep((s) => s - 1),
							className: "font-mono text-[11px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors cursor-pointer",
							children: "← Back"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground",
							children: [
								"Already have an account?",
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/login",
									className: "text-primary hover:text-accent transition-colors",
									children: "Log in"
								})
							]
						}), step < 2 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActionButton, {
							type: "button",
							onClick: () => setStep((s) => s + 1),
							disabled: step === 0 && (!username || !email || !password),
							children: "Continue →"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActionButton, {
							type: "submit",
							variant: "accent",
							disabled: busy,
							children: busy ? "Processing…" : "Create Account"
						})]
					})]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: onVerifyOtp,
					className: "flex flex-col gap-5 animate-rise",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-display text-sm font-bold uppercase tracking-widest text-foreground",
							children: "Email Verification"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "clip-blade border border-amber-400/20 bg-amber-400/5 px-4 py-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "font-mono text-[10px] uppercase tracking-widest text-amber-400/80",
								children: [
									"Enter the 6-digit OTP sent to ",
									email,
									" (expires in 1 hour)."
								]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "6-Digit OTP Code",
							value: otp,
							onChange: (e) => setOtp(e.target.value),
							placeholder: "123456",
							maxLength: 6,
							required: true
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Alert, { children: error }),
						notice && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "clip-blade border border-primary/30 bg-primary/8 px-4 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-primary",
							children: notice
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 flex flex-col gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActionButton, {
								type: "submit",
								variant: "accent",
								disabled: busy || !otp,
								children: busy ? "Verifying…" : "Verify & Complete"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: onResendOtp,
								disabled: busy,
								className: "font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors cursor-pointer text-center py-2",
								children: "Resend OTP (1-Hr Expiry)"
							})]
						})
					]
				})]
			})]
		})
	});
}
//#endregion
export { RegisterPage as component };
