import {Server} from 'socket.io';
import { Jwt } from 'jsonwebtoken';
import { User } from '../models/user.models';
import { Socket } from 'dgram';


const JWT_SECRET = process.env.JWT_SECRET

const useractiverooms = new map()

export const setupsockethandler = (io)=>{

  io.use(async(socket,next)=>{
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers['authorisation']?.split(' ')[1];

      if(!token){
        return next(new Error("authentication error : no token found "))
      }

      const decoded = jwt.verify(token,JWT_SECRET)

      socket.data.userId = decoded.userId

      const user = User.findById(socket.data.userId)

      if(!user){
        return next(new Error("User not found "))
      }
      socket.data.username = user.username;

      next();
    } catch (error) {
      return next(new Error("Authentication error : Invalid token "))
    }
  });
  io.on("connection",async(socket)=>{
    const userId = socket.data.userId;
    const username = socket.data.username;

    console.log("Socket conected")

    socket.join(userId);
    await User.findByIdAndUpdate(userId,{status:'online',})
  })
}