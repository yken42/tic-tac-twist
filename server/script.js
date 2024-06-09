import { createServer } from 'http';
import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import handleSockets from './socketHandler.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: 'https://tic-tac-twist-ul0i.onrender.com/',
    }
})
app.use(cors());

app.get('/', (req, res) => {
    res.send('Tic-Tac-Toe server is running.')
})

handleSockets(io);

httpServer.listen(3000, () => {
    console.log(`server is running on: https://tic-tac-twist.onrender.com/`);
})
