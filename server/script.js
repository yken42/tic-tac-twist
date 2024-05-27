import { createServer } from 'http';
import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import handleSockets from './socketHandler.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: 'http://localhost:5173',
    }
})
app.use(cors());

app.get('/', (req, res) => {
    res.send('Tic-Tac-Toe server is running.')
})

handleSockets(io);

httpServer.listen(3000, () => {
    console.log(`server is running on: http://localhost:3000`);
})
