import { Matchhistory } from "../models/Matchhistory.model.js";
import { User } from "../models/user.models.js";

class GameManager {
  constructor() {
    this.activeGames = new Map();
  }

  createGame(matchId, player1Id, player2Id) {
    const game = {
      matchId: matchId.toString(),
      board: Array(9).fill(null),
      players: {
        X: player1Id.toString(),
        O: player2Id.toString()
      },
      currentTurn: player1Id.toString(),
      status: "ongoing",
      winner: null
    };

    this.activeGames.set(matchId.toString(), game);
    return game;
  }

  getGame(matchId) {
    return this.activeGames.get(matchId.toString()) || null;
  }

  async makeMove(matchId, userId, position) {
    const game = this.activeGames.get(matchId.toString());

    if (!game) {
      return { success: false, message: "Game session not found" };
    }

    if (game.status !== "ongoing") {
      return { success: false, message: "Game is already over" };
    }

    if (game.currentTurn !== userId.toString()) {
      return { success: false, message: "Not your turn" };
    }

    if (position < 0 || position > 8 || game.board[position] !== null) {
      return { success: false, message: "Invalid move position" };
    }

    const symbol = game.players.X === userId.toString() ? "X" : "O";
    game.board[position] = symbol;

    const winPatterns = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];

    let hasWinner = false;
    for (const pattern of winPatterns) {
      const [a, b, c] = pattern;
      if (
        game.board[a] &&
        game.board[a] === game.board[b] &&
        game.board[a] === game.board[c]
      ) {
        hasWinner = true;
        break;
      }
    }

    if (hasWinner) {
      game.status = "completed";
      game.winner = userId.toString();
      await this.finalizeGame(game);
    } else if (game.board.every(cell => cell !== null)) {
      game.status = "draw";
      game.winner = null;
      await this.finalizeGame(game);
    } else {
      game.currentTurn = game.players.X === userId.toString() ? game.players.O : game.players.X;
    }

    return { success: true, game };
  }

  async finalizeGame(game) {
    try {
      const playerIds = [game.players.X, game.players.O];
      await User.updateMany(
        { _id: { $in: playerIds } },
        { status: "online" }
      );

      const mmrChanges = {};

      const playerX = await User.findById(game.players.X);
      const playerO = await User.findById(game.players.O);

      if (playerX && playerO) {
        const K = 32; // Elo constant
        const r1 = playerX.mmr || 1000;
        const r2 = playerO.mmr || 1000;

        // Expected scores
        const e1 = 1 / (1 + Math.pow(10, (r2 - r1) / 400));
        const e2 = 1 / (1 + Math.pow(10, (r1 - r2) / 400));

        // Actual scores
        let s1 = 0.5;
        let s2 = 0.5;
        if (game.status === "completed" && game.winner) {
          if (game.winner === playerX._id.toString()) {
            s1 = 1;
            s2 = 0;
          } else if (game.winner === playerO._id.toString()) {
            s1 = 0;
            s2 = 1;
          }
        }

        // New ratings (floor to 100)
        const newMmr1 = Math.max(100, Math.round(r1 + K * (s1 - e1)));
        const newMmr2 = Math.max(100, Math.round(r2 + K * (s2 - e2)));

        await User.findByIdAndUpdate(playerX._id, { $set: { mmr: newMmr1 } });
        await User.findByIdAndUpdate(playerO._id, { $set: { mmr: newMmr2 } });

        mmrChanges[playerX._id.toString()] = newMmr1 - r1;
        mmrChanges[playerO._id.toString()] = newMmr2 - r2;

        console.log(`[ELO-MMR-Update] Player X(${playerX.username}): ${r1} -> ${newMmr1} (${newMmr1 - r1 >= 0 ? '+' : ''}${newMmr1 - r1}). Player O(${playerO.username}): ${r2} -> ${newMmr2} (${newMmr2 - r2 >= 0 ? '+' : ''}${newMmr2 - r2}).`);
      }

      await Matchhistory.findByIdAndUpdate(game.matchId, {
        status: "completed",
        result: {
          winnerId: game.winner || null,
          mmrChanges: mmrChanges
        }
      });
    } catch (error) {
      console.log("Error finalizing 1v1 game:", error);
    } finally {
      this.activeGames.delete(game.matchId);
    }
  }

  removeGame(matchId) {
    this.activeGames.delete(matchId.toString());
  }
}

export const gameManager = new GameManager();
