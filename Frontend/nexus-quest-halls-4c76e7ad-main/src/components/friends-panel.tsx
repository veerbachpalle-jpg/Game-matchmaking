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
  } = useGroups();

  const [friends, setFriends] = useState<FriendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

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
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
          Squad · {onlineCount}/{friends.length} online
        </span>
        {connected && (
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-green-400">
              Live
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

      {/* ── Active Group ────────────────────────────────────────── */}
      {group && (
        <div className="border border-primary/30 bg-primary/5 p-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-primary">
              Your Group · {group.members.length} members
            </span>
            <button
              onClick={leaveGroup}
              className="font-mono text-[9px] uppercase tracking-[0.16em] text-destructive hover:text-destructive/80 transition-colors"
            >
              Leave
            </button>
          </div>
          <ul className="mt-3 flex flex-col gap-1.5">
            {group.members.map((m) => (
              <li
                key={m.userId}
                className="flex items-center gap-2 font-display text-xs tracking-wide text-foreground"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                {m.username}
                {m.userId === group.leaderId && (
                  <span className="font-mono text-[8px] uppercase tracking-[0.16em] text-primary/70">
                    Leader
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
        <ul className="flex flex-col gap-1">
          {sorted.map((f) => {
            const cfg = STATUS_CFG[f.status] ?? STATUS_CFG.offline;
            const isInGroup = group?.members.some((m) => m.userId === f._id);
            const canInvite = f.status === "online" && !isInGroup;

            return (
              <li
                key={f._id}
                className="group/friend flex items-center gap-3 px-3 py-2.5 border border-transparent hover:border-border/40 hover:bg-surface/20 transition-colors"
              >
                {/* Avatar */}
                {f.avatar ? (
                  <img
                    src={f.avatar}
                    alt={f.username}
                    className={`h-8 w-8 object-cover border flex-shrink-0 ${
                      f.status === "offline"
                        ? "border-border/40 opacity-50 grayscale"
                        : "border-primary/30"
                    }`}
                    loading="lazy"
                  />
                ) : (
                  <span
                    className={`grid h-8 w-8 place-items-center text-xs font-display border flex-shrink-0 ${
                      f.status === "offline"
                        ? "border-border/40 bg-neutral-800/50 text-muted-foreground"
                        : "border-primary/30 bg-primary/15 text-primary"
                    }`}
                  >
                    {f.username.slice(0, 2).toUpperCase()}
                  </span>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-display text-xs font-semibold tracking-wide truncate ${
                        f.status === "offline" ? "text-muted-foreground" : "text-foreground"
                      }`}
                    >
                      {f.username}
                    </span>
                    {isInGroup && (
                      <span className="font-mono text-[8px] uppercase tracking-[0.16em] text-primary/70">
                        In Group
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
                    <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
                      {cfg.label}
                    </span>
                    <span className="font-mono text-[9px] tracking-[0.1em] text-muted-foreground/60">
                      {f.mmr} MMR
                    </span>
                  </div>
                </div>

                {/* Actions (appear on hover) */}
                <div className="flex items-center gap-1.5 opacity-0 group-hover/friend:opacity-100 transition-opacity">
                  {canInvite && (
                    <button
                      onClick={() => handleInvite(f._id)}
                      className="border border-primary/40 px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.14em] text-primary hover:bg-primary/10 transition-colors"
                    >
                      Invite
                    </button>
                  )}
                  <button
                    onClick={() => handleRemoveFriend(f._id)}
                    disabled={removingId === f._id}
                    className="border border-destructive/30 px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.14em] text-destructive/70 hover:bg-destructive/10 transition-colors disabled:opacity-40"
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
    <div className="flex items-center gap-3 border border-amber-500/30 bg-amber-500/5 px-3 py-2.5">
      <div className="flex-1 min-w-0">
        <span className="font-display text-xs font-semibold tracking-wide text-foreground">
          {invite.fromUsername}
        </span>
        <span className="ml-1.5 font-mono text-[9px] text-muted-foreground">
          invited you to a group
        </span>
        <div className="mt-1 font-mono text-[8px] text-muted-foreground/70 truncate">
          {invite.members.map((m) => m.username).join(", ")}
        </div>
      </div>
      <div className="flex gap-1.5">
        <button
          onClick={onAccept}
          className="border border-green-500/40 px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.14em] text-green-400 hover:bg-green-500/10 transition-colors"
        >
          Accept
        </button>
        <button
          onClick={onDecline}
          className="border border-destructive/30 px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.14em] text-destructive/60 hover:bg-destructive/10 transition-colors"
        >
          Deny
        </button>
      </div>
    </div>
  );
}
