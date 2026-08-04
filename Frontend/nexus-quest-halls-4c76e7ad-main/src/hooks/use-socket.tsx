import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { io, type Socket } from "socket.io-client";
import { API_BASE_URL, getToken } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";

type SocketState = {
  socket: Socket | null;
  connected: boolean;
  /** Round-trip latency in ms, measured with the backend `ping-check` event. */
  ping: number;
  error: string | null;
  emit: (event: string, payload?: unknown) => void;
  /** Subscribe to a server event for the lifetime of the caller. */
  on: (event: string, handler: (...args: any[]) => void) => () => void;
};

const SocketContext = createContext<SocketState | null>(null);

export function SocketProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [ping, setPing] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || typeof window === "undefined") {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setSocket(null);
      setConnected(false);
      return;
    }

    const s = io(API_BASE_URL, {
      withCredentials: true,
      auth: { token: getToken() ?? undefined },
      transports: ["websocket", "polling"],
    });
    socketRef.current = s;
    setSocket(s);

    s.on("connect", () => {
      setConnected(true);
      setError(null);
    });
    s.on("disconnect", () => setConnected(false));
    s.on("connect_error", (err: Error) => {
      setConnected(false);
      setError(err.message || `Cannot reach the arena gateway at ${API_BASE_URL}`);
    });
    s.on("pong-check", (sent: number) => {
      if (typeof sent === "number") setPing(Math.max(1, Date.now() - sent));
    });

    const measure = () => {
      if (!s.connected) return;
      const sent = Date.now();
      s.emit("ping-check", sent, (echo?: number) => {
        if (typeof echo === "number") setPing(Math.max(1, Date.now() - echo));
      });
    };
    measure();
    const t = setInterval(measure, 5000);

    return () => {
      clearInterval(t);
      s.removeAllListeners();
      s.disconnect();
      socketRef.current = null;
      setSocket(null);
      setConnected(false);
    };
  }, [user?._id]);

  const emit = useCallback((event: string, payload?: unknown) => {
    socketRef.current?.emit(event, payload);
  }, []);

  const on = useCallback((event: string, handler: (...args: any[]) => void) => {
    const s = socketRef.current;
    if (!s) return () => {};
    s.on(event, handler);
    return () => {
      s.off(event, handler);
    };
  }, []);

  const value = useMemo(
    () => ({ socket, connected, ping, error, emit, on }),
    [socket, connected, ping, error, emit, on],
  );

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be used inside <SocketProvider>");
  return ctx;
}

/** Subscribe to a socket event with automatic cleanup. */
export function useSocketEvent(
  event: string,
  handler: (...args: any[]) => void,
  deps: unknown[] = [],
) {
  const { socket, on } = useSocket();
  const ref = useRef(handler);
  ref.current = handler;

  useEffect(() => {
    if (!socket) return;
    return on(event, (...args: any[]) => ref.current(...args));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, event, on, ...deps]);
}
