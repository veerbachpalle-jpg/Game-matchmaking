import { o as __toESM } from "../_runtime.mjs";
import { a as require_react, i as require_jsx_runtime, r as useQueryClient, t as useQuery } from "../_libs/react+tanstack__react-query.mjs";
import { a as useAuth, i as getToken, r as api, t as API_BASE_URL } from "./use-auth-xjOyXtJV.mjs";
import { _ as useNavigate, g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as lookup } from "../_libs/socket.io-client+[...].mjs";
import { i as Badge, n as Alert, o as Panel, r as ArenaShell, s as SectionLabel, t as ActionButton } from "./arena-shell-pp1dsK4G.mjs";
import { r as StatusChip, t as Route } from "./match._matchId-Bh5ZsMv2.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/match._matchId-CD_jcsTS.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function XoxBoard({ matchId, currentUserId, initialGameState, socket }) {
	const [gameState, setGameState] = (0, import_react.useState)(initialGameState ?? null);
	const [errorMsg, setErrorMsg] = (0, import_react.useState)(null);
	const [lastMove, setLastMove] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (initialGameState) setGameState(initialGameState);
	}, [initialGameState]);
	(0, import_react.useEffect)(() => {
		const onGameUpdated = (payload) => {
			if (payload.matchId === matchId) {
				setGameState(payload.gameState);
				setErrorMsg(null);
			}
		};
		const onMoveError = (err) => setErrorMsg(err.message);
		socket.on("game-updated", onGameUpdated);
		socket.on("move-error", onMoveError);
		return () => {
			socket.off("game-updated", onGameUpdated);
			socket.off("move-error", onMoveError);
		};
	}, [matchId, socket]);
	if (!gameState) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-6 flex items-center justify-center h-40",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col items-center gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-8 w-8 animate-spin clip-blade border border-primary/40 border-t-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-mono text-[10px] uppercase tracking-widest text-muted-foreground animate-pulse",
				children: "Loading game…"
			})]
		})
	});
	const mySymbol = gameState.players.X === currentUserId ? "X" : "O";
	const isMyTurn = gameState.status === "ongoing" && String(gameState.currentTurn) === String(currentUserId);
	function makeMove(position) {
		if (!isMyTurn || gameState?.board[position] !== null) return;
		setErrorMsg(null);
		setLastMove(position);
		socket.emit("make-move", {
			matchId,
			position
		});
	}
	const statusLabel = gameState.status === "completed" ? String(gameState.winner) === String(currentUserId) ? "🏆 You Won!" : "💀 You Lost" : gameState.status === "draw" ? "🤝 Draw" : isMyTurn ? "⚡ Your Turn" : "⏳ Opponent's Turn";
	const statusColor = gameState.status === "completed" ? String(gameState.winner) === String(currentUserId) ? "text-accent" : "text-destructive" : gameState.status === "draw" ? "text-muted-foreground" : isMyTurn ? "text-primary animate-pulse" : "text-muted-foreground";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-6 clip-blade relative overflow-hidden border border-border bg-background/50 backdrop-blur-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "p-6 flex flex-col items-center gap-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "w-full flex items-center justify-between border-b border-border pb-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-display text-sm font-bold uppercase tracking-[0.18em] text-foreground",
							children: "XOX Arena"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "clip-blade border border-border px-2 py-0.5 font-mono text-[8px] uppercase tracking-widest text-muted-foreground",
							children: "Live"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: `font-mono text-[11px] uppercase tracking-[0.2em] font-bold ${statusColor}`,
						children: statusLabel
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-4 text-xs font-mono",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: `clip-blade px-4 py-2 font-bold flex items-center gap-2 border transition-all ${mySymbol === "X" ? "bg-primary/15 text-primary border-primary/40 shadow-[0_0_12px_-4px_var(--color-primary)]" : "bg-muted/10 text-muted-foreground border-border"}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-base",
								children: "✕"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: gameState.players.X === currentUserId ? "YOU" : "OPPONENT" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted-foreground/40 font-bold",
							children: "VS"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: `clip-blade px-4 py-2 font-bold flex items-center gap-2 border transition-all ${mySymbol === "O" ? "bg-accent/15 text-accent border-accent/40 shadow-[0_0_12px_-4px_var(--color-ember)]" : "bg-muted/10 text-muted-foreground border-border"}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-base",
								children: "○"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: gameState.players.O === currentUserId ? "YOU" : "OPPONENT" })]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-3 gap-2.5 w-60 h-60",
					children: gameState.board.map((cell, idx) => {
						const clickable = isMyTurn && cell === null && gameState.status === "ongoing";
						const isNew = lastMove === idx;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							disabled: !clickable,
							onClick: () => makeMove(idx),
							"aria-label": cell ? `${cell} at cell ${idx}` : `Empty cell ${idx}`,
							className: `flex items-center justify-center clip-blade border text-3xl font-bold font-display transition-all duration-150 ${cell === "X" ? `border-primary/60 bg-primary/15 text-primary ${isNew ? "scale-110" : ""}` : cell === "O" ? `border-accent/60 bg-accent/15 text-accent ${isNew ? "scale-110" : ""}` : clickable ? "border-border bg-surface/40 hover:border-primary/50 hover:bg-primary/8 cursor-pointer active:scale-95 hover:scale-105" : "border-border/40 bg-surface/10 cursor-not-allowed opacity-30"}`,
							children: [cell === "X" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "drop-shadow-[0_0_8px_var(--color-primary)]",
								children: "✕"
							}), cell === "O" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "drop-shadow-[0_0_8px_var(--color-ember)]",
								children: "○"
							})]
						}, idx);
					})
				}),
				errorMsg && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "w-full",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Alert, { children: errorMsg })
				})
			]
		})]
	});
}
function LobbyReadyScreen({ matchId, currentUserId, players, lobbyState, onReady, isReady }) {
	(0, import_react.useEffect)(() => {
		console.log("[LobbyReadyScreen] Debug:", {
			currentUserId,
			players: players.map((p) => ({
				userId: p.userId,
				username: p.username
			})),
			lobbyState,
			isReady
		});
	}, [
		currentUserId,
		players,
		lobbyState,
		isReady
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col items-center gap-6 py-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-center w-full",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-center gap-3 mb-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-px flex-1 bg-gradient-to-r from-transparent to-primary/30" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-lg font-bold uppercase tracking-widest text-foreground",
							children: "Pre-match Lobby"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-px flex-1 bg-gradient-to-l from-transparent to-primary/30" })
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground",
					children: "All operatives must confirm ready before the match begins"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "w-full flex flex-col gap-2",
				children: players.map((p) => {
					const ready = lobbyState?.readyPlayers.includes(p.userId) ?? false;
					const isMe = p.userId === currentUserId;
					const isBot = p.username.startsWith("bot_");
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: `flex items-center justify-between clip-blade border px-4 py-3 transition-all ${ready ? "border-primary/40 bg-primary/8 shadow-[0_0_12px_-6px_var(--color-primary)]" : "border-border bg-background/30"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: `flex h-8 w-8 items-center justify-center clip-blade font-display text-xs font-bold transition-all ${ready ? "bg-primary/20 text-primary ring-1 ring-primary/40" : "bg-white/5 text-muted-foreground"}`,
								children: isMe ? "YOU" : p.username.slice(0, 2).toUpperCase()
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "font-display text-sm font-bold uppercase tracking-[0.12em] text-foreground",
								children: [isMe ? "YOU" : p.username, isBot && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "ml-2 font-mono text-[9px] text-muted-foreground normal-case tracking-normal",
									children: "(bot)"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "font-mono text-[9px] text-muted-foreground uppercase tracking-widest",
								children: [p.mmr, " MMR"]
							})] })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: `clip-blade border px-3 py-1 font-mono text-[10px] uppercase font-bold tracking-[0.18em] ${ready ? "border-primary/40 text-primary bg-primary/10" : "border-border text-muted-foreground/60"}`,
							children: ready ? "✓ Ready" : "Not Ready"
						})]
					}, p.userId);
				})
			}),
			lobbyState && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "w-full",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex justify-between font-mono text-[9px] uppercase tracking-widest text-muted-foreground mb-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Readiness" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-primary font-bold",
						children: [
							lobbyState.readyCount,
							" / ",
							lobbyState.totalNeeded
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "w-full h-1.5 clip-blade bg-white/5 overflow-hidden",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-full bg-primary transition-all duration-500 shadow-[0_0_8px_1px_var(--color-primary)]",
						style: { width: lobbyState.totalNeeded > 0 ? `${lobbyState.readyCount / lobbyState.totalNeeded * 100}%` : "0%" }
					})
				})]
			}),
			!isReady ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: onReady,
				className: "w-full clip-blade relative overflow-hidden bg-primary px-6 py-4 font-display text-sm font-bold uppercase tracking-[0.22em] text-primary-foreground shadow-[0_0_24px_-8px_var(--color-primary)] transition-all hover:opacity-90 hover:shadow-[0_0_32px_-6px_var(--color-primary)] active:scale-[0.98]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "pointer-events-none absolute inset-0 -translate-x-full animate-sweep bg-gradient-to-r from-transparent via-white/15 to-transparent" }), "⚡ I'm Ready"]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "w-full clip-blade border border-primary/40 bg-primary/8 px-6 py-4 text-center font-mono text-xs uppercase tracking-widest text-primary animate-pulse shadow-[0_0_16px_-8px_var(--color-primary)]",
				children: lobbyState?.allReady ? "🚀 Starting game…" : "⏳ Waiting for opponent…"
			})
		]
	});
}
function MatchResultOverlay({ status, winnerId, currentUserId, mmrChanges }) {
	const isWinner = status === "completed" && winnerId === currentUserId;
	const isLoser = status === "completed" && winnerId !== currentUserId;
	const isDraw = status === "draw";
	const mmrChange = mmrChanges?.[currentUserId] ?? 0;
	const mmrText = mmrChange >= 0 ? `+${mmrChange}` : `${mmrChange}`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/92 backdrop-blur-md clip-blade border border-primary/30",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `absolute inset-0 opacity-10 pointer-events-none ${isWinner ? "bg-accent/20" : isLoser ? "bg-destructive/20" : "bg-muted/10"}` }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative flex flex-col items-center gap-5 max-w-xs px-6 text-center",
			children: [
				isWinner && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-5xl animate-bounce drop-shadow-[0_0_20px_var(--color-ember)]",
					children: "🏆"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-4xl font-extrabold uppercase tracking-widest text-accent drop-shadow-[0_0_20px_var(--color-ember)]",
					children: "Victory"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground",
					children: "Objective Secured"
				})] })] }),
				isLoser && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-5xl animate-pulse text-destructive",
					children: "💀"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-4xl font-extrabold uppercase tracking-widest text-destructive",
					children: "Defeat"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground",
					children: "Tactical Failure"
				})] })] }),
				isDraw && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-5xl",
					children: "🤝"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-4xl font-extrabold uppercase tracking-widest text-muted-foreground",
					children: "Draw"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground",
					children: "Stalemate"
				})] })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "clip-blade border border-border bg-surface/60 backdrop-blur px-8 py-4 flex flex-col items-center gap-1.5 min-w-[180px]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono text-[9px] uppercase tracking-widest text-muted-foreground",
						children: "MMR Rating Update"
					}), mmrChanges && mmrChanges[currentUserId] !== void 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: `font-display text-3xl font-bold ${mmrChange > 0 ? "text-primary" : mmrChange < 0 ? "text-destructive" : "text-muted-foreground"}`,
						children: [
							mmrText,
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-sm",
								children: "MMR"
							})
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono text-xs font-bold uppercase tracking-widest text-primary animate-pulse py-1",
						children: "Calculating…"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/play",
					className: "w-full clip-blade relative overflow-hidden bg-primary text-primary-foreground font-display text-xs font-bold uppercase tracking-widest px-6 py-3.5 shadow-[0_0_20px_-6px_var(--color-primary)] hover:opacity-90 active:scale-[0.98] transition-all text-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "pointer-events-none absolute inset-0 -translate-x-full animate-sweep bg-gradient-to-r from-transparent via-white/15 to-transparent" }), "⚡ Return to Queue"]
				})
			]
		})]
	});
}
function MatchRoom() {
	const { matchId } = Route.useParams();
	const { user, loading } = useAuth();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [winnerId, setWinnerId] = (0, import_react.useState)("");
	const [submitError, setSubmitError] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [gameStarted, setGameStarted] = (0, import_react.useState)(false);
	const [gameState, setGameState] = (0, import_react.useState)(null);
	const [lobbyState, setLobbyState] = (0, import_react.useState)(null);
	const [isReady, setIsReady] = (0, import_react.useState)(false);
	const [socket, setSocket] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (!loading && !user) navigate({ to: "/login" });
	}, [
		loading,
		user,
		navigate
	]);
	const { data, isLoading, error } = useQuery({
		queryKey: ["match", matchId],
		queryFn: () => api.match(matchId),
		enabled: Boolean(user)
	});
	(0, import_react.useEffect)(() => {
		if (data?.status === "ongoing" || data?.gameState) {
			setGameStarted(true);
			setGameState(data.gameState ?? null);
		}
	}, [data]);
	(0, import_react.useEffect)(() => {
		if (!user || typeof window === "undefined") return;
		const s = lookup(API_BASE_URL, {
			withCredentials: true,
			auth: { token: getToken() ?? void 0 },
			transports: ["websocket", "polling"]
		});
		setSocket(s);
		const joinRoom = () => {
			console.log("[MatchRoom] Socket connected, joining room:", matchId);
			s.emit("join-game-room", { roomId: matchId });
		};
		if (s.connected) joinRoom();
		s.on("connect", joinRoom);
		s.on("lobby-state", (state) => {
			setLobbyState(state);
		});
		s.on("game-start", (payload) => {
			if (payload.matchId === matchId) {
				console.log("[MatchRoom] game-start received");
				setGameState(payload.gameState);
				setGameStarted(true);
			}
		});
		s.on("game-updated", (payload) => {
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ArenaShell, {
		eyebrow: "Match Room",
		title: `Engagement ${matchId.slice(-6).toUpperCase()}`,
		children: [
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-5",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Alert, { children: error.message })
			}),
			isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-col gap-3",
				children: [...Array(3)].map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "clip-blade border border-white/5 bg-surface/20 p-6 animate-pulse",
					style: { opacity: 1 - i * .2 },
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-4 w-40 rounded bg-white/5 mb-3" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-3 w-60 rounded bg-white/5" })]
				}, i))
			}),
			data && user && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-6 lg:grid-cols-[1.4fr_1fr]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
					padding: "p-6",
					className: "shadow-[0_8px_40px_-16px_rgba(0,0,0,0.7)] animate-rise",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "pointer-events-none absolute inset-0 opacity-[0.02]",
							style: { backgroundImage: "repeating-linear-gradient(to bottom, transparent 0 3px, var(--color-primary) 3px 4px)" }
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center justify-between gap-3 mb-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusChip, { status: data.status }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: "default",
										children: data.gameMode
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground",
										children: new Date(data.createdAt).toLocaleString()
									})]
								})]
							}),
							data.gameMode === "1v1" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: gameStarted && socket ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XoxBoard, {
									matchId,
									currentUserId: user._id,
									initialGameState: gameState,
									socket
								}), (gameState?.status === "completed" || gameState?.status === "draw") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MatchResultOverlay, {
									status: gameState.status,
									winnerId: gameState.winner ?? null,
									currentUserId: user._id,
									mmrChanges: data.result?.mmrChanges
								})]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LobbyReadyScreen, {
								matchId,
								currentUserId: user._id,
								players: data.players.map((p) => ({
									userId: p.userId,
									username: p.username,
									mmr: p.mmrAtMatch ?? 0
								})),
								lobbyState,
								onReady: handleReady,
								isReady
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-6",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SectionLabel, { children: [
									"Roster · ",
									data.players.length,
									" operatives"
								] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "mt-3 flex flex-col gap-2",
									children: data.players.map((p) => {
										const isWinner = data.result?.winnerId === p.userId;
										const isMe = p.userId === user._id;
										const mmrDelta = data.result?.mmrChanges?.[p.userId];
										return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
											className: `flex items-center gap-4 clip-blade border px-4 py-3 transition-all ${isWinner ? "border-accent/50 bg-accent/8 shadow-[0_0_12px_-6px_var(--color-ember)]" : isMe ? "border-primary/30 bg-primary/5" : "border-border bg-background/30"}`,
											children: [
												p.avatar ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
													src: p.avatar,
													alt: `${p.username} avatar`,
													className: "h-10 w-10 clip-blade object-cover ring-1 ring-border",
													loading: "lazy"
												}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "flex h-10 w-10 items-center justify-center clip-blade bg-primary/10 font-display text-sm text-primary ring-1 ring-primary/20",
													children: p.username.slice(0, 2).toUpperCase()
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex-1 min-w-0",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "font-display text-sm font-bold uppercase tracking-[0.14em] text-foreground flex items-center gap-2 flex-wrap",
														children: [
															isMe ? "YOU" : p.username,
															isWinner && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																className: "clip-blade border border-accent/40 bg-accent/10 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-widest text-accent",
																children: "★ Winner"
															}),
															p.username.startsWith("bot_") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																className: "font-mono text-[9px] text-muted-foreground normal-case",
																children: "(bot)"
															})
														]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground",
														children: [
															p.rank || "unranked",
															" · ",
															p.mmrAtMatch ?? "—",
															" MMR"
														]
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "text-right",
													children: [mmrDelta !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: `font-mono text-sm font-bold tabular-nums ${mmrDelta >= 0 ? "text-primary" : "text-destructive"}`,
														children: mmrDelta >= 0 ? `+${mmrDelta}` : mmrDelta
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "font-mono text-sm tabular-nums text-muted-foreground",
														children: data.result?.scores?.[p.userId] ?? "—"
													})]
												})
											]
										}, p.userId);
									})
								})]
							})
						] })
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
					padding: "p-6 flex flex-col gap-5",
					className: "shadow-[0_8px_40px_-16px_rgba(0,0,0,0.7)] animate-rise",
					style: { animationDelay: "0.1s" },
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionLabel, { children: "Result" }),
						data.result?.winnerId ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col gap-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "clip-blade border border-accent/30 bg-accent/8 p-5 text-center",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-3xl mb-2",
										children: "🏆"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-display text-xl font-bold uppercase tracking-widest text-accent",
										children: "Result Recorded"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground",
										children: "Match concluded"
									})
								]
							}), data.result?.mmrChanges && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionLabel, { children: "MMR Changes" }), data.players.map((p) => {
									const delta = data.result?.mmrChanges?.[p.userId];
									if (delta === void 0) return null;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between clip-blade border border-border bg-background/30 px-4 py-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-mono text-[10px] uppercase tracking-widest text-foreground",
											children: p.username
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: `font-mono text-sm font-bold ${delta >= 0 ? "text-primary" : "text-destructive"}`,
											children: delta >= 0 ? `+${delta}` : delta
										})]
									}, p.userId);
								})]
							})]
						}) : user?.role === "admin" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col gap-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "clip-blade border border-amber-400/20 bg-amber-400/5 px-4 py-3",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-mono text-[10px] uppercase tracking-widest text-amber-400/80",
										children: "⚠ Operator controls — declare the winner of this engagement."
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									value: winnerId,
									onChange: (e) => setWinnerId(e.target.value),
									className: "w-full clip-blade border border-border bg-background/50 px-4 py-3 text-sm text-foreground outline-none backdrop-blur focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "",
										children: "Select winner…"
									}), data.players.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: p.userId,
										children: p.username
									}, p.userId))]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Alert, { children: submitError }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActionButton, {
									variant: "accent",
									disabled: !winnerId || busy,
									onClick: submit,
									children: busy ? "Submitting…" : "⚡ Submit Result"
								})
							]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col items-center gap-4 py-10 text-center",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative h-16 w-16",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 rounded-full border border-primary/30 animate-pulse-ring" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "absolute inset-0 flex items-center justify-center text-2xl opacity-40",
									children: "⏳"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display text-sm font-bold uppercase tracking-widest text-foreground",
								children: "Awaiting Operator"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 font-mono text-[10px] text-muted-foreground uppercase tracking-widest",
								children: "The operator will certify this match result."
							})] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-auto pt-4 border-t border-border",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/matches",
								className: "inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground hover:text-primary transition-colors",
								children: "← Back to Combat Log"
							})
						})
					] })]
				})]
			})
		]
	});
}
//#endregion
export { MatchRoom as component };
