import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { ArenaShell, ActionButton, Alert, Panel } from "@/components/arena-shell";
import { XoxBoard, findWinningLine } from "@/components/xox-board";
import { StatusChip } from "@/routes/matches";
import { api, isBot, type GameState } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { useSocket, useSocketEvent } from "@/hooks/use-socket";

export const Route = createFileRoute("/match/$matchId")({
  component: MatchRoom,
  head: () => ({
    meta: [
      { title: "Match Room — MatchForge" },
      {
        name: "description",
        content:
          "Live match room: ready-up lobby, real-time XOX duel board, MMR deltas and the certified scoreboard.",
      },
      { property: "og:title", content: "Match Room — MatchForge" },
      {
        property: "og:description",
        content: "Ready-up lobby, live duel board, MMR deltas and the final scoreboard.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

type Lobby = {
  readyPlayers: string[];
  readyCount: number;
  totalNeeded: number;
  allReady: boolean;
};

function MatchRoom() {
  const { matchId } = Route.useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { socket, connected, ping, emit } = useSocket();

  const [lobby, setLobby] = useState<Lobby | null>(null);
  const [game, setGame] = useState<GameState | null>(null);
  const [moveError, setMoveError] = useState<string | null>(null);
  const [winnerId, setWinnerId] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["match", matchId],
    queryFn: () => api.match(matchId),
    enabled: Boolean(user),
  });

  // Seed local game state from the REST snapshot (server-restart recovery).
  useEffect(() => {
    if (data?.gameState) setGame(data.gameState);
  }, [data?.gameState]);

  // Join the socket room for this match once the gateway is live.
  useEffect(() => {
    if (!socket || !connected) return;
    emit("join-game-room", { roomId: matchId });
  }, [socket, connected, emit, matchId]);

  useSocketEvent("lobby-state", (payload: Lobby) => setLobby(payload), [matchId]);
  useSocketEvent(
    "game-start",
    (payload: { matchId: string; gameState: GameState }) => {
      if (payload?.gameState) setGame(payload.gameState);
    },
    [matchId],
  );
  useSocketEvent(
    "game-updated",
    (payload: GameState | { gameState: GameState }) => {
      const next = "board" in payload ? payload : payload.gameState;
      if (!next) return;
      setGame(next);
      setMoveError(null);
      if (next.status !== "ongoing") {
        // MMR deltas are only available from the REST record.
        setTimeout(() => {
          void queryClient.invalidateQueries({ queryKey: ["match", matchId] });
          void queryClient.invalidateQueries({ queryKey: ["me"] });
        }, 600);
      }
    },
    [matchId],
  );
  useSocketEvent(
    "move-error",
    (payload: { message?: string } | string) =>
      setMoveError(typeof payload === "string" ? payload : (payload?.message ?? "Invalid move")),
    [matchId],
  );

  const isDuel = data?.gameMode === "1v1";
  const iAmReady = Boolean(user && lobby?.readyPlayers?.includes(user._id));
  const mySymbol = useMemo(() => {
    if (!game || !user) return null;
    if (game.players.X === user._id) return "X" as const;
    if (game.players.O === user._id) return "O" as const;
    return null;
  }, [game, user]);
  const myTurn = Boolean(game && user && game.currentTurn === user._id && game.status === "ongoing");
  const winningLine = game ? findWinningLine(game.board) : undefined;

  const nameOf = (id?: string | null) =>
    data?.players.find((p) => p.userId === id)?.username ?? "unknown";

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
      subtitle={
        isDuel
          ? "Ready up, then take the board. Moves are validated server-side; bots respond in 700ms."
          : "Four-operative lobby. The result is certified by an arena operator."
      }
    >
      {error && <Alert>{(error as Error).message}</Alert>}
      {isLoading && (
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          Syncing lobby…
        </p>
      )}

      {data && (
        <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
          <Panel className="scanlines">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <StatusChip status={data.status} />
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
                  {data.gameMode}
                </span>
              </div>
              <span className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                <span>{ping || "—"}ms</span>
                <span className="flex items-center gap-2">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      connected ? "bg-primary animate-pulse" : "bg-destructive"
                    }`}
                  />
                  {connected ? "Linked" : "Offline"}
                </span>
              </span>
            </div>

            {isDuel ? (
              <div className="mt-8">
                {game ? (
                  <>
                    <div className="mb-6 text-center">
                      <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                        {game.status === "ongoing"
                          ? myTurn
                            ? "Your move"
                            : `Waiting for ${nameOf(game.currentTurn)}`
                          : game.status === "draw"
                            ? "Stalemate"
                            : `${nameOf(game.winner)} wins`}
                      </p>
                      {mySymbol && (
                        <p className="mt-2 font-display text-sm tracking-[0.16em] text-foreground">
                          You are{" "}
                          <span className={mySymbol === "X" ? "text-primary" : "text-accent"}>
                            {mySymbol}
                          </span>
                        </p>
                      )}
                    </div>
                    <XoxBoard
                      board={game.board}
                      winningLine={winningLine}
                      disabled={!myTurn}
                      onPlay={(position) => {
                        setMoveError(null);
                        emit("make-move", { matchId, position });
                      }}
                    />
                    {game.status !== "ongoing" && (
                      <p className="mt-8 text-center font-display text-3xl font-bold text-gradient">
                        {game.status === "draw" ? "Draw" : "Victory locked"}
                      </p>
                    )}
                  </>
                ) : (
                  <div className="text-center">
                    <div className="mx-auto h-32 w-32 rounded-full border border-primary/30 animate-pulse-ring" />
                    <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                      Lobby phase · {lobby?.readyCount ?? 0}/{lobby?.totalNeeded ?? 1} ready
                    </p>
                    <div className="mt-6">
                      <ActionButton
                        disabled={!connected || iAmReady}
                        onClick={() => emit("player-ready", { matchId })}
                      >
                        {iAmReady ? "Ready — waiting" : "Ready up"}
                      </ActionButton>
                    </div>
                  </div>
                )}
                {moveError && (
                  <div className="mt-6">
                    <Alert>{moveError}</Alert>
                  </div>
                )}
              </div>
            ) : (
              <p className="mt-8 text-sm leading-relaxed text-muted-foreground">
                Four-player mode has no in-browser board yet — the lobby is recorded and an operator
                certifies the winner. MMR snapshots for every operative are listed to the right.
              </p>
            )}
          </Panel>

          <div className="flex flex-col gap-6">
            <Panel>
              <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                Roster
              </span>
              {(() => {
                const renderPlayer = (p: MatchPlayer) => {
                  const isWinner =
                    data.result?.winnerId === p.userId || (game?.winner ?? null) === p.userId;
                  const delta = data.result?.mmrChanges?.[p.userId];
                  const ready = lobby?.readyPlayers?.includes(p.userId);
                  return (
                    <li
                      key={p.userId}
                      className={`flex items-center gap-4 border px-4 py-3 ${
                        isWinner ? "border-accent/70 bg-accent/10" : "border-border/60 bg-surface/40"
                      }`}
                    >
                      {p.avatar ? (
                        <img
                          src={p.avatar}
                          alt={`${p.username} avatar`}
                          className="h-10 w-10 object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <span className="grid h-10 w-10 place-items-center bg-primary/15 font-display text-sm text-primary">
                          {p.username.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-display text-sm font-bold tracking-[0.14em] text-foreground truncate">
                          {p.username}
                          {isBot(p.username) && (
                            <span className="ml-2 font-mono text-[9px] tracking-[0.16em] text-accent">
                              AI
                            </span>
                          )}
                          {isWinner && <span className="ml-2 text-accent">· winner</span>}
                        </div>
                        <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                          {p.rank || "unranked"} · {p.mmrAtMatch ?? "—"} mmr
                          {ready && <span className="ml-2 text-primary">· ready</span>}
                        </div>
                      </div>
                      {typeof delta === "number" ? (
                        <span
                          className={`font-mono text-sm tabular-nums ${
                            delta >= 0 ? "text-primary" : "text-destructive"
                          }`}
                        >
                          {delta >= 0 ? "+" : ""}
                          {Math.round(delta)}
                        </span>
                      ) : (
                        <span className="font-mono text-sm tabular-nums text-muted-foreground">
                          {data.result?.scores?.[p.userId] ?? "—"}
                        </span>
                      )}
                    </li>
                  );
                };

                if (data.gameMode === "4v4" && data.teamA && data.teamB) {
                  return (
                    <div className="mt-5 grid gap-6 sm:grid-cols-2">
                      <div>
                        <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-primary mb-3 block">
                          Team Alpha
                        </span>
                        <ul className="flex flex-col gap-3">
                          {data.teamA.map(renderPlayer)}
                        </ul>
                      </div>
                      <div>
                        <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-accent mb-3 block">
                          Team Bravo
                        </span>
                        <ul className="flex flex-col gap-3">
                          {data.teamB.map(renderPlayer)}
                        </ul>
                      </div>
                    </div>
                  );
                }

                return (
                  <ul className="mt-5 flex flex-col gap-3">
                    {data.players.map(renderPlayer)}
                  </ul>
                );
              })()}
            </Panel>

            {!isDuel && (
              <Panel>
                <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                  Result
                </span>
                {data.result?.winnerId ? (
                  <p className="mt-5 font-display text-2xl font-bold text-gradient">
                    {nameOf(data.result.winnerId)} certified
                  </p>
                ) : user?.role === "admin" ? (
                  <div className="mt-5 flex flex-col gap-4">
                    <p className="text-sm text-muted-foreground">
                      Operator controls — declare the winner of this engagement.
                    </p>
                    <select
                      value={winnerId}
                      onChange={(e) => setWinnerId(e.target.value)}
                      className="border border-input bg-background/60 px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
                    >
                      <option value="">Select winner…</option>
                      {data.players.map((p) => (
                        <option key={p.userId} value={p.userId}>
                          {p.username}
                        </option>
                      ))}
                    </select>
                    {submitError && <Alert>{submitError}</Alert>}
                    <ActionButton variant="accent" disabled={!winnerId || busy} onClick={submit}>
                      {busy ? "Submitting…" : "Submit result"}
                    </ActionButton>
                  </div>
                ) : (
                  <p className="mt-5 text-sm text-muted-foreground">
                    Awaiting the operator to certify this match result.
                  </p>
                )}
              </Panel>
            )}

            <div className="flex gap-5">
              <Link
                to="/matches"
                className="font-mono text-[10px] uppercase tracking-[0.16em] text-primary hover:text-accent"
              >
                ← Combat log
              </Link>
              <Link
                to="/play"
                className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground hover:text-primary"
              >
                Queue again →
              </Link>
            </div>
          </div>
        </div>
      )}
    </ArenaShell>
  );
}
