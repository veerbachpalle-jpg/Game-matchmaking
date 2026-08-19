import { useCallback, useEffect, useState } from "react";
import { useSocket, useSocketEvent } from "@/hooks/use-socket";

export type QueueState = "idle" | "searching" | "matched" | "error";

export type GameMode = "1v1" | "4v4";

export type MatchFound = {
  matchId: string;
  gameMode: GameMode;
  region: string;
  avgMmr?: number;
  players: { userId: string; username: string; mmr: number; ping?: number }[];
  teamA?: { userId: string; username: string; mmr: number; ping?: number }[];
  teamB?: { userId: string; username: string; mmr: number; ping?: number }[];
  teamAAvgMmr?: number;
  teamBAvgMmr?: number;
  gameState?: unknown | null;
};

export type QueueStatus = {
  playersInQueue: number;
  waitSeconds: number;
  botFillIn: number;
  gamemode: GameMode;
  region: string;
};

export type QueueOptions = {
  gamemode: GameMode;
  region: string;
  ping: number;
};

/**
 * Drives the backend matchmaking queue over the shared Socket.IO gateway.
 * Mirrors the server contract: join-queue / leave-queue -> queue-joined,
 * queue-status (every 2s), match-found (1v1) and four-player-match.
 */
export function useMatchmaking() {
  const { connected, ping, error, emit } = useSocket();
  const [state, setState] = useState<QueueState>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<QueueStatus | null>(null);
  const [match, setMatch] = useState<MatchFound | null>(null);
  const [elapsed, setElapsed] = useState(0);

  useSocketEvent("queue-joined", () => {
    setState("searching");
    setMessage(null);
  });
  useSocketEvent("queue-left", () => {
    setState("idle");
    setStatus(null);
  });
  useSocketEvent("queue-status", (payload: QueueStatus) => setStatus(payload));
  useSocketEvent("match-found", (payload: MatchFound) => {
    setMatch(payload);
    setState("matched");
  });
  useSocketEvent("error", (payload: { message?: string } | string) => {
    setState("error");
    setMessage(typeof payload === "string" ? payload : (payload?.message ?? "Matchmaking error"));
  });

  useEffect(() => {
    if (state !== "searching") {
      setElapsed(0);
      return;
    }
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [state]);

  const joinQueue = useCallback(
    (opts: Omit<QueueOptions, "ping"> & { ping?: number }) => {
      setMatch(null);
      setMessage(null);
      setStatus(null);
      setState("searching");
      emit("join-queue", { ...opts, ping: opts.ping ?? ping ?? 40 });
    },
    [emit, ping],
  );

  const leaveQueue = useCallback(() => {
    setState("idle");
    setStatus(null);
    emit("leave-queue");
  }, [emit]);

  return {
    connected,
    ping,
    state,
    message: message ?? error,
    status,
    match,
    elapsed,
    joinQueue,
    leaveQueue,
  };
}
