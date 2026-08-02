import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, useRef } from "react";
import { ArenaShell, ActionButton, Alert, Panel, SectionLabel, Badge } from "@/components/arena-shell";
import { StatusChip } from "@/routes/matches";
import { api, API_BASE_URL, getToken, type GameState } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { io, type Socket } from "socket.io-client";

export const Route = createFileRoute("/match/$matchId")({
  component: MatchRoom,
  head: () => ({
    meta: [
      { title: "Match Room — Matchforge Arena" },
      {
        name: "description",
        content: "Live match room with the full lobby roster, MMR snapshots and the final scoreboard.",
      },
      { property: "og:title", content: "Match Room — Matchforge Arena" },
      {
        property: "og:description",
        content: "Live lobby roster, MMR snapshots and the final scoreboard.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

// ─── Types ────────────────────────────────────────────────────────────────────
type LobbyState = {
  readyPlayers: string[];
  readyCount: number;
  totalNeeded: number;
  allReady: boolean;
};

// ─── XoxBoard ────────────────────────────────────────────────────────────────
function XoxBoard({
  matchId,
  currentUserId,
  initialGameState,
  socket,
}: {
  matchId: string;
  currentUserId: string;
  initialGameState?: GameState | null;
  socket: Socket;
}) {
  const [gameState, setGameState] = useState<GameState | null>(initialGameState ?? null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastMove, setLastMove] = useState<number | null>(null);

  useEffect(() => {
    if (initialGameState) setGameState(initialGameState);
  }, [initialGameState]);

  useEffect(() => {
    const onGameUpdated = (payload: { matchId: string; gameState: GameState }) => {
      if (payload.matchId === matchId) {
        setGameState(payload.gameState);
        setErrorMsg(null);
      }
    };
    const onMoveError = (err: { message: string }) => setErrorMsg(err.message);

    socket.on("game-updated", onGameUpdated);
    socket.on("move-error", onMoveError);

    return () => {
      socket.off("game-updated", onGameUpdated);
      socket.off("move-error", onMoveError);
    };
  }, [matchId, socket]);

  if (!gameState) {
    return (
      <div className="mt-6 flex items-center justify-center h-40">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin clip-blade border border-primary/40 border-t-primary" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground animate-pulse">
            Loading game…
          </span>
        </div>
      </div>
    );
  }

  const mySymbol = gameState.players.X === currentUserId ? "X" : "O";
  const isMyTurn =
    gameState.status === "ongoing" &&
    String(gameState.currentTurn) === String(currentUserId);

  function makeMove(position: number) {
    if (!isMyTurn || gameState?.board[position] !== null) return;
    setErrorMsg(null);
    setLastMove(position);
    socket.emit("make-move", { matchId, position });
  }

  const statusLabel =
    gameState.status === "completed"
      ? String(gameState.winner) === String(currentUserId)
        ? "🏆 You Won!"
        : "💀 You Lost"
      : gameState.status === "draw"
      ? "🤝 Draw"
      : isMyTurn
      ? "⚡ Your Turn"
      : "⏳ Opponent's Turn";

  const statusColor =
    gameState.status === "completed"
      ? String(gameState.winner) === String(currentUserId)
        ? "text-accent"
        : "text-destructive"
      : gameState.status === "draw"
      ? "text-muted-foreground"
      : isMyTurn
      ? "text-primary animate-pulse"
      : "text-muted-foreground";

  return (
    <div className="mt-6 clip-blade relative overflow-hidden border border-border bg-background/50 backdrop-blur-sm">
      {/* Top accent */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="p-6 flex flex-col items-center gap-5">
        {/* Header */}
        <div className="w-full flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <span className="font-display text-sm font-bold uppercase tracking-[0.18em] text-foreground">
              XOX Arena
            </span>
            <span className="clip-blade border border-border px-2 py-0.5 font-mono text-[8px] uppercase tracking-widest text-muted-foreground">
              Live
            </span>
          </div>
          <span className={`font-mono text-[11px] uppercase tracking-[0.2em] font-bold ${statusColor}`}>
            {statusLabel}
          </span>
        </div>

        {/* Symbol badges */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div
            className={`clip-blade px-4 py-2 font-bold flex items-center gap-2 border transition-all ${
              mySymbol === "X"
                ? "bg-primary/15 text-primary border-primary/40 shadow-[0_0_12px_-4px_var(--color-primary)]"
                : "bg-muted/10 text-muted-foreground border-border"
            }`}
          >
            <span className="text-base">✕</span>
            <span>{gameState.players.X === currentUserId ? "YOU" : "OPPONENT"}</span>
          </div>
          <span className="text-muted-foreground/40 font-bold">VS</span>
          <div
            className={`clip-blade px-4 py-2 font-bold flex items-center gap-2 border transition-all ${
              mySymbol === "O"
                ? "bg-accent/15 text-accent border-accent/40 shadow-[0_0_12px_-4px_var(--color-ember)]"
                : "bg-muted/10 text-muted-foreground border-border"
            }`}
          >
            <span className="text-base">○</span>
            <span>{gameState.players.O === currentUserId ? "YOU" : "OPPONENT"}</span>
          </div>
        </div>

        {/* 3×3 Board */}
        <div className="grid grid-cols-3 gap-2.5 w-60 h-60">
          {gameState.board.map((cell, idx) => {
            const isEmpty = cell === null;
            const clickable = isMyTurn && isEmpty && gameState.status === "ongoing";
            const isNew = lastMove === idx;
            return (
              <button
                key={idx}
                type="button"
                disabled={!clickable}
                onClick={() => makeMove(idx)}
                aria-label={cell ? `${cell} at cell ${idx}` : `Empty cell ${idx}`}
                className={`flex items-center justify-center clip-blade border text-3xl font-bold font-display transition-all duration-150 ${
                  cell === "X"
                    ? `border-primary/60 bg-primary/15 text-primary ${isNew ? "scale-110" : ""}`
                    : cell === "O"
                    ? `border-accent/60 bg-accent/15 text-accent ${isNew ? "scale-110" : ""}`
                    : clickable
                    ? "border-border bg-surface/40 hover:border-primary/50 hover:bg-primary/8 cursor-pointer active:scale-95 hover:scale-105"
                    : "border-border/40 bg-surface/10 cursor-not-allowed opacity-30"
                }`}
              >
                {cell === "X" && (
                  <span className="drop-shadow-[0_0_8px_var(--color-primary)]">✕</span>
                )}
                {cell === "O" && (
                  <span className="drop-shadow-[0_0_8px_var(--color-ember)]">○</span>
                )}
              </button>
            );
          })}
        </div>

        {errorMsg && (
          <div className="w-full">
            <Alert>{errorMsg}</Alert>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── LobbyReadyScreen ─────────────────────────────────────────────────────────
function LobbyReadyScreen({
  matchId,
  currentUserId,
  players,
  lobbyState,
  onReady,
  isReady,
}: {
  matchId: string;
  currentUserId: string;
  players: { userId: string; username: string; mmr: number }[];
  lobbyState: LobbyState | null;
  onReady: () => void;
  isReady: boolean;
}) {
  useEffect(() => {
    console.log("[LobbyReadyScreen] Debug:", {
      currentUserId,
      players: players.map((p) => ({ userId: p.userId, username: p.username })),
      lobbyState,
      isReady,
    });
  }, [currentUserId, players, lobbyState, isReady]);

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      {/* Header */}
      <div className="text-center w-full">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-primary/30" />
          <h2 className="font-display text-lg font-bold uppercase tracking-widest text-foreground">
            Pre-match Lobby
          </h2>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-primary/30" />
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          All operatives must confirm ready before the match begins
        </p>
      </div>

      {/* Player ready status */}
      <div className="w-full flex flex-col gap-2">
        {players.map((p) => {
          const ready = lobbyState?.readyPlayers.includes(p.userId) ?? false;
          const isMe = p.userId === currentUserId;
          const isBot = p.username.startsWith("bot_");
          return (
            <div
              key={p.userId}
              className={`flex items-center justify-between clip-blade border px-4 py-3 transition-all ${
                ready
                  ? "border-primary/40 bg-primary/8 shadow-[0_0_12px_-6px_var(--color-primary)]"
                  : "border-border bg-background/30"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-8 w-8 items-center justify-center clip-blade font-display text-xs font-bold transition-all ${
                    ready
                      ? "bg-primary/20 text-primary ring-1 ring-primary/40"
                      : "bg-white/5 text-muted-foreground"
                  }`}
                >
                  {isMe ? "YOU" : p.username.slice(0, 2).toUpperCase()}
                </span>
                <div>
                  <span className="font-display text-sm font-bold uppercase tracking-[0.12em] text-foreground">
                    {isMe ? "YOU" : p.username}
                    {isBot && (
                      <span className="ml-2 font-mono text-[9px] text-muted-foreground normal-case tracking-normal">
                        (bot)
                      </span>
                    )}
                  </span>
                  <div className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest">
                    {p.mmr} MMR
                  </div>
                </div>
              </div>
              <span
                className={`clip-blade border px-3 py-1 font-mono text-[10px] uppercase font-bold tracking-[0.18em] ${
                  ready
                    ? "border-primary/40 text-primary bg-primary/10"
                    : "border-border text-muted-foreground/60"
                }`}
              >
                {ready ? "✓ Ready" : "Not Ready"}
              </span>
            </div>
          );
        })}
      </div>

      {/* Readiness bar */}
      {lobbyState && (
        <div className="w-full">
          <div className="flex justify-between font-mono text-[9px] uppercase tracking-widest text-muted-foreground mb-2">
            <span>Readiness</span>
            <span className="text-primary font-bold">
              {lobbyState.readyCount} / {lobbyState.totalNeeded}
            </span>
          </div>
          <div className="w-full h-1.5 clip-blade bg-white/5 overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500 shadow-[0_0_8px_1px_var(--color-primary)]"
              style={{
                width: lobbyState.totalNeeded > 0
                  ? `${(lobbyState.readyCount / lobbyState.totalNeeded) * 100}%`
                  : "0%",
              }}
            />
          </div>
        </div>
      )}

      {/* Ready button */}
      {!isReady ? (
        <button
          type="button"
          onClick={onReady}
          className="w-full clip-blade relative overflow-hidden bg-primary px-6 py-4 font-display text-sm font-bold uppercase tracking-[0.22em] text-primary-foreground shadow-[0_0_24px_-8px_var(--color-primary)] transition-all hover:opacity-90 hover:shadow-[0_0_32px_-6px_var(--color-primary)] active:scale-[0.98]"
        >
          <span className="pointer-events-none absolute inset-0 -translate-x-full animate-sweep bg-gradient-to-r from-transparent via-white/15 to-transparent" />
          ⚡ I'm Ready
        </button>
      ) : (
        <div className="w-full clip-blade border border-primary/40 bg-primary/8 px-6 py-4 text-center font-mono text-xs uppercase tracking-widest text-primary animate-pulse shadow-[0_0_16px_-8px_var(--color-primary)]">
          {lobbyState?.allReady ? "🚀 Starting game…" : "⏳ Waiting for opponent…"}
        </div>
      )}
    </div>
  );
}

// ─── MatchResultOverlay ───────────────────────────────────────────────────────
function MatchResultOverlay({
  status,
  winnerId,
  currentUserId,
  mmrChanges,
}: {
  status: string;
  winnerId: string | null;
  currentUserId: string;
  mmrChanges?: Record<string, number> | null;
}) {
  const isWinner = status === "completed" && winnerId === currentUserId;
  const isLoser = status === "completed" && winnerId !== currentUserId;
  const isDraw = status === "draw";

  const mmrChange = mmrChanges?.[currentUserId] ?? 0;
  const mmrText = mmrChange >= 0 ? `+${mmrChange}` : `${mmrChange}`;

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/92 backdrop-blur-md clip-blade border border-primary/30">
      {/* Background glow */}
      <div
        className={`absolute inset-0 opacity-10 pointer-events-none ${
          isWinner
            ? "bg-accent/20"
            : isLoser
            ? "bg-destructive/20"
            : "bg-muted/10"
        }`}
      />

      <div className="relative flex flex-col items-center gap-5 max-w-xs px-6 text-center">
        {isWinner && (
          <>
            <div className="text-5xl animate-bounce drop-shadow-[0_0_20px_var(--color-ember)]">🏆</div>
            <div>
              <h2 className="font-display text-4xl font-extrabold uppercase tracking-widest text-accent drop-shadow-[0_0_20px_var(--color-ember)]">
                Victory
              </h2>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Objective Secured
              </p>
            </div>
          </>
        )}

        {isLoser && (
          <>
            <div className="text-5xl animate-pulse text-destructive">💀</div>
            <div>
              <h2 className="font-display text-4xl font-extrabold uppercase tracking-widest text-destructive">
                Defeat
              </h2>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Tactical Failure
              </p>
            </div>
          </>
        )}

        {isDraw && (
          <>
            <div className="text-5xl">🤝</div>
            <div>
              <h2 className="font-display text-4xl font-extrabold uppercase tracking-widest text-muted-foreground">
                Draw
              </h2>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Stalemate
              </p>
            </div>
          </>
        )}

        {/* MMR Card */}
        <div className="clip-blade border border-border bg-surface/60 backdrop-blur px-8 py-4 flex flex-col items-center gap-1.5 min-w-[180px]">
          <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
            MMR Rating Update
          </span>
          {mmrChanges && mmrChanges[currentUserId] !== undefined ? (
            <span
              className={`font-display text-3xl font-bold ${
                mmrChange > 0
                  ? "text-primary"
                  : mmrChange < 0
                  ? "text-destructive"
                  : "text-muted-foreground"
              }`}
            >
              {mmrText} <span className="text-sm">MMR</span>
            </span>
          ) : (
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-primary animate-pulse py-1">
              Calculating…
            </span>
          )}
        </div>

        <Link
          to="/play"
          className="w-full clip-blade relative overflow-hidden bg-primary text-primary-foreground font-display text-xs font-bold uppercase tracking-widest px-6 py-3.5 shadow-[0_0_20px_-6px_var(--color-primary)] hover:opacity-90 active:scale-[0.98] transition-all text-center"
        >
          <span className="pointer-events-none absolute inset-0 -translate-x-full animate-sweep bg-gradient-to-r from-transparent via-white/15 to-transparent" />
          ⚡ Return to Queue
        </Link>
      </div>
    </div>
  );
}

// ─── MatchRoom ────────────────────────────────────────────────────────────────
function MatchRoom() {
  const { matchId } = Route.useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [winnerId, setWinnerId] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [gameStarted, setGameStarted] = useState(false);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [lobbyState, setLobbyState] = useState<LobbyState | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["match", matchId],
    queryFn: () => api.match(matchId),
    enabled: Boolean(user),
  });

  useEffect(() => {
    if (data?.status === "ongoing" || data?.gameState) {
      setGameStarted(true);
      setGameState(data.gameState ?? null);
    }
  }, [data]);

  useEffect(() => {
    if (!user || typeof window === "undefined") return;

    const s = io(API_BASE_URL, {
      withCredentials: true,
      auth: { token: getToken() ?? undefined },
      transports: ["websocket", "polling"],
    });
    setSocket(s);

    const joinRoom = () => {
      console.log("[MatchRoom] Socket connected, joining room:", matchId);
      s.emit("join-game-room", { roomId: matchId });
    };

    if (s.connected) joinRoom();
    s.on("connect", joinRoom);

    s.on("lobby-state", (state: LobbyState) => {
      setLobbyState(state);
    });

    s.on("game-start", (payload: { matchId: string; gameState: GameState }) => {
      if (payload.matchId === matchId) {
        console.log("[MatchRoom] game-start received");
        setGameState(payload.gameState);
        setGameStarted(true);
      }
    });

    s.on("game-updated", (payload: { matchId: string; gameState: GameState }) => {
      if (payload.matchId === matchId) {
        setGameState(payload.gameState);
        setGameStarted(true);
        if (payload.gameState.status === "completed" || payload.gameState.status === "draw") {
          console.log("[MatchRoom] Game ended, invalidating match query");
          queryClient.invalidateQueries({ queryKey: ["match", matchId] });
        }
      }
    });

    s.on("connect_error", (err) => {
      console.error("[MatchRoom] connect_error:", err.message);
    });

    return () => {
      s.removeAllListeners();
      s.disconnect();
      setSocket(null);
    };
  }, [matchId, user]);

  function handleReady() {
    setIsReady(true);
    socket?.emit("player-ready", { matchId });
  }

  async function submit() {
    setBusy(true);
    setSubmitError(null);
    try {
      await api.submitResult(matchId, { winnerId });
      await queryClient.invalidateQueries({ queryKey: ["match", matchId] });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Could not submit result");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ArenaShell
      eyebrow="Match Room"
      title={`Engagement ${matchId.slice(-6).toUpperCase()}`}
    >
      {error && (
        <div className="mb-5">
          <Alert>{(error as Error).message}</Alert>
        </div>
      )}

      {isLoading && (
        <div className="flex flex-col gap-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="clip-blade border border-white/5 bg-surface/20 p-6 animate-pulse"
              style={{ opacity: 1 - i * 0.2 }}
            >
              <div className="h-4 w-40 rounded bg-white/5 mb-3" />
              <div className="h-3 w-60 rounded bg-white/5" />
            </div>
          ))}
        </div>
      )}

      {data && user && (
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          {/* ── Left panel ── */}
          <Panel
            padding="p-6"
            className="shadow-[0_8px_40px_-16px_rgba(0,0,0,0.7)] animate-rise"
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.02]"
              style={{
                backgroundImage: "repeating-linear-gradient(to bottom, transparent 0 3px, var(--color-primary) 3px 4px)",
              }}
            />

            <div>
              {/* Status + meta row */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <StatusChip status={data.status} />
                <div className="flex items-center gap-3">
                  <Badge variant="default">{data.gameMode}</Badge>
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    {new Date(data.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* 1v1 game mode */}
              {data.gameMode === "1v1" && (
                <>
                  {gameStarted && socket ? (
                    <div className="relative">
                      <XoxBoard
                        matchId={matchId}
                        currentUserId={user._id}
                        initialGameState={gameState}
                        socket={socket}
                      />
                      {(gameState?.status === "completed" || gameState?.status === "draw") && (
                        <MatchResultOverlay
                          status={gameState.status}
                          winnerId={gameState.winner ?? null}
                          currentUserId={user._id}
                          mmrChanges={data.result?.mmrChanges}
                        />
                      )}
                    </div>
                  ) : (
                    <LobbyReadyScreen
                      matchId={matchId}
                      currentUserId={user._id}
                      players={data.players.map((p) => ({
                        userId: p.userId,
                        username: p.username,
                        mmr: p.mmrAtMatch ?? 0,
                      }))}
                      lobbyState={lobbyState}
                      onReady={handleReady}
                      isReady={isReady}
                    />
                  )}
                </>
              )}

              {/* Player roster */}
              <div className="mt-6">
                <SectionLabel>Roster · {data.players.length} operatives</SectionLabel>
                <ul className="mt-3 flex flex-col gap-2">
                  {data.players.map((p) => {
                    const isWinner = data.result?.winnerId === p.userId;
                    const isMe = p.userId === user._id;
                    const mmrDelta = data.result?.mmrChanges?.[p.userId];
                    return (
                      <li
                        key={p.userId}
                        className={`flex items-center gap-4 clip-blade border px-4 py-3 transition-all ${
                          isWinner
                            ? "border-accent/50 bg-accent/8 shadow-[0_0_12px_-6px_var(--color-ember)]"
                            : isMe
                            ? "border-primary/30 bg-primary/5"
                            : "border-border bg-background/30"
                        }`}
                      >
                        {p.avatar ? (
                          <img
                            src={p.avatar}
                            alt={`${p.username} avatar`}
                            className="h-10 w-10 clip-blade object-cover ring-1 ring-border"
                            loading="lazy"
                          />
                        ) : (
                          <span className="flex h-10 w-10 items-center justify-center clip-blade bg-primary/10 font-display text-sm text-primary ring-1 ring-primary/20">
                            {p.username.slice(0, 2).toUpperCase()}
                          </span>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-display text-sm font-bold uppercase tracking-[0.14em] text-foreground flex items-center gap-2 flex-wrap">
                            {isMe ? "YOU" : p.username}
                            {isWinner && (
                              <span className="clip-blade border border-accent/40 bg-accent/10 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-widest text-accent">
                                ★ Winner
                              </span>
                            )}
                            {p.username.startsWith("bot_") && (
                              <span className="font-mono text-[9px] text-muted-foreground normal-case">
                                (bot)
                              </span>
                            )}
                          </div>
                          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                            {p.rank || "unranked"} · {p.mmrAtMatch ?? "—"} MMR
                          </div>
                        </div>
                        <div className="text-right">
                          {mmrDelta !== undefined && (
                            <div
                              className={`font-mono text-sm font-bold tabular-nums ${
                                mmrDelta >= 0 ? "text-primary" : "text-destructive"
                              }`}
                            >
                              {mmrDelta >= 0 ? `+${mmrDelta}` : mmrDelta}
                            </div>
                          )}
                          <div className="font-mono text-sm tabular-nums text-muted-foreground">
                            {data.result?.scores?.[p.userId] ?? "—"}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </Panel>

          {/* ── Right panel: Result ── */}
          <Panel
            padding="p-6 flex flex-col gap-5"
            className="shadow-[0_8px_40px_-16px_rgba(0,0,0,0.7)] animate-rise"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

            <div>
              <SectionLabel>Result</SectionLabel>

              {data.result?.winnerId ? (
                <div className="flex flex-col gap-4">
                  {/* Winner display */}
                  <div className="clip-blade border border-accent/30 bg-accent/8 p-5 text-center">
                    <div className="text-3xl mb-2">🏆</div>
                    <p className="font-display text-xl font-bold uppercase tracking-widest text-accent">
                      Result Recorded
                    </p>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      Match concluded
                    </p>
                  </div>

                  {/* MMR changes */}
                  {data.result?.mmrChanges && (
                    <div className="flex flex-col gap-2">
                      <SectionLabel>MMR Changes</SectionLabel>
                      {data.players.map((p) => {
                        const delta = data.result?.mmrChanges?.[p.userId];
                        if (delta === undefined) return null;
                        return (
                          <div
                            key={p.userId}
                            className="flex items-center justify-between clip-blade border border-border bg-background/30 px-4 py-3"
                          >
                            <span className="font-mono text-[10px] uppercase tracking-widest text-foreground">
                              {p.username}
                            </span>
                            <span
                              className={`font-mono text-sm font-bold ${
                                delta >= 0 ? "text-primary" : "text-destructive"
                              }`}
                            >
                              {delta >= 0 ? `+${delta}` : delta}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              ) : user?.role === "admin" ? (
                <div className="flex flex-col gap-4">
                  <div className="clip-blade border border-amber-400/20 bg-amber-400/5 px-4 py-3">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-amber-400/80">
                      ⚠ Operator controls — declare the winner of this engagement.
                    </p>
                  </div>
                  <select
                    value={winnerId}
                    onChange={(e) => setWinnerId(e.target.value)}
                    className="w-full clip-blade border border-border bg-background/50 px-4 py-3 text-sm text-foreground outline-none backdrop-blur focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all"
                  >
                    <option value="">Select winner…</option>
                    {data.players.map((p) => (
                      <option key={p.userId} value={p.userId}>
                        {p.username}
                      </option>
                    ))}
                  </select>
                  <Alert>{submitError}</Alert>
                  <ActionButton variant="accent" disabled={!winnerId || busy} onClick={submit}>
                    {busy ? "Submitting…" : "⚡ Submit Result"}
                  </ActionButton>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 py-10 text-center">
                  <div className="relative h-16 w-16">
                    <div className="absolute inset-0 rounded-full border border-primary/30 animate-pulse-ring" />
                    <div className="absolute inset-0 flex items-center justify-center text-2xl opacity-40">⏳</div>
                  </div>
                  <div>
                    <p className="font-display text-sm font-bold uppercase tracking-widest text-foreground">
                      Awaiting Operator
                    </p>
                    <p className="mt-2 font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                      The operator will certify this match result.
                    </p>
                  </div>
                </div>
              )}

              {/* Back link */}
              <div className="mt-auto pt-4 border-t border-border">
                <Link
                  to="/matches"
                  className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground hover:text-primary transition-colors"
                >
                  ← Back to Combat Log
                </Link>
              </div>
            </div>
          </Panel>
        </div>
      )}
    </ArenaShell>
  );
}
