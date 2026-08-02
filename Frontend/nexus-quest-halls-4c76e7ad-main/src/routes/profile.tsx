import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArenaShell,
  ActionButton,
  Alert,
  Field,
  Panel,
  SectionLabel,
  Badge,
  SuccessNotice,
  StatCard,
} from "@/components/arena-shell";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
  head: () => ({
    meta: [
      { title: "Operative Profile — Matchforge Arena" },
      {
        name: "description",
        content: "Manage your Matchforge Arena callsign, rank, squad roster and account security settings.",
      },
      { property: "og:title", content: "Operative Profile — Matchforge Arena" },
      {
        property: "og:description",
        content: "Manage your callsign, rank, squad roster and security settings.",
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
  const [friendId, setFriendId] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "squad" | "security">("overview");

  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  if (!user) return <ArenaShell title="Loading profile…">{null}</ArenaShell>;

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
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

  const TABS = [
    { id: "overview" as const, label: "Overview" },
    { id: "squad" as const, label: `Squad · ${user.friends?.length ?? 0}` },
    { id: "security" as const, label: "Security" },
  ];

  const userRankLower = user.rank?.toLowerCase();
  const rankColor =
    userRankLower === "diamond"
      ? "text-cyan-300 border-cyan-400/50 bg-cyan-400/8"
      : userRankLower === "platinum"
      ? "text-violet-300 border-violet-400/50 bg-violet-400/8"
      : userRankLower === "gold"
      ? "text-amber-300 border-amber-400/50 bg-amber-400/8"
      : userRankLower === "silver"
      ? "text-slate-300 border-slate-400/50 bg-slate-400/8"
      : "text-muted-foreground border-border bg-background/40";

  return (
    <ArenaShell eyebrow="Dossier" title={user.username} subtitle={user.email}>
      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <div className="flex flex-col gap-4">
          <Panel
            padding="p-0 animate-rise"
            className="shadow-[0_8px_40px_-16px_rgba(0,0,0,0.8)]"
          >
            <div className="relative h-36 overflow-hidden">
              {user.coverimage ? (
                <img
                  src={user.coverimage}
                  alt={`${user.username} cover art`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div
                  className="h-full w-full"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.22 0.06 250), oklch(0.18 0.04 280) 50%, oklch(0.22 0.06 300))",
                  }}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-surface/85 to-transparent" />
            </div>

            <div className="relative -mt-10 px-5 pb-5">
              <div className="flex items-end gap-4">
                <div className="relative group cursor-pointer">
                  <label htmlFor="avatar-upload" className="cursor-pointer block relative">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={`${user.username} avatar`}
                        className="h-20 w-20 clip-blade object-cover ring-2 ring-primary/30 shadow-[0_0_20px_-6px_var(--color-primary)] transition-all group-hover:brightness-75"
                        loading="lazy"
                      />
                    ) : (
                      <span className="flex h-20 w-20 items-center justify-center clip-blade bg-primary/15 font-display text-2xl text-primary ring-2 ring-primary/30 shadow-[0_0_20px_-6px_var(--color-primary)] transition-all group-hover:brightness-75">
                        {user.username.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity clip-blade text-[10px] font-mono uppercase tracking-tighter text-white font-bold">
                      {uploadingAvatar ? "Uploading…" : "Change"}
                    </div>
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                    disabled={uploadingAvatar}
                  />
                </div>
                <div className="pb-1 flex-1 min-w-0">
                  <div className="font-display text-lg font-bold uppercase tracking-[0.14em] text-foreground truncate">
                    {user.username}
                  </div>
                  <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                    {user.email}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <span
                  className={`clip-blade border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.2em] font-bold ${rankColor}`}
                >
                  {user.rank || "Unranked"}
                </span>
                <Badge variant={user.role === "admin" ? "accent" : "default"}>
                  {user.role || "user"}
                </Badge>
                <Badge variant="success">
                  online
                </Badge>
                <Badge variant="success">
                  VERIFIED
                </Badge>
              </div>
            </div>

            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
          </Panel>

          <div
            className="grid grid-cols-2 gap-3 animate-rise"
            style={{ animationDelay: "0.1s" }}
          >
            {[
              { label: "Squad Size", value: user.friends?.length ?? 0, accent: false },
              { label: "MMR Tier", value: user.rank ? user.rank.toUpperCase() : "—", accent: true },
            ].map(({ label, value, accent }) => (
              <StatCard key={label} label={label} value={value} accent={accent} />
            ))}
          </div>
        </div>

        <div
          className="flex flex-col gap-4 animate-rise"
          style={{ animationDelay: "0.15s" }}
        >
          <div className="clip-blade border border-border bg-surface/30 backdrop-blur-md p-1 flex gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-1 items-center justify-center gap-2 clip-blade px-4 py-2.5 font-mono text-[10px] uppercase tracking-widest transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-primary/15 text-primary ring-1 ring-primary/30 shadow-[0_0_12px_-4px_var(--color-primary)]"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
              >
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {activeTab === "overview" && (
            <Panel padding="p-6">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
              <div className="flex flex-col gap-5">
                <SectionLabel>Account Information</SectionLabel>
                <div className="grid gap-3">
                  {[
                    { label: "Username", value: user.username },
                    { label: "Email", value: user.email },
                    { label: "Email Status", value: "VERIFIED" },
                    { label: "Role", value: user.role || "user" },
                    { label: "Status", value: "online" },
                    { label: "Rank", value: user.rank || "Unranked" },
                    { label: "User ID", value: user._id?.slice(-8)?.toUpperCase() ?? "—" },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      className="flex items-center justify-between clip-blade border border-border bg-background/30 px-4 py-3 group hover:border-primary/20 hover:bg-primary/5 transition-all"
                    >
                      <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        {label}
                      </span>
                      <span className="font-mono text-xs text-foreground truncate max-w-[60%] text-right">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Panel>
          )}

          {activeTab === "squad" && (
            <Panel padding="p-6">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
              <div className="flex flex-col gap-5">
                <SectionLabel>Squad Roster · {user.friends?.length ?? 0} members</SectionLabel>

                <div className="flex gap-2">
                  <input
                    value={friendId}
                    onChange={(e) => setFriendId(e.target.value)}
                    placeholder="Enter friend user ID…"
                    className="flex-1 clip-blade border border-border bg-background/40 px-4 py-3 text-sm text-foreground outline-none backdrop-blur placeholder:text-muted-foreground/40 focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all"
                  />
                  <ActionButton
                    variant="ghost"
                    onClick={() => run(() => api.addFriend(friendId), "Squad member added")}
                    disabled={!friendId}
                  >
                    Add
                  </ActionButton>
                </div>

                {notice && <SuccessNotice>{notice}</SuccessNotice>}
                <Alert>{error}</Alert>

                {user.friends && user.friends.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {user.friends.map((fid: string) => (
                      <div
                        key={fid}
                        className="flex items-center gap-3 clip-blade border border-border bg-background/30 px-4 py-3"
                      >
                        <span className="flex h-8 w-8 items-center justify-center clip-blade bg-primary/10 font-display text-xs text-primary">
                          OP
                        </span>
                        <span className="font-mono text-[10px] uppercase tracking-widest text-foreground">
                          {fid}
                        </span>
                        <Badge variant="success">Online</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 py-10 text-center">
                    <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                      Your squad is empty. Add operatives by ID.
                    </p>
                  </div>
                )}
              </div>
            </Panel>
          )}

          {activeTab === "security" && (
            <Panel padding="p-6">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
              <div className="flex flex-col gap-5">
                <SectionLabel>Change Password</SectionLabel>

                <div className="clip-blade border border-amber-400/15 bg-amber-400/5 px-4 py-3">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-amber-400/80">
                    Use a strong passphrase. Your account protects your competitive history.
                  </p>
                </div>

                <form
                  className="flex flex-col gap-5"
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
                  <ActionButton type="submit">Update Password</ActionButton>
                </form>

                {notice && <SuccessNotice>{notice}</SuccessNotice>}
                <Alert>{error}</Alert>
              </div>
            </Panel>
          )}
        </div>
      </div>
    </ArenaShell>
  );
}
