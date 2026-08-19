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
    server.listen(PORT, async () => {
      console.log(`Server is running at port ${PORT}`);
      try {
        const { User } = await import('./models/user.models.js');
        await User.updateMany({}, { status: 'offline' });
        console.log('Reset all user statuses to offline');
      } catch (err) {
        console.log('Failed to reset statuses on startup:', err);
      }
      matchmaker.startWorker(io);
    });
  })
  .catch((error) => {
    console.log("Database connection error:", error);
  });
