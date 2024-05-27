import { nanoid } from 'nanoid';

const PLAYER_X = "X";
const PLAYER_O = "O";

const games = {};

export default function handleSockets(io) {
    io.on("connection", (socket) => {
        console.log(`User connected: ${socket.id.substring(0, 5)}`);

        socket.on('createGame', () => {
            const roomCode = nanoid(5);
            games[roomCode] = {
                tiles: Array(9).fill(null),
                playerTurn: PLAYER_X,
                strikeClass: null,
                turnPlaces: [],
                players: { [socket.id]: PLAYER_X },
                playerCount: 1
            };
            socket.join(roomCode);
            socket.emit('gameCreated', roomCode);
            console.log(`Game created with room code: ${roomCode}`);
            console.log(games);
        });

        socket.on('joinGame', (roomCode) => {
            const game = games[roomCode];
            if (game && game.playerCount < 2) {
                game.players[socket.id] = PLAYER_O;
                game.playerCount += 1;
                socket.join(roomCode);
                socket.emit('gameJoined', roomCode);
                io.to(roomCode).emit('isRoomReady', game.playerCount !== 2 ? false : true)
                io.to(roomCode).emit('initialState', game); // Emit initial state to both players
                console.log(`User ${socket.id.substring(0, 5)} joined game with room code: ${roomCode}`);
            } else {
                socket.emit('error', 'Room is full or does not exist');
                console.log(`User ${socket.id.substring(0, 5)} attempted to join full/non-existent room: ${roomCode}`);
            }
            console.log(games);
        });

        socket.on('click-check', ({ roomId, index }) => {
            const game = games[roomId];
            console.log(games, roomId);
            const playerSymbol = game.players[socket.id];
            if (
                playerSymbol !== game.playerTurn ||
                game.tiles[index] !== null ||
                game.strikeClass
            ) {
                return;
            }
            console.log(`${socket.id.substring(0, 5)} clicked tile ${index}`);

            if (game.turnPlaces.length >= 6) {
                const newTiles = [...game.tiles];
                newTiles[game.turnPlaces[0]] = null;
                game.turnPlaces[0] = null;
                game.turnPlaces.shift();
                game.turnPlaces.push(index);
                newTiles[index] = game.playerTurn;
                game.tiles = newTiles;
            } else {
                const newTiles = [...game.tiles];
                newTiles[index] = game.playerTurn;
                game.turnPlaces.push(index);
                game.tiles = newTiles;
            }
            game.playerTurn =
                game.playerTurn === PLAYER_X ? PLAYER_O : PLAYER_X;
            io.to(roomId).emit('gameState', game); // Emit updated game state to both players
        });


        socket.on('reset', (roomId) => {
            console.log(`${socket.id.substring(0, 5)} reset the game`);
            const game = games[roomId];
            game.tiles = Array(9).fill(null);
            game.playerTurn = PLAYER_X;
            game.strikeClass = null;
            game.turnPlaces = [];
            io.to(roomId).emit('gameState', game); // Emit reset game state to both players
        });

        socket.on("disconnect", () => {
            console.log(`${socket.id} has DISCONNECTED!!`);
            for (const roomCode in games) {
                const game = games[roomCode];
                if (game.players[socket.id]) {
                    delete game.players[socket.id];
                    game.playerCount -= 1;
                    if (game.playerCount === 0) {
                        delete games[roomCode];
                    } else {
                        io.to(roomCode).emit('playerLeft');
                    }
                    break;
                }
            }
        });
    });
}