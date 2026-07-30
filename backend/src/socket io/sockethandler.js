import { Server } from 'socket.io';
import { Jwt } from 'jsonwebtoken';
import { User } from '../models/user.models';
import { Socket } from 'dgram';
import { matchmaker } from '../Matchfunction/matchmaker';


const JWT_SECRET = process.env.JWT_SECRET

const useractiverooms = new map()

export const setupsockethandler = (io) => {

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers['authorisation']?.split(' ')[1];

      if (!token) {
        return next(new Error("authentication error : no token found "))
      }

      const decoded = jwt.verify(token, JWT_SECRET)

      socket.data.userId = decoded.userId

      const user = User.findById(socket.data.userId)

      if (!user) {
        return next(new Error("User not found "))
      }
      socket.data.username = user.username;

      next();
    } catch (error) {
      return next(new Error("Authentication error : Invalid token "))
    }
  });
  io.on("connection", async (socket) => {
    const userId = socket.data.userId;
    const username = socket.data.username;

    console.log("Socket conected")

    socket.join(userId);
    await User.findByIdAndUpdate(userId, { status: 'online', })

    socket.on('join-queue', async (data) => {
      try {
        const { ping, region, gamemode } = data;
        const user = await User.findById(user)
        if (!user) return
        const mmr = user.mmr

        console.log(`User:${username} joining the ${gamemode}`)

        await matchmaker.addticket(
          userId,
          username,
          ping,
          mmr,
          region,
          gamemode
        )

        socket.emit('queue-joined', {
          gamemode,
          region,
          ping
        })
      } catch (error) {
        console.log("error in joing the queue ", error)
        socket.emit('error', {
          message: "failed to join matchmaking queue"
        })
      }
    })
    socket.on('leave-queue', async (data) => {
      try {
        console.log(`user:${username}is leaving the queue`)

        await matchmaker.removeticket(userId);
        socket.emit('queue left')

      } catch (error) {
        console.log("error in leaving the queue ", error)
      }
    })
  })

  socket.on('game-input', async (data) => {

  })
  socket.on('join-game-room', async (data) => {
    console.log(`user:${username} joined the room ${data.roomId}`)

    socket.join(data.roomId);
    useractiverooms.set(userId, data.roomId)
    await User.findByIdAndUpdate(userId, { status: 'In-game' })

  })

}