// Thin client for the Express backend (Game-matchmaking).
// Base URL is configurable so the same build works against local + deployed API.
export const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ||
  "http://localhost:8000";

const TOKEN_KEY = "nexus.accessToken";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  formData?: FormData;
};

export async function apiFetch<T = unknown>(
  path: string,
  { method = "GET", body, formData }: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers["Content-Type"] = "application/json";

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      credentials: "include",
      body: formData ?? (body !== undefined ? JSON.stringify(body) : undefined),
    });
  } catch {
    throw new ApiError(
      `Cannot reach the game server at ${API_BASE_URL}. Is the backend running?`,
      0,
    );
  }

  const text = await response.text();
  let payload: any = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new ApiError(payload?.message || `Request failed (${response.status})`, response.status);
  }
  return (payload?.data ?? payload) as T;
}

// ---- Domain types (mirrors backend responses) ----
export type ApiUser = {
  _id: string;
  username: string;
  email?: string;
  avatar?: string;
  coverimage?: string;
  rank?: string;
  role?: "user" | "admin";
  status?: string;
  isverified?: boolean;
  friends?: string[];
  createdAt?: string;
};

export type MatchPlayer = {
  userId: string;
  username: string;
  avatar?: string;
  rank?: string;
  mmrAtMatch?: number;
};

export type GameState = {
  matchId: string;
  board: (string | null)[];
  players: { X: string; O: string };
  currentTurn: string;
  status: "ongoing" | "completed" | "draw";
  winner?: string | null;
};

export type Match = {
  matchId: string;
  gameMode: string;
  status: string;
  players: MatchPlayer[];
  gameState?: GameState | null;
  result?: { winnerId?: string | null; scores?: Record<string, number>; mmrChanges?: Record<string, number> } | null;
  createdAt: string;
};

// ---- Endpoints ----
export const api = {
  register: (form: FormData) =>
    apiFetch<ApiUser>("/user/register", { method: "POST", formData: form }),

  login: (body: { username?: string; email?: string; password: string }) =>
    apiFetch<{ user: ApiUser; Accesstokens: string }>("/user/login", { method: "POST", body }),

  adminLogin: (body: { username?: string; email?: string; password: string }) =>
    apiFetch<{ user: ApiUser; Accesstokens: string }>("/user/admin/login", {
      method: "POST",
      body,
    }),

  logout: () => apiFetch("/user/logout", { method: "POST" }),

  me: () => apiFetch<ApiUser>("/user/me"),

  changePassword: (body: { password: string; newpassword: string }) =>
    apiFetch("/user/change-password", { method: "POST", body }),

  addFriend: (friendId: string) =>
    apiFetch("/user/add-friend", { method: "POST", body: { friendId } }),

  updateAvatar: (form: FormData) =>
    apiFetch<ApiUser>("/user/avatar", { method: "PATCH", formData: form }),

  updateCoverImage: (form: FormData) =>
    apiFetch<ApiUser>("/user/cover-image", { method: "PATCH", formData: form }),

  verifyEmail: (otp: string) =>
    apiFetch<ApiUser>("/user/verify-email", { method: "POST", body: { otp } }),

  resendOtp: () =>
    apiFetch("/user/resend-otp", { method: "POST" }),

  myMatches: () => apiFetch<Match[]>("/match/four-player"),

  match: (matchId: string) => apiFetch<Match>(`/match/four-player/${matchId}`),

  submitResult: (matchId: string, body: { winnerId?: string; scores?: Record<string, number> }) =>
    apiFetch(`/match/four-player/${matchId}/result`, { method: "POST", body }),

  adminUsers: () => apiFetch<ApiUser[]>("/user/admin/users"),

  adminDeleteUser: (userId: string) =>
    apiFetch(`/user/admin/users/${userId}`, { method: "DELETE" }),

  adminUpdateRole: (userId: string, role: "user" | "admin") =>
    apiFetch(`/user/admin/users/${userId}/role`, { method: "PATCH", body: { role } }),
};
