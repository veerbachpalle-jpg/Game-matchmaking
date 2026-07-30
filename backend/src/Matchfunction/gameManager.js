import { Matchhistory } from "../models/Matchhistory.model";
import { User } from "../models/user.models";

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

  makeMove(matchId, userId, position) {
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
      this.finalizeGame(game);
    } else if (game.board.every(cell => cell !== null)) {
      game.status = "draw";
      game.winner = null;
      this.finalizeGame(game);
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

      await Matchhistory.findByIdAndUpdate(game.matchId, {
        status: "completed",
        result: {
          winnerId: game.winner || null
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
