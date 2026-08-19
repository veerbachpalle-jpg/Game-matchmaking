import { useCallback, useEffect, useState } from "react";
import { api, type FriendData } from "@/lib/api";
import { useSocket, useSocketEvent } from "@/hooks/use-socket";
import { useGroups, type GroupInvite } from "@/hooks/use-groups";
import { useAuth } from "@/hooks/use-auth";
import { ActionButton, Panel } from "@/components/arena-shell";

type StatusKey = FriendData["status"];

const STATUS_CFG: Record<StatusKey, { dot: string; label: string; order: number }> = {
  online: { dot: "bg-green-500", label: "Online", order: 0 },
  Inqueue: { dot: "bg-amber-500 animate-pulse", label: "In Queue", order: 1 },
  "in-game": { dot: "bg-cyan-500 animate-pulse", label: "In Game", order: 2 },
  offline: { dot: "bg-neutral-600", label: "Offline", order: 3 },
};

/**
 * Full-featured friends panel for the Play page:
 * - Friends list with real-time status (online/offline/in-queue/in-game)
 * - Invite to group
 * - Remove friend
 * - Active group display
 * - Pending group invite notifications
 */
export function FriendsPanel() {
  const { user } = useAuth();
  const { connected } = useSocket();
  const {
    group,
    pendingInvites,
    createGroup,
    inviteToGroup,
    acceptInvite,
    declineInvite,
    leaveGroup,
    joinByCode,
  } = useGroups();

  const [friends, setFriends] = useState<FriendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [joinCodeInput, setJoinCodeInput] = useState("");

  // ── Load friends from REST API ──────────────────────────────────
  const loadFriends = useCallback(async () => {
    try {
      const data = await api.getFriends();
      setFriends(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) loadFriends();
  }, [user, loadFriends]);

  // ── Real-time status updates via socket ─────────────────────────
  useSocketEvent(
    "friend-status-change",
    (payload: { userId: string; username: string; status: StatusKey }) => {
      setFriends((prev) =>
        prev.map((f) =>
          f._id === payload.userId ? { ...f, status: payload.status } : f,
        ),
      );
    },
  );

  // ── Actions ─────────────────────────────────────────────────────
  async function handleRemoveFriend(friendId: string) {
    setRemovingId(friendId);
    try {
      await api.removeFriend(friendId);
      setFriends((prev) => prev.filter((f) => f._id !== friendId));
    } catch {
      /* silent */
    } finally {
      setRemovingId(null);
    }
  }

  function handleInvite(friendId: string) {
    inviteToGroup(friendId);
  }

  function handleJoinCodeSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (joinCodeInput.trim().length === 6) {
      joinByCode(joinCodeInput.trim());
      setJoinCodeInput("");
    }
  }

  // ── Sort: online/inqueue/ingame first, offline last ─────────────
  const sorted = [...friends].sort((a, b) => {
    const ao = STATUS_CFG[a.status]?.order ?? 3;
    const bo = STATUS_CFG[b.status]?.order ?? 3;
    return ao - bo;
  });

  const onlineCount = friends.filter((f) => f.status !== "offline").length;

  return (
    <Panel className="flex flex-col gap-5">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
          Friends List <span className="text-primary/70">· {onlineCount}/{friends.length} online</span>
        </span>
        {connected && (
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
            <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-green-400">
              Live Network
            </span>
          </span>
        )}
      </div>

      {/* ── Pending Invites ─────────────────────────────────────── */}
      {pendingInvites.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-amber-400">
            Group Invites
          </span>
          {pendingInvites.map((inv) => (
            <InviteCard
              key={inv.groupId}
              invite={inv}
              onAccept={() => acceptInvite(inv.groupId)}
              onDecline={() => declineInvite(inv.groupId)}
            />
          ))}
        </div>
      )}

      {/* ── Group Actions ────────────────────────────────────────── */}
      {!group && (
        <div className="flex flex-col gap-3 rounded-xl border border-white/5 bg-surface/20 p-3 backdrop-blur-sm">
          <form onSubmit={handleJoinCodeSubmit} className="flex items-center gap-2">
            <input
              type="text"
              value={joinCodeInput}
              onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
              placeholder="Enter Team Code..."
              maxLength={6}
              className="flex-1 rounded-md border border-white/10 bg-black/20 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-foreground outline-none transition-colors focus:border-primary/50"
            />
            <button
              type="submit"
              disabled={joinCodeInput.trim().length !== 6}
              className="rounded-md border border-primary/40 bg-primary/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-primary transition-all hover:bg-primary/20 disabled:opacity-30"
            >
              Join
            </button>
          </form>
          
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-white/5" />
            <span className="font-mono text-[8px] uppercase tracking-widest text-muted-foreground/50">OR</span>
            <div className="h-px flex-1 bg-white/5" />
          </div>

          <button
            onClick={createGroup}
            className="w-full rounded-md border border-accent/40 bg-accent/10 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-accent transition-all hover:bg-accent/20 hover:shadow-[0_0_12px_rgba(var(--color-accent),0.15)]"
          >
            Create Teamcode
          </button>
        </div>
      )}

      {/* ── Active Group ────────────────────────────────────────── */}
      {group && (
        <div className="relative overflow-hidden rounded-xl border border-primary/40 bg-gradient-to-b from-primary/10 to-transparent p-4 shadow-[0_4px_20px_-5px_rgba(255,215,0,0.15)] backdrop-blur-md">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent opacity-50" />
          <div className="relative flex items-center justify-between">
            <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-primary drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]">
              Active Party · {group.members.length}/4
            </span>
            <div className="flex items-center gap-3">
              <span className="font-mono text-[9px] tracking-widest text-primary/70 bg-primary/5 px-2 py-0.5 rounded border border-primary/20" title="Team Code">
                Code: {group.teamCode}
              </span>
              <button
                onClick={leaveGroup}
                className="font-mono text-[9px] uppercase tracking-[0.16em] text-destructive/80 hover:text-destructive hover:drop-shadow-[0_0_5px_rgba(255,0,0,0.5)] transition-all"
              >
                Leave
              </button>
            </div>
          </div>
          <ul className="relative mt-3 flex flex-col gap-2">
            {group.members.map((m) => (
              <li
                key={m.userId}
                className="flex items-center gap-2.5 font-display text-xs tracking-wide text-foreground bg-black/20 rounded-lg px-3 py-2 border border-white/5"
              >
                <span className={`h-1.5 w-1.5 rounded-full ${m.userId === group.leaderId || m.ready ? 'bg-primary shadow-[0_0_8px_rgba(255,215,0,0.8)]' : 'bg-neutral-600'}`} />
                {m.username}
                {m.userId === group.leaderId ? (
                  <span className="ml-auto font-mono text-[8px] uppercase tracking-[0.16em] text-primary/80 bg-primary/10 px-2 py-0.5 rounded-full">
                    Leader
                  </span>
                ) : (
                  <span className={`ml-auto font-mono text-[8px] uppercase tracking-[0.16em] px-2 py-0.5 rounded-full ${m.ready ? 'text-primary/80 bg-primary/10' : 'text-muted-foreground bg-white/5'}`}>
                    {m.ready ? 'Ready' : 'Not Ready'}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Friends List ────────────────────────────────────────── */}
      {loading ? (
        <div className="flex justify-center py-6">
          <span className="inline-block h-5 w-5 border-2 border-primary/40 border-t-primary rounded-full animate-spin" />
        </div>
      ) : friends.length === 0 ? (
        <p className="text-center font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground py-4">
          No friends yet — add players from your Profile page
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {sorted.map((f) => {
            const cfg = STATUS_CFG[f.status] ?? STATUS_CFG.offline;
            const isInGroup = group?.members.some((m) => m.userId === f._id);
            const canInvite = f.status === "online" && !isInGroup;

            return (
              <li
                key={f._id}
                className="group/friend flex items-center gap-4 rounded-xl bg-surface/30 px-3 py-3 border border-white/5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-surface/60 hover:border-primary/30 hover:shadow-lg"
              >
                {/* Avatar */}
                {f.avatar ? (
                  <img
                    src={f.avatar}
                    alt={f.username}
                    className={`h-10 w-10 rounded-lg object-cover ring-1 flex-shrink-0 transition-all ${
                      f.status === "offline"
                        ? "ring-white/10 opacity-50 grayscale"
                        : "ring-primary/40 shadow-[0_0_12px_rgba(255,215,0,0.15)]"
                    }`}
                    loading="lazy"
                  />
                ) : (
                  <span
                    className={`grid h-10 w-10 rounded-lg place-items-center text-sm font-display ring-1 flex-shrink-0 transition-all ${
                      f.status === "offline"
                        ? "ring-white/10 bg-neutral-800/50 text-muted-foreground"
                        : "ring-primary/40 bg-primary/10 text-primary shadow-[0_0_12px_rgba(255,215,0,0.15)]"
                    }`}
                  >
                    {f.username.slice(0, 2).toUpperCase()}
                  </span>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-display text-sm font-bold tracking-wide truncate ${
                        f.status === "offline" ? "text-muted-foreground" : "text-foreground"
                      }`}
                    >
                      {f.username}
                    </span>
                    {isInGroup && (
                      <span className="font-mono text-[8px] uppercase tracking-[0.16em] text-primary bg-primary/10 px-1.5 py-0.5 rounded-sm">
                        In Party
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`h-2 w-2 rounded-full flex-shrink-0 ${cfg.dot} ${f.status === 'online' ? 'shadow-[0_0_8px_rgba(34,197,94,0.6)]' : ''}`} />
                    <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
                      {cfg.label}
                    </span>
                    <span className="font-mono text-[9px] tracking-[0.1em] text-muted-foreground/50">
                      | {f.mmr} MMR
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 opacity-0 group-hover/friend:opacity-100 transition-opacity duration-200">
                  {canInvite && (
                    <button
                      onClick={() => handleInvite(f._id)}
                      className="rounded-md border border-primary/40 bg-primary/5 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-primary shadow-sm hover:bg-primary/20 hover:shadow-[0_0_10px_rgba(255,215,0,0.2)] transition-all"
                    >
                      Invite
                    </button>
                  )}
                  <button
                    onClick={() => handleRemoveFriend(f._id)}
                    disabled={removingId === f._id}
                    className="rounded-md border border-destructive/30 bg-destructive/5 px-2 py-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-destructive/70 hover:bg-destructive/20 transition-all disabled:opacity-40"
                    title="Remove friend"
                  >
                    {removingId === f._id ? "…" : "✕"}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}

/** Small card for an incoming group invite. */
function InviteCard({
  invite,
  onAccept,
  onDecline,
}: {
  invite: GroupInvite;
  onAccept: () => void;
  onDecline: () => void;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-500/10 to-transparent p-3 shadow-sm backdrop-blur-sm">
      <div className="flex-1 min-w-0">
        <span className="font-display text-sm font-bold tracking-wide text-foreground drop-shadow-md">
          {invite.fromUsername}
        </span>
        <span className="ml-2 font-mono text-[9px] text-muted-foreground">
          invited you to a party
        </span>
        <div className="mt-1 font-mono text-[8px] text-muted-foreground/60 truncate bg-black/20 rounded px-2 py-1 border border-white/5 inline-block">
          {invite.members.map((m) => m.username).join(", ")}
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <button
          onClick={onAccept}
          className="rounded border border-green-500/50 bg-green-500/10 px-3 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.15)] hover:bg-green-500/20 hover:shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all"
        >
          Accept
        </button>
        <button
          onClick={onDecline}
          className="rounded border border-destructive/40 bg-destructive/10 px-3 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-destructive/80 hover:bg-destructive/20 transition-all"
        >
          Deny
        </button>
      </div>
    </div>
  );
}
