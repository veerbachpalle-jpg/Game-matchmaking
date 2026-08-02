import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { api, setToken, getToken, type ApiUser } from "@/lib/api";

type AuthState = {
  user: ApiUser | null;
  loading: boolean;
  login: (creds: { identifier: string; password: string; admin?: boolean }) => Promise<ApiUser>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

function identifierPayload(identifier: string) {
  return identifier.includes("@") ? { email: identifier } : { username: identifier.toLowerCase() };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const me = await api.me();
      setUser(me ?? null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!getToken()) {
      // Cookie-based sessions still work, so try once anyway.
      void refresh();
      return;
    }
    void refresh();
  }, [refresh]);

  const login = useCallback<AuthState["login"]>(async ({ identifier, password, admin }) => {
    const fn = admin ? api.adminLogin : api.login;
    const result = await fn({ ...identifierPayload(identifier), password });
    if (result?.Accesstokens) setToken(result.Accesstokens);
    setUser(result.user);
    setLoading(false);
    return result.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch {
      /* session may already be gone */
    }
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, logout, refresh }),
    [user, loading, login, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
