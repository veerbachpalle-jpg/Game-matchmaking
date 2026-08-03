import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { API_BASE_URL, getToken } from "@/lib/api";


export type QueueState = "idle" | "searching" | "matched" | "error";

export type MatchFound = {
  matchId: string;
  gameMode: string;
  region: string;
  avgMmr?: number;
  players: { userId: string; username: string; mmr: number; ping: number }[];
};

export type QueueStatus = {
  playersInQueue: number;
  waitSeconds: number;
  botFillIn: number;
  gamemode: string;
  region: string;
};

export type QueueOptions = {
  gamemode: "1v1" | "four-player";
  region: string;
  ping: number;
};

// Connects to the Express Socket.IO gateway and drives the matchmaking queue.
export function useMatchmaking(enabled: boolean) {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [state, setState] = useState<QueueState>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [match, setMatch] = useState<MatchFound | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [ping, setPing] = useState<number | null>(null);
  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const socket = io(API_BASE_URL, {
      withCredentials: true,
      auth: { token: getToken() ?? undefined },
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      setMessage(null);
    });
    socket.on("disconnect", () => {
      setConnected(false);
      setPing(null);
      setQueueStatus(null);
    });
    socket.on("connect_error", (err) => {
      setConnected(false);
      setPing(null);
      setMessage(err.message || "Cannot reach the matchmaking server");
    });
    socket.on("queue-joined", () => setState("searching"));
    socket.on("queue left", () => { setState("idle"); setQueueStatus(null); });
    socket.on("queue-status", (status: QueueStatus) => {
      setQueueStatus(status);
    });
    socket.on("four-player-match", (payload: MatchFound) => {
      setMatch(payload);
      setState("matched");
      setQueueStatus(null);
    });
    socket.on("match-found", (payload: MatchFound) => {
      setMatch(payload);
      setState("matched");
      setQueueStatus(null);
    });
    socket.on("error", (payload: { message?: string }) => {
      setState("error");
      setMessage(payload?.message ?? "Matchmaking error");
    });

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [enabled]);

  useEffect(() => {
    if (!connected || !socketRef.current) return;

    const measurePing = () => {
      const start = Date.now();
      socketRef.current?.emit("ping-check", start, (sentTime: number) => {
        const latency = Math.max(1, Math.round(Date.now() - sentTime));
        setPing(latency);
      });
    };

    measurePing();
    const interval = setInterval(measurePing, 3000);
    return () => clearInterval(interval);
  }, [connected]);

  useEffect(() => {
    if (state !== "searching") {
      setElapsed(0);
      return;
    }
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [state]);

  const joinQueue = (opts: QueueOptions) => {
    setMatch(null);
    setMessage(null);
    setQueueStatus(null);
    setState("searching");
    socketRef.current?.emit("join-queue", opts);
  };

  const leaveQueue = () => {
    setState("idle");
    setQueueStatus(null);
    socketRef.current?.emit("leave-queue", {});
  };

  const joinGameRoom = (roomId: string) => {
    socketRef.current?.emit("join-game-room", { roomId });
  };

  return { connected, state, message, match, elapsed, ping, queueStatus, joinQueue, leaveQueue, joinGameRoom };
}

