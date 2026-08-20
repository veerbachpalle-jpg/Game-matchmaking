import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useRef, useCallback } from "react";
import { ArenaShell, ActionButton, Alert, Field, Panel } from "@/components/arena-shell";
import { api, type SearchUserResult, type FriendData } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
  head: () => ({
    meta: [
      { title: "User Profile — Vector Pair" },
      {
        name: "description",
        content: "Manage your Vector Pair profile, rank, friends list and account security settings.",
      },
      { property: "og:title", content: "User Profile — Vector Pair" },
      {
        property: "og:description",
        content: "Manage your profile, rank, friends list and security settings.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function ProfilePage() {
  const { user, loading, refresh } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [newpassword, setNewPassword] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [otp, setOtp] = useState("");

  // Friend search state
  const [friendSearch, setFriendSearch] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUserResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [addingUserId, setAddingUserId] = useState<string | null>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  // Debounced search
  const handleSearchChange = useCallback((value: string) => {
    setFriendSearch(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (!value.trim()) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await api.searchUsers(value.trim());
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 350);
  }, []);

  async function handleAddFriend(targetUser: SearchUserResult) {
    setAddingUserId(targetUser._id);
    setError(null);
    setNotice(null);
    try {
      await api.addFriendByUsername(targetUser.username);
      setNotice(`${targetUser.username} added to your friends!`);
      // Remove from search results
      setSearchResults((prev) => prev.filter((u) => u._id !== targetUser._id));
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add friend");
    } finally {
      setAddingUserId(null);
    }
  }

  if (!user) return <ArenaShell title="Loading profile…">{null}</ArenaShell>;

  async function run(fn: () => Promise<unknown>, ok: string) {
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

  async function handleAvatarUpload(file: File) {
    const form = new FormData();
    form.append("avatar", file);
    await run(() => api.updateAvatar(form), "Avatar updated successfully");
  }

  async function handleCoverUpload(file: File) {
    const form = new FormData();
    form.append("coverimage", file);
    await run(() => api.updateCoverImage(form), "Cover image updated successfully");
  }

  const statusColor = (s?: string) => {
    if (s === "online") return "border-green-500/60 text-green-400";
    if (s === "in-game") return "border-cyan-500/60 text-cyan-400";
    if (s === "Inqueue") return "border-amber-500/60 text-amber-400";
    return "border-border/60 text-muted-foreground";
  };

  return (
    <ArenaShell eyebrow="Profile" title={user.username} subtitle={user.email}>
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Panel className="overflow-hidden p-0">
          <div className="relative group">
            {user.coverimage ? (
              <img
                src={user.coverimage}
                alt={`${user.username} cover art`}
                className="h-40 w-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="h-40 w-full" style={{ background: "var(--gradient-edge)" }} />
            )}
            <label className="absolute top-3 right-3 cursor-pointer bg-background/80 hover:bg-background px-3 py-1 text-[10px] font-mono uppercase tracking-[0.2em] text-foreground border border-border">
              Change Cover
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleCoverUpload(file);
                }}
              />
            </label>
          </div>
          <div className="flex items-center gap-4 p-6">
            <div className="relative group">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={`${user.username} avatar`}
                  className="h-16 w-16 object-cover border border-primary/40"
                  loading="lazy"
                />
              ) : (
                <span className="grid h-16 w-16 place-items-center bg-primary/15 font-display text-lg text-primary border border-primary/40">
                  {user.username.slice(0, 2).toUpperCase()}
                </span>
              )}
              <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 cursor-pointer text-[9px] font-mono uppercase tracking-[0.1em] text-white">
                Edit
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleAvatarUpload(file);
                  }}
                />
              </label>
            </div>
            <div>
              <div className="font-display text-xl font-bold tracking-[0.14em] text-foreground">
                {user.username}
              </div>
              <div className="mt-1 flex flex-wrap gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                <span className="border border-primary/50 px-2 py-1 text-primary">
                  {user.rank || "unranked"}
                </span>
                <span className="border border-primary/30 px-2 py-1 text-foreground">
                  {user.mmr ?? 1000} mmr
                </span>
                <span className="border border-border/60 px-2 py-1">
                  {user.role || "user"}
                </span>
                <span className={`border px-2 py-1 ${user.isverified ? "border-green-500/50 text-green-400" : "border-amber-500/50 text-amber-400"}`}>
                  {user.isverified ? "Verified" : "Unverified"}
                </span>
              </div>
            </div>
          </div>
          <div className="border-t border-border/60 px-6 py-5">
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
              Friends List · {user.friends?.length ?? 0}
            </span>
            <div className="mt-4 relative">
              <input
                value={friendSearch}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search players by username…"
                className="w-full border border-input bg-background/60 px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors"
              />
              {searchLoading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <span className="inline-block h-4 w-4 border-2 border-primary/40 border-t-primary rounded-full animate-spin" />
                </div>
              )}
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mt-2 border border-border/60 bg-background/95 backdrop-blur-sm max-h-60 overflow-y-auto">
                {searchResults.map((result) => {
                  const isAlreadyFriend = user.friends?.includes(result._id);
                  return (
                    <div
                      key={result._id}
                      className="flex items-center gap-3 px-4 py-3 border-b border-border/30 last:border-b-0 hover:bg-primary/5 transition-colors"
                    >
                      {result.avatar ? (
                        <img
                          src={result.avatar}
                          alt={result.username}
                          className="h-8 w-8 object-cover border border-primary/30 flex-shrink-0"
                        />
                      ) : (
                        <span className="grid h-8 w-8 place-items-center bg-primary/15 text-xs font-display text-primary border border-primary/30 flex-shrink-0">
                          {result.username.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-display text-sm font-semibold tracking-wide text-foreground truncate">
                          {result.username}
                        </div>
                        <div className="flex gap-2 mt-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
                          <span>{result.rank || "Unranked"}</span>
                          <span>·</span>
                          <span>{result.mmr ?? 1000} MMR</span>
                          {result.status && (
                            <>
                              <span>·</span>
                              <span className={statusColor(result.status)}>{result.status}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <ActionButton
                        variant="ghost"
                        onClick={() => handleAddFriend(result)}
                        disabled={!!isAlreadyFriend || addingUserId === result._id}
                      >
                        {addingUserId === result._id
                          ? "Adding…"
                          : isAlreadyFriend
                            ? "Friend"
                            : "Add"}
                      </ActionButton>
                    </div>
                  );
                })}
              </div>
            )}

            {/* No results message */}
            {friendSearch.trim() && !searchLoading && searchResults.length === 0 && (
              <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground text-center py-2">
                No players found matching "{friendSearch}"
              </p>
            )}

            {/* Existing Friends List */}
            <FriendsList userId={user._id} />
          </div>
        </Panel>

        <div className="flex flex-col gap-6">
          {!user.isverified && (
            <Panel>
              <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-amber-400">
                Email Verification
              </span>
              <p className="mt-2 text-xs text-muted-foreground">
                Verify your email address to enable full multiplayer match access. Check your email inbox for your 6-digit OTP.
              </p>
              <form
                className="mt-4 flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  run(() => api.verifyEmail(otp), "Email verified successfully!");
                }}
              >
                <input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  className="flex-1 border border-input bg-background/60 px-4 py-2 text-sm font-mono tracking-widest outline-none focus:border-primary"
                  required
                />
                <ActionButton type="submit" variant="accent">
                  Verify OTP
                </ActionButton>
              </form>
              <button
                type="button"
                onClick={() => run(() => api.resendOtp(), "OTP resent to your email!")}
                className="mt-3 text-[11px] font-mono uppercase tracking-[0.16em] text-primary hover:underline"
              >
                Resend OTP
              </button>
            </Panel>
          )}

          <Panel>
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
              Security
            </span>
            <form
              className="mt-5 flex flex-col gap-5"
              onSubmit={(e) => {
                e.preventDefault();
                run(() => api.changePassword({ password, newpassword }), "Password updated").then(
                  () => {
                    setPassword("");
                    setNewPassword("");
                  },
                );
              }}
            >
              <Field
                label="Current password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Field
                label="New password"
                type="password"
                value={newpassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <ActionButton type="submit">Change password</ActionButton>
            </form>
            {notice && (
              <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.16em] text-primary">
                {notice}
              </p>
            )}
            <div className="mt-5">
              <Alert>{error}</Alert>
            </div>
          </Panel>
        </div>
      </div>
    </ArenaShell>
  );
}

function FriendsList({ userId }: { userId: string }) {
  const [friends, setFriends] = useState<FriendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    api.getFriends()
      .then(setFriends)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  async function handleRemove(friendId: string) {
    setRemovingId(friendId);
    try {
      await api.removeFriend(friendId);
      setFriends((prev) => prev.filter((f) => f._id !== friendId));
    } catch { /* silent */ }
    finally { setRemovingId(null); }
  }

  const statusDot = (s: string) => {
    if (s === "online") return "bg-green-500";
    if (s === "in-game") return "bg-cyan-500 animate-pulse";
    if (s === "Inqueue") return "bg-amber-500 animate-pulse";
    return "bg-neutral-600";
  };
  const statusLabel = (s: string) => {
    if (s === "online") return "Online";
    if (s === "in-game") return "In Game";
    if (s === "Inqueue") return "In Queue";
    return "Offline";
  };

  if (loading) {
    return (
      <div className="mt-4 flex justify-center py-4">
        <span className="inline-block h-5 w-5 border-2 border-primary/40 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (friends.length === 0) return null;

  // Sort online first
  const sorted = [...friends].sort((a, b) => {
    const order: Record<string, number> = { online: 0, Inqueue: 1, "in-game": 2, offline: 3 };
    return (order[a.status] ?? 3) - (order[b.status] ?? 3);
  });

  return (
    <div className="mt-8 relative">
      <div className="absolute inset-0 bg-primary/5 blur-xl -z-10 rounded-3xl opacity-50" />
      <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-primary drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]">
        Friends List
      </span>
      <ul className="mt-4 flex flex-col gap-2">
        {sorted.map((f) => (
          <li
            key={f._id}
            className="group/fr flex items-center gap-4 rounded-xl bg-surface/30 px-3 py-3 border border-white/5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-surface/60 hover:border-primary/30 hover:shadow-lg"
          >
            {f.avatar ? (
              <img
                src={f.avatar}
                alt={f.username}
                className={`h-10 w-10 rounded-lg object-cover ring-1 flex-shrink-0 transition-all ${
                  f.status === "offline" ? "ring-white/10 opacity-50 grayscale" : "ring-primary/40 shadow-[0_0_12px_rgba(255,215,0,0.15)]"
                }`}
                loading="lazy"
              />
            ) : (
              <span className={`grid h-10 w-10 rounded-lg place-items-center text-sm font-display ring-1 flex-shrink-0 transition-all ${
                f.status === "offline" ? "ring-white/10 bg-neutral-800/50 text-muted-foreground" : "ring-primary/40 bg-primary/10 text-primary shadow-[0_0_12px_rgba(255,215,0,0.15)]"
              }`}>
                {f.username.slice(0, 2).toUpperCase()}
              </span>
            )}
            <div className="flex-1 min-w-0">
              <span className={`font-display text-sm font-bold tracking-wide truncate block ${
                f.status === "offline" ? "text-muted-foreground" : "text-foreground"
              }`}>
                {f.username}
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className={`h-2 w-2 rounded-full flex-shrink-0 ${statusDot(f.status)} ${f.status === 'online' ? 'shadow-[0_0_8px_rgba(34,197,94,0.6)]' : ''}`} />
                <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
                  {statusLabel(f.status)} · {f.rank} · {f.mmr} MMR
                </span>
              </div>
            </div>
            <button
              onClick={() => handleRemove(f._id)}
              disabled={removingId === f._id}
              className="opacity-0 group-hover/fr:opacity-100 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-destructive/70 hover:bg-destructive/20 transition-all disabled:opacity-30"
              title="Remove friend"
            >
              {removingId === f._id ? "…" : "Remove"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
