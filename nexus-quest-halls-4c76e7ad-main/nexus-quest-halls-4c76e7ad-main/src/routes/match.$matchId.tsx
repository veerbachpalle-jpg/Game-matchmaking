import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, useRef } from "react";
import { ArenaShell, ActionButton, Alert, Panel } from "@/components/arena-shell";
import { StatusChip } from "@/routes/matches";
import { api, API_BASE_URL, getToken, type GameState } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { io, type Socket } from "socket.io-client";

export const Route = createFileRoute("/match/$matchId")({
  component: MatchRoom,
  head: () => ({
    meta: [
      { title: "Match Room — Nexus Arena" },
      {
        name: "description",
        content: "Live match room with the full lobby roster, MMR snapshots and the final scoreboard.",
      },
      { property: "og:title", content: "Match Room — Nexus Arena" },
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
  readyPlayers: string[];   // IDs of players who clicked ready
  readyCount: number;
  totalNeeded: number;      // number of human players required
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
      <div className="mt-6 flex items-center justify-center h-32 text-muted-foreground font-mono text-xs uppercase tracking-widest animate-pulse">
        Loading game…
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

  return (
    <div className="mt-6 flex flex-col items-center clip-blade border border-primary/40 bg-surface/60 p-6 gap-4">
      {/* Header */}
      <div className="w-full flex items-center justify-between border-b border-border/60 pb-3">
        <span className="font-display text-xs font-bold uppercase tracking-[0.18em] text-foreground">
          XOX Arena
        </span>
        <span
          className={`font-mono text-[11px] uppercase tracking-[0.2em] font-bold ${
            isMyTurn ? "text-primary animate-pulse" : "text-muted-foreground"
          }`}
        >
          {statusLabel}
        </span>
      </div>

      {/* Symbol badges */}
      <div className="flex items-center gap-3 text-xs font-mono">
        <span
          className={`px-2 py-1 rounded font-bold ${
            mySymbol === "X"
              ? "bg-primary/20 text-primary border border-primary/40"
              : "bg-muted/20 text-muted-foreground border border-border/30"
          }`}
        >
          X = {gameState.players.X === currentUserId ? "YOU" : "OPPONENT"}
        </span>
        <span className="text-border">·</span>
        <span
          className={`px-2 py-1 rounded font-bold ${
            mySymbol === "O"
              ? "bg-accent/20 text-accent border border-accent/40"
              : "bg-muted/20 text-muted-foreground border border-border/30"
          }`}
        >
          O = {gameState.players.O === currentUserId ? "YOU" : "OPPONENT"}
        </span>
      </div>

      {/* 3×3 Board */}
      <div className="grid grid-cols-3 gap-3 w-56 h-56">
        {gameState.board.map((cell, idx) => {
          const isEmpty = cell === null;
          const clickable = isMyTurn && isEmpty && gameState.status === "ongoing";
          return (
            <button
              key={idx}
              type="button"
              disabled={!clickable}
              onClick={() => makeMove(idx)}
              aria-label={cell ? `${cell} at cell ${idx}` : `Empty cell ${idx}`}
              className={`flex items-center justify-center clip-blade border text-3xl font-bold font-display transition-all duration-150 ${
                cell === "X"
                  ? "border-primary/80 bg-primary/20 text-primary"
                  : cell === "O"
                  ? "border-accent/80 bg-accent/20 text-accent"
                  : clickable
                  ? "border-border/60 bg-surface/40 hover:border-primary/60 hover:bg-primary/10 cursor-pointer active:scale-95"
                  : "border-border/20 bg-surface/10 cursor-not-allowed opacity-40"
              }`}
            >
              {cell}
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
      players: players.map(p => ({ userId: p.userId, username: p.username })),
      lobbyState,
      isReady
    });
  }, [currentUserId, players, lobbyState, isReady]);

  return (
    <div className="flex flex-col items-center gap-6 py-6">
      <div className="text-center">
        <h2 className="font-display text-xl font-bold uppercase tracking-widest text-foreground">
          Pre-match Lobby
        </h2>
        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          All operatives must confirm ready before the match begins
        </p>
      </div>

      {/* Player ready status */}
      <div className="w-full flex flex-col gap-3">
        {players.map((p) => {
          const ready = lobbyState?.readyPlayers.includes(p.userId) ?? false;
          const isMe = p.userId === currentUserId;
          const isBot = p.username.startsWith("bot_");
          return (
            <div
              key={p.userId}
              className={`flex items-center justify-between clip-blade border px-4 py-3 transition-all ${
                ready
                  ? "border-primary/60 bg-primary/10"
                  : "border-border/60 bg-surface/40"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`h-2.5 w-2.5 rounded-full transition-all ${
                    ready ? "bg-primary shadow-[0_0_6px_theme(colors.primary)]" : "bg-border"
                  }`}
                />
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
                    {p.mmr} mmr
                  </div>
                </div>
              </div>
              <span
                className={`font-mono text-[10px] uppercase font-bold tracking-[0.18em] ${
                  ready ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {ready ? "✓ READY" : "NOT READY"}
              </span>
            </div>
          );
        })}
      </div>

      {/* Ready count bar */}
      {lobbyState && (
        <div className="w-full">
          <div className="flex justify-between font-mono text-[9px] uppercase tracking-widest text-muted-foreground mb-1.5">
            <span>Readiness</span>
            <span>{lobbyState.readyCount} / {lobbyState.totalNeeded}</span>
          </div>
          <div className="w-full h-1.5 bg-border/40 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500"
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
          className="w-full clip-blade bg-primary px-6 py-4 font-display text-sm font-bold uppercase tracking-[0.22em] text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98]"
        >
          ⚡ I'm Ready
        </button>
      ) : (
        <div className="w-full clip-blade border border-primary/50 bg-primary/10 px-6 py-4 text-center font-mono text-xs uppercase tracking-widest text-primary animate-pulse">
          {lobbyState?.allReady ? "Starting game…" : "Waiting for opponent…"}
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
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-md p-6 text-center clip-blade border border-primary/45 animate-in fade-in zoom-in duration-300">
      <div className="flex flex-col items-center gap-6 max-w-sm">
        {isWinner && (
          <>
            <div className="text-primary text-6xl animate-bounce">🏆</div>
            <h2 className="font-display text-3xl font-extrabold uppercase tracking-widest text-primary drop-shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]">
              Victory
            </h2>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Objective Secured
            </p>
          </>
        )}

        {isLoser && (
          <>
            <div className="text-destructive text-6xl animate-pulse">💀</div>
            <h2 className="font-display text-3xl font-extrabold uppercase tracking-widest text-destructive drop-shadow-[0_0_15px_rgba(var(--destructive-rgb),0.5)]">
              Defeat
            </h2>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Tactical Failure
            </p>
          </>
        )}

        {isDraw && (
          <>
            <div className="text-muted-foreground text-6xl">🤝</div>
            <h2 className="font-display text-3xl font-extrabold uppercase tracking-widest text-muted-foreground">
              Draw
            </h2>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Stalemate
            </p>
          </>
        )}

        {/* MMR Change Display */}
        <div className="mt-2 clip-blade border border-border/80 bg-surface/80 px-6 py-3 flex flex-col items-center gap-1 min-w-[160px]">
          <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
            MMR Rating Update
          </span>
          {mmrChanges && mmrChanges[currentUserId] !== undefined ? (
            <span
              className={`font-display text-2xl font-bold ${
                mmrChange > 0
                  ? "text-primary"
                  : mmrChange < 0
                  ? "text-destructive"
                  : "text-muted-foreground"
              }`}
            >
              {mmrText} MMR
            </span>
          ) : (
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-primary animate-pulse py-1">
              Calculating...
            </span>
          )}
        </div>

        <Link
          to="/play"
          className="mt-4 clip-blade bg-primary text-primary-foreground font-display text-xs font-bold uppercase tracking-widest px-6 py-3.5 hover:opacity-90 active:scale-[0.98] transition-all w-full text-center"
        >
          Return to Queue
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

  // ── Game / lobby state ──────────────────────────────────────
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

  // Automatically transition if the match is already active
  useEffect(() => {
    if (data?.status === "ongoing" || data?.gameState) {
      setGameStarted(true);
      setGameState(data.gameState ?? null);
    }
  }, [data]);

  // ── Socket setup ────────────────────────────────────────────
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

    if (s.connected) {
      joinRoom();
    }
    s.on("connect", joinRoom);

    // Lobby state update (before game starts)
    s.on("lobby-state", (state: LobbyState) => {
      setLobbyState(state);
    });

    // Game has started — show the board
    s.on("game-start", (payload: { matchId: string; gameState: GameState }) => {
      if (payload.matchId === matchId) {
        console.log("[MatchRoom] game-start received");
        setGameState(payload.gameState);
        setGameStarted(true);
      }
    });

    // Live game updates (moves)
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
    <ArenaShell eyebrow="Match Room" title={`Engagement ${matchId.slice(-6).toUpperCase()}`}>
      {error && <Alert>{(error as Error).message}</Alert>}
      {isLoading && (
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          Syncing lobby…
        </p>
      )}

      {data && user && (
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <Panel className="scanlines">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <StatusChip status={data.status} />
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                {data.gameMode} · {new Date(data.createdAt).toLocaleString()}
              </span>
            </div>

            {/* ── Game mode: 1v1 ── */}
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

            {/* ── Player list ── */}
            <ul className="mt-6 flex flex-col gap-3">
              {data.players.map((p) => {
                const isWinner = data.result?.winnerId === p.userId;
                return (
                  <li
                    key={p.userId}
                    className={`flex items-center gap-4 clip-blade border px-4 py-3 ${
                      isWinner ? "border-accent/70 bg-accent/10" : "border-border/60 bg-surface/40"
                    }`}
                  >
                    {p.avatar ? (
                      <img
                        src={p.avatar}
                        alt={`${p.username} avatar`}
                        className="h-10 w-10 clip-blade object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <span className="grid h-10 w-10 place-items-center clip-blade bg-primary/15 font-display text-sm text-primary">
                        {p.username.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                    <div className="flex-1">
                      <div className="font-display text-sm font-bold uppercase tracking-[0.14em] text-foreground">
                        {p.username} {isWinner && <span className="text-accent">· winner</span>}
                      </div>
                      <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                        {p.rank || "unranked"} · {p.mmrAtMatch ?? "—"} mmr
                        {data.result?.mmrChanges?.[p.userId] !== undefined && (
                          <span className={data.result.mmrChanges[p.userId] >= 0 ? "text-primary ml-1" : "text-destructive ml-1"}>
                            ({data.result.mmrChanges[p.userId] >= 0 ? `+${data.result.mmrChanges[p.userId]}` : data.result.mmrChanges[p.userId]})
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="font-mono text-sm tabular-nums text-primary">
                      {data.result?.scores?.[p.userId] ?? "—"}
                    </span>
                  </li>
                );
              })}
            </ul>
          </Panel>

          <Panel>
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
              Result
            </span>
            {data.result?.winnerId ? (
              <p className="mt-5 font-display text-2xl font-bold uppercase text-gradient">
                Result recorded
              </p>
            ) : user?.role === "admin" ? (
              <div className="mt-5 flex flex-col gap-4">
                <p className="text-sm text-muted-foreground">
                  Operator controls — declare the winner of this engagement.
                </p>
                <select
                  value={winnerId}
                  onChange={(e) => setWinnerId(e.target.value)}
                  className="clip-blade border border-input bg-surface/60 px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
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
                  {busy ? "Submitting…" : "Submit result"}
                </ActionButton>
              </div>
            ) : (
              <p className="mt-5 text-sm text-muted-foreground">
                Awaiting the operator to certify this match result.
              </p>
            )}
            <Link
              to="/matches"
              className="mt-8 inline-block font-mono text-[10px] uppercase tracking-[0.22em] text-primary hover:text-accent"
            >
              ← Back to combat log
            </Link>
          </Panel>
        </div>
      )}
    </ArenaShell>
  );
}
