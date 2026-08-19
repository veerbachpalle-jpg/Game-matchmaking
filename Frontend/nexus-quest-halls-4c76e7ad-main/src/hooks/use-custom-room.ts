import { useState, useCallback } from "react";
import { useSocket, useSocketEvent } from "./use-socket";

export type CustomRoomPlayer = {
  userId: string;
  username: string;
  team: "A" | "B";
};

export type CustomRoomState = {
  roomId: string;
  hostId: string;
  players: CustomRoomPlayer[];
} | null;

export function useCustomRoom() {
  const { emit } = useSocket();
  const [room, setRoom] = useState<CustomRoomState>(null);

  useSocketEvent("custom-room-created", (payload: NonNullable<CustomRoomState>) => {
    setRoom(payload);
  });

  useSocketEvent("custom-room-updated", (payload: NonNullable<CustomRoomState>) => {
    setRoom(payload);
  });

  useSocketEvent("custom-room-left", () => {
    setRoom(null);
  });

  const createRoom = useCallback(() => {
    emit("create-custom-room");
  }, [emit]);

  const joinRoom = useCallback((roomId: string) => {
    emit("join-custom-room", { roomId });
  }, [emit]);

  const leaveRoom = useCallback(() => {
    emit("leave-custom-room");
  }, [emit]);

  const swapTeam = useCallback(() => {
    emit("swap-custom-team");
  }, [emit]);

  const inviteToRoom = useCallback((targetUserId: string) => {
    emit("invite-to-custom-room", { targetUserId });
  }, [emit]);

  const startCustomMatch = useCallback((region: string) => {
    emit("start-custom-match", { region });
  }, [emit]);

  return {
    room,
    createRoom,
    joinRoom,
    leaveRoom,
    swapTeam,
    inviteToRoom,
    startCustomMatch
  };
}
