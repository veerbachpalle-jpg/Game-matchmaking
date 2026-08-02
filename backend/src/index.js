import 'dotenv/config';
import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import connectDb from './Db/connetctdb.js';
import { setupsockethandler } from './socket io/sockethandler.js';
import { matchmaker } from './Matchfunction/matchmaker.js';
import { getCorsOptions } from './utils/corsOptions.js';

const server = http.createServer(app);
const io = new Server(server, {
  cors: getCorsOptions()
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
