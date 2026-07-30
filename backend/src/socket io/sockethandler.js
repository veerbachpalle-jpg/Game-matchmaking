import jwt from 'jsonwebtoken';
import { User } from '../models/user.models.js';
import { matchmaker } from '../Matchfunction/matchmaker.js';
import { gameManager } from '../Matchfunction/gameManager.js';

const useractiverooms = new Map();

export const setupsockethandler = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || 
                    socket.handshake.headers['authorization']?.split(' ')[1] || 
                    socket.handshake.headers['authorisation']?.split(' ')[1];

      if (!token) {
        return next(new Error("Authentication error: no token found"));
      }

      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      
      const userId = decoded._id || decoded.userId;
      socket.data.userId = userId;

      const user = await User.findById(userId);

      if (!user) {
        return next(new Error("User not found"));
      }
      socket.data.username = user.username;

      next();
    } catch (error) {
      return next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", async (socket) => {
    const userId = socket.data.userId;
    const username = socket.data.username;

    console.log(`Socket connected for user: ${username}`);

    socket.join(userId);
    
    try {
      await User.findByIdAndUpdate(userId, { status: 'online' });
    } catch (err) {
      console.log("Failed to update user status to online:", err);
    }

    socket.on('join-queue', async (data) => {
      try {
        const { ping, region, gamemode } = data;
        
        const userDoc = await User.findById(userId);
        if (!userDoc) return;
        
        const mmr = userDoc.mmr;

        console.log(`User: ${username} joining the ${gamemode}`);

        await matchmaker.addticket(
          userId,
          username,
          mmr,
          ping,
          region,
          gamemode
        );

        socket.emit('queue-joined', { gamemode, region, ping });
      } catch (error) {
        console.log("Error in joining the queue:", error);
        socket.emit('error', { message: "failed to join matchmaking queue" });
      }
    });

    socket.on('leave-queue', async () => {
      try {
        console.log(`User: ${username} is leaving the queue`);
        await matchmaker.removeticket(userId);
        socket.emit('queue-left');
      } catch (error) {
        console.log("Error in leaving queue:", error);
      }
    });

    socket.on('join-game-room', async (data) => {
      console.log(`User: ${username} joined room ${data.roomId}`);
      socket.join(data.roomId);
      useractiverooms.set(userId, data.roomId);
      try {
        await User.findByIdAndUpdate(userId, { status: 'in-game' });
      } catch (err) {
        console.log("Error updating user status to in-game:", err);
      }
    });

    socket.on('make-move', async (data) => {
      try {
        const { matchId, position } = data;
        const result = gameManager.makeMove(matchId, userId, position);

        if (!result.success) {
          return socket.emit('move-error', { message: result.message });
        }

        io.to(matchId).emit('game-updated', {
          matchId,
          gameState: result.game
        });
      } catch (error) {
        console.log("Error making move: ", error);
      }
    });

    socket.on('game-input', async (data) => {
      try {
        const { matchId, position } = data;
        const result = gameManager.makeMove(matchId, userId, position);

        if (!result.success) {
          return socket.emit('move-error', { message: result.message });
        }

        io.to(matchId).emit('game-updated', {
          matchId,
          gameState: result.game
        });
      } catch (error) {
        console.log("Error handling game input:", error);
      }
    });

    socket.on('disconnect', async () => {
      console.log(`Socket disconnected for user: ${username}`);
      try {
        await matchmaker.removeticket(userId);
        await User.findByIdAndUpdate(userId, { status: 'offline' });
      } catch (err) {
        console.log("Error handling disconnect cleanup:", err);
      }
    });
  });
};