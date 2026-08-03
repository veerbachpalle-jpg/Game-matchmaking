import jwt from 'jsonwebtoken';
import { User } from '../models/user.models.js';
import { Matchhistory } from '../models/Matchhistory.model.js';
import { matchmaker } from '../Matchfunction/matchmaker.js';
import { gameManager } from '../Matchfunction/gameManager.js';
import fs from 'fs';
import path from 'path';

function logDebug(message) {
  const timestamp = new Date().toISOString();
  console.log(`[SOCKET DEBUG ${timestamp}] ${message}`);
}


const useractiverooms = new Map();


// matchId -> { readyPlayers: Set<string>, expectedHumans: number, botPlayerIds: string[], initialized: boolean }
const lobbyReadyState = new Map();

function getLobbyState(matchId) {
  if (!lobbyReadyState.has(matchId)) {
    lobbyReadyState.set(matchId, {
      readyPlayers: new Set(),
      expectedHumans: 0,
      botPlayerIds: [],
      initialized: false,
    });
  }
  return lobbyReadyState.get(matchId);
}

function serializeLobby(state) {
  const needed = state.expectedHumans || 1;
  return {
    readyPlayers: Array.from(state.readyPlayers),
    readyCount: state.readyPlayers.size,
    totalNeeded: needed,
    allReady: state.readyPlayers.size >= needed,
  };
}

async function triggerBotMoveIfNeeded(io, matchId, nextTurnUserId) {
  try {
    const user = await User.findById(nextTurnUserId);
    if (user && user.username.startsWith('bot_')) {
      setTimeout(async () => {
        const game = gameManager.getGame(matchId);
        if (!game || game.status !== 'ongoing') return;

        const emptyIndices = game.board
          .map((cell, idx) => (cell === null ? idx : null))
          .filter((val) => val !== null);

        if (emptyIndices.length > 0) {
          const randomIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
          const result = await gameManager.makeMove(matchId, nextTurnUserId, randomIndex);
          if (result.success) {
            io.to(matchId).emit('game-updated', { matchId, gameState: result.game });
            if (result.game.status === 'ongoing') {
              triggerBotMoveIfNeeded(io, matchId, result.game.currentTurn);
            }
          }
        }
      }, 700);
    }
  } catch (err) {
    console.log('Error in triggerBotMoveIfNeeded:', err);
  }
}

async function startGame(io, matchId) {
  try {
    let game = gameManager.getGame(matchId);

    if (!game) {
      const match = await Matchhistory.findById(matchId);
      if (match && match.gameMode === '1v1' && match.players.length >= 2) {
        const p1 = match.playerX?.toString() || match.players[0].user?.toString();
        const p2 = match.playerO?.toString() || match.players[1].user?.toString();
        if (p1 && p2) {
          game = gameManager.createGame(matchId, p1, p2);
          console.log(`[startGame] Created game: X=${p1}, O=${p2}`);
        }
      }
    }

    if (game) {
      // Set match status to ongoing in DB
      await Matchhistory.findByIdAndUpdate(matchId, { status: 'ongoing' });
      console.log(`[startGame] Broadcasting game-start for match ${matchId}`);
      io.to(matchId).emit('game-start', { matchId, gameState: game });

      if (game.status === 'ongoing') {
        triggerBotMoveIfNeeded(io, matchId, game.currentTurn);
      }
    } else {
      console.log(`[startGame] No game found/created for match ${matchId}`);
    }
  } catch (err) {
    console.log('[startGame] Error:', err);
  }
}

export const setupsockethandler = (io) => {
  io.use(async (socket, next) => {
    try {
      let token =
        socket.handshake.auth?.token ||
        socket.handshake.headers['authorization']?.split(' ')[1] ||
        socket.handshake.headers['authorisation']?.split(' ')[1];

      if (!token && socket.handshake.headers.cookie) {
        const cookies = Object.fromEntries(
          socket.handshake.headers.cookie.split(';').map((c) => {
            const [k, ...v] = c.trim().split('=');
            return [k, v.join('=')];
          })
        );
        token = cookies.accesstoken || cookies.accessToken;
      }

      if (!token) return next(new Error('Authentication error: no token found'));

      const secret = process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET || "super_secret_matchmaker_access_token_key_2026";
      const decoded = jwt.verify(token, secret);
      const userId = decoded._id || decoded.userId;
      socket.data.userId = String(userId); // always a plain string

      const user = await User.findById(userId);
      if (!user) return next(new Error('User not found'));
      socket.data.username = user.username;

      next();
    } catch (error) {
      console.log('Socket authentication failed:', error.message);
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = String(socket.data.userId);
    const username = socket.data.username;

    logDebug(`Socket connected: ${username} (${userId}), socketId: ${socket.id}`);
    socket.join(userId);

    try {
      await User.findByIdAndUpdate(userId, { status: 'online' });
    } catch (err) {
      console.log('Failed to update user status:', err);
    }

    // ── Ping ────────────────────────────────────────────────────────
    socket.on('ping-check', (clientTimestamp, callback) => {
      if (typeof callback === 'function') callback(clientTimestamp);
      else socket.emit('pong-check', clientTimestamp);
    });

    // ── Queue ────────────────────────────────────────────────────────
    socket.on('join-queue', async (data) => {
      try {
        const { ping, region, gamemode } = data;
        const userDoc = await User.findById(userId);
        if (!userDoc) return;

        const mmr = userDoc.mmr || 1000;
        const safePing = (ping !== undefined && !isNaN(ping)) ? Number(ping) : 40;

        console.log(`${username} joining ${gamemode} queue (MMR:${mmr} Ping:${safePing}ms)`);
        await matchmaker.addticket(userId, username, mmr, safePing, region, gamemode);
        socket.emit('queue-joined', { gamemode, region, ping });
      } catch (error) {
        console.log('join-queue error:', error);
        socket.emit('error', { message: 'failed to join matchmaking queue' });
      }
    });

    socket.on('leave-queue', async () => {
      try {
        await matchmaker.removeticket(userId);
        socket.emit('queue-left');
      } catch (error) {
        console.log('leave-queue error:', error);
      }
    });

    // ── Join Game Room ───────────────────────────────────────────────
    socket.on('join-game-room', async (data) => {
      const roomId = data.roomId;
      logDebug(`[join-game-room] user: ${username} (${userId}) joined room: ${roomId}`);
      socket.join(roomId);
      useractiverooms.set(userId, roomId);

      try { await User.findByIdAndUpdate(userId, { status: 'in-game' }); } catch (_) {}

      try {
        const lobby = getLobbyState(roomId);

        // Initialize lobby once per match (or re-init if previous attempt failed)
        if (!lobby.initialized) {
          const match = await Matchhistory.findById(roomId);

          if (match && match.gameMode === '1v1') {
            // Collect all player IDs from the match record
            const playerIds = match.players
              .map(p => p.user?._id?.toString() || p.user?.toString())
              .filter(Boolean);

            // Directly query User collection — avoids any populate issues
            const playerUsers = await User.find({ _id: { $in: playerIds } }).select('username');

            const botIds = playerUsers
              .filter(u => u.username.startsWith('bot_'))
              .map(u => String(u._id));

            const humanCount = playerUsers.filter(u => !u.username.startsWith('bot_')).length;

            lobby.expectedHumans = humanCount || 1; // fallback to 1 if lookup fails
            lobby.botPlayerIds = botIds;
            lobby.initialized = true;

            logDebug(`[lobby-init] match=${roomId} expectedHumans=${lobby.expectedHumans} botIds=${JSON.stringify(botIds)}`);
          } else {
            logDebug(`[lobby-init] match not found or not 1v1 for roomId=${roomId}`);
          }
        }

        // If server restarted but match is ongoing in DB, recreate game session
        let game = gameManager.getGame(roomId);
        if (!game) {
          const match = await Matchhistory.findById(roomId);
          if (match && match.gameMode === '1v1' && match.status === 'ongoing' && match.players.length >= 2) {
            const p1 = match.playerX?.toString() || match.players[0].user?.toString();
            const p2 = match.playerO?.toString() || match.players[1].user?.toString();
            if (p1 && p2) {
              game = gameManager.createGame(roomId, p1, p2);
              logDebug(`[join-game-room] Recreated active game on restart: matchId=${roomId}`);
            }
          }
        }

        if (game) {
          logDebug(`[lobby] Game already active for ${roomId}, sending game-start directly`);
          socket.emit('game-start', { matchId: roomId, gameState: game });
        } else {
          const lobbyData = serializeLobby(lobby);
          logDebug(`[lobby] Sending lobby-state to ${username}: readyCount=${lobbyData.readyCount} totalNeeded=${lobbyData.totalNeeded} allReady=${lobbyData.allReady}`);
          socket.emit('lobby-state', lobbyData);
        }
      } catch (err) {
        logDebug(`[lobby-init-error] ${err.message}`);
      }
    });

    // ── Player Ready ─────────────────────────────────────────────────
    socket.on('player-ready', async (data) => {
      const matchId = data?.matchId;
      if (!matchId) {
        logDebug(`[player-ready] no matchId provided by user ${username}`);
        return;
      }

      try {
        if (!socket.rooms.has(matchId)) {
          logDebug(`[player-ready] socket ${socket.id} of ${username} was not in room ${matchId}, joining on the fly`);
          socket.join(matchId);
        }

        const lobby = getLobbyState(matchId);
        lobby.readyPlayers.add(userId);

        const serialized = serializeLobby(lobby);
        logDebug(`[player-ready] user ${username} (${userId}) clicked ready in match ${matchId}. readyCount=${serialized.readyCount}/${serialized.totalNeeded} allReady=${serialized.allReady}`);

        // Broadcast updated state to all players in the room
        io.to(matchId).emit('lobby-state', serialized);

        if (serialized.allReady) {
          logDebug(`[player-ready] Starting match ${matchId} - calling startGame`);
          lobbyReadyState.delete(matchId);
          await startGame(io, matchId);
        }
      } catch (err) {
        logDebug(`[player-ready-error] ${err.message}`);
      }
    });

    // ── Make Move ────────────────────────────────────────────────────
    socket.on('make-move', async (data) => {
      try {
        const { matchId, position } = data;
        if (!socket.rooms.has(matchId)) {
          logDebug(`[make-move] socket ${socket.id} of ${username} was not in room ${matchId}, joining on the fly`);
          socket.join(matchId);
        }

        const game = gameManager.getGame(matchId);

        console.log(`make-move: ${username} (${userId})`);
        if (game) {
          const turnOk = String(game.currentTurn) === userId;
          console.log(`  currentTurn=${game.currentTurn} X=${game.players.X} O=${game.players.O} → ${turnOk ? 'OK' : 'MISMATCH'}`);
        }

        const result = await gameManager.makeMove(matchId, userId, position);

        if (!result.success) {
          console.log(`  Move failed: ${result.message}`);
          return socket.emit('move-error', { message: result.message });
        }

        io.to(matchId).emit('game-updated', { matchId, gameState: result.game });

        if (result.game.status === 'ongoing') {
          triggerBotMoveIfNeeded(io, matchId, result.game.currentTurn);
        }
      } catch (error) {
        console.log('make-move error:', error);
      }
    });

    // ── Disconnect ───────────────────────────────────────────────────
    socket.on('disconnect', async () => {
      console.log(`Socket disconnected: ${username}`);
      try {
        await matchmaker.removeticket(userId);
        await User.findByIdAndUpdate(userId, { status: 'online' });
      } catch (err) {
        console.log('disconnect cleanup error:', err);
      }
    });
  });
};