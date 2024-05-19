import { createServer } from 'http';
import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';


const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST'],
    }
})
app.use(cors());

const PLAYER_X = 'X';
const PLAYER_O = 'O';

let gameData = {
    tiles: Array(9).fill(null),
    playerTurn: PLAYER_X,
    strikeClass: null,
    turnPlaces: [],
    players: {}
}


io.on('connection',(socket) => {
    console.log(`User connected: ${socket.id.substring(0,5)}`);

    if(Object.keys(gameData.players).length < 2){
        const symbol = Object.keys(gameData.players).length === 0 ? PLAYER_X : PLAYER_O;
        gameData.players[socket.id] = symbol;
        socket.emit('playerSymbol', symbol);

        //notify the new palyer of the current game state
        
    } else{
        socket.emit('gameFull');
        socket.disconnect();
    }

    socket.emit('initialState', gameData);
    

    socket.on('click-check', ({index, tiles, playerTurn, turnPlaces}) => {
        const playerSymbol = gameData.players[socket.id];

        if(playerSymbol !== gameData.playerTurn || gameData.tiles[index] !== null || gameData.strikeClass){
            return;
        }
        console.log(`${socket.id.substring(0,5)} clicked tile ${index}`);

        if (gameData.turnPlaces.length >= 6){
            const newTiles = [...gameData.tiles];
            newTiles[gameData.turnPlaces[0]] = null;
            gameData.turnPlaces[0] = null;
            gameData.turnPlaces.shift();
            gameData.turnPlaces.push(index);  
            newTiles[index] = playerTurn;
            gameData.tiles = newTiles;
        }
        else{
            const newTiles = [...gameData.tiles];
            newTiles[index] = gameData.playerTurn;
            gameData.turnPlaces.push(index);
            gameData.tiles = newTiles;
        }
        gameData.playerTurn = gameData.playerTurn === PLAYER_X ? PLAYER_O : PLAYER_X;
        console.log(gameData.tiles);
        io.emit('gameState', gameData);
    })

    socket.on('reset', () => {
        console.log(`${socket.id.substring(0,5)} reset the game`);
        gameData.tiles = Array(9).fill(null);
        gameData.playerTurn = PLAYER_X;
        gameData.strikeClass = null;
        gameData.turnPlaces = [];
        io.emit('gameState', gameData);
    })

    socket.on('disconnect', () => {
        console.log(`${socket.id} has DISCONNECTED!!`);
        delete gameData.players[socket.id]
    })
})



httpServer.listen(3001, () => {
    console.log(`server is running on: http://localhost:3001`);
})
