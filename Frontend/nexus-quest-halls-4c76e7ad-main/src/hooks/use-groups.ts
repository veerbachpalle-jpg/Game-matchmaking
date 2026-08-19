import { useCallback, useState } from "react";
import { useSocket, useSocketEvent } from "@/hooks/use-socket";

export type GroupMember = {
  userId: string;
  username: string;
};

export type GroupState = {
  id: string;
  leaderId: string;
  members: GroupMember[];
  pending: string[];
  teamCode: string;
} | null;

export type GroupInvite = {
  groupId: string;
  fromUserId: string;
  fromUsername: string;
  members: GroupMember[];
};

/**
 * Manages group / party state over the shared Socket.IO gateway.
 *
 * Events handled:
 *   create-group -> group-created
 *   invite-to-group -> invite-sent / group-invite (on target)
 *   accept-group-invite -> group-updated
 *   decline-group-invite -> invite-declined
 *   leave-group -> group-left / group-updated
 *   group-queue -> queue-joined (per member)
 */
export function useGroups() {
  const { emit } = useSocket();
  const [group, setGroup] = useState<GroupState>(null);
  const [pendingInvites, setPendingInvites] = useState<GroupInvite[]>([]);

  // ── Incoming events ─────────────────────────────────────────────

  useSocketEvent("group-created", (payload: NonNullable<GroupState>) => {
    setGroup(payload);
  });

  useSocketEvent("group-updated", (payload: NonNullable<GroupState>) => {
    setGroup(payload);
  });

  useSocketEvent("group-left", () => {
    setGroup(null);
  });

  useSocketEvent("group-invite", (invite: GroupInvite) => {
    setPendingInvites((prev) => {
      // Avoid duplicates
      if (prev.some((i) => i.groupId === invite.groupId)) return prev;
      return [...prev, invite];
    });
  });

  useSocketEvent("invite-declined", (payload: { userId: string; username: string }) => {
    // Could show a toast — for now just log
    console.log(`${payload.username} declined your invite`);
  });

  // ── Actions ─────────────────────────────────────────────────────

  const createGroup = useCallback(() => {
    emit("create-group");
  }, [emit]);

  const inviteToGroup = useCallback(
    (targetUserId: string) => {
      emit("invite-to-group", { targetUserId });
    },
    [emit],
  );

  const acceptInvite = useCallback(
    (groupId: string) => {
      emit("accept-group-invite", { groupId });
      setPendingInvites((prev) => prev.filter((i) => i.groupId !== groupId));
    },
    [emit],
  );

  const declineInvite = useCallback(
    (groupId: string) => {
      emit("decline-group-invite", { groupId });
      setPendingInvites((prev) => prev.filter((i) => i.groupId !== groupId));
    },
    [emit],
  );

  const leaveGroup = useCallback(() => {
    emit("leave-group");
    setGroup(null);
  }, [emit]);

  const joinByCode = useCallback(
    (teamCode: string) => {
      emit("join-group-by-code", { teamCode });
    },
    [emit],
  );

  const queueGroup = useCallback(
    (opts: { region: string; gamemode: string; ping?: number }) => {
      emit("group-queue", opts);
    },
    [emit],
  );

  return {
    group,
    pendingInvites,
    createGroup,
    inviteToGroup,
    acceptInvite,
    declineInvite,
    leaveGroup,
    joinByCode,
    queueGroup,
  };
}
