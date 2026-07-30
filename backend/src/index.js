import http from 'http';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import app from './app';
import connectDb from './Db/connetctdb';
import { setupsockethandler } from './socket io/sockethandler';
import { matchmaker } from './Matchfunction/matchmaker';

dotenv.config();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true
  }
});

setupsockethandler(io);

const PORT = process.env.PORT || 8000;

connectDb()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server is running at port ${PORT}`);
      matchmaker.startWorker(io);
    });
  })
  .catch((error) => {
    console.log("Database connection error:", error);
  });
