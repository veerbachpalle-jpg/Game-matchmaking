import { o as __toESM } from "../_runtime.mjs";
import { a as require_react, i as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-auth-xjOyXtJV.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var API_BASE_URL = "http://localhost:8000";
var TOKEN_KEY = "nexus.accessToken";
function getToken() {
	if (typeof window === "undefined") return null;
	return window.localStorage.getItem(TOKEN_KEY);
}
function setToken(token) {
	if (typeof window === "undefined") return;
	if (token) window.localStorage.setItem(TOKEN_KEY, token);
	else window.localStorage.removeItem(TOKEN_KEY);
}
var ApiError = class extends Error {
	status;
	constructor(message, status) {
		super(message);
		this.status = status;
	}
};
async function apiFetch(path, { method = "GET", body, formData } = {}) {
	const headers = {};
	const token = getToken();
	if (token) headers.Authorization = `Bearer ${token}`;
	if (body !== void 0) headers["Content-Type"] = "application/json";
	let response;
	try {
		response = await fetch(`${API_BASE_URL}${path}`, {
			method,
			headers,
			credentials: "include",
			body: formData ?? (body !== void 0 ? JSON.stringify(body) : void 0)
		});
	} catch {
		throw new ApiError(`Cannot reach the game server at ${API_BASE_URL}. Is the backend running?`, 0);
	}
	const text = await response.text();
	let payload = null;
	try {
		payload = text ? JSON.parse(text) : null;
	} catch {
		payload = null;
	}
	if (!response.ok) throw new ApiError(payload?.message || `Request failed (${response.status})`, response.status);
	return payload?.data ?? payload;
}
var api = {
	register: (form) => apiFetch("/user/register", {
		method: "POST",
		formData: form
	}),
	login: (body) => apiFetch("/user/login", {
		method: "POST",
		body
	}),
	adminLogin: (body) => apiFetch("/user/admin/login", {
		method: "POST",
		body
	}),
	logout: () => apiFetch("/user/logout", { method: "POST" }),
	me: () => apiFetch("/user/me"),
	changePassword: (body) => apiFetch("/user/change-password", {
		method: "POST",
		body
	}),
	addFriend: (friendId) => apiFetch("/user/add-friend", {
		method: "POST",
		body: { friendId }
	}),
	updateAvatar: (form) => apiFetch("/user/avatar", {
		method: "PATCH",
		formData: form
	}),
	updateCoverImage: (form) => apiFetch("/user/cover-image", {
		method: "PATCH",
		formData: form
	}),
	verifyEmail: (otp) => apiFetch("/user/verify-email", {
		method: "POST",
		body: { otp }
	}),
	resendOtp: () => apiFetch("/user/resend-otp", { method: "POST" }),
	myMatches: () => apiFetch("/match/four-player"),
	match: (matchId) => apiFetch(`/match/four-player/${matchId}`),
	submitResult: (matchId, body) => apiFetch(`/match/four-player/${matchId}/result`, {
		method: "POST",
		body
	}),
	adminUsers: () => apiFetch("/user/admin/users"),
	adminDeleteUser: (userId) => apiFetch(`/user/admin/users/${userId}`, { method: "DELETE" }),
	adminUpdateRole: (userId, role) => apiFetch(`/user/admin/users/${userId}/role`, {
		method: "PATCH",
		body: { role }
	})
};
var AuthContext = (0, import_react.createContext)(null);
function identifierPayload(identifier) {
	return identifier.includes("@") ? { email: identifier } : { username: identifier.toLowerCase() };
}
function AuthProvider({ children }) {
	const [user, setUser] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const refresh = (0, import_react.useCallback)(async () => {
		try {
			const me = await api.me();
			setUser(me ?? null);
		} catch {
			setUser(null);
		} finally {
			setLoading(false);
		}
	}, []);
	(0, import_react.useEffect)(() => {
		if (typeof window === "undefined") return;
		if (!getToken()) {
			refresh();
			return;
		}
		refresh();
	}, [refresh]);
	const login = (0, import_react.useCallback)(async ({ identifier, password, admin }) => {
		const result = await (admin ? api.adminLogin : api.login)({
			...identifierPayload(identifier),
			password
		});
		if (result?.Accesstokens) setToken(result.Accesstokens);
		setUser(result.user);
		setLoading(false);
		return result.user;
	}, []);
	const logout = (0, import_react.useCallback)(async () => {
		try {
			await api.logout();
		} catch {}
		setToken(null);
		setUser(null);
	}, []);
	const value = (0, import_react.useMemo)(() => ({
		user,
		loading,
		login,
		logout,
		refresh
	}), [
		user,
		loading,
		login,
		logout,
		refresh
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthContext.Provider, {
		value,
		children
	});
}
function useAuth() {
	const ctx = (0, import_react.useContext)(AuthContext);
	if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
	return ctx;
}
//#endregion
export { useAuth as a, getToken as i, AuthProvider as n, api as r, API_BASE_URL as t };
