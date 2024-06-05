import { nanoid } from "nanoid";

const PLAYER_X = "X";
const PLAYER_O = "O";

const games = {};

export default function handleSockets(io) {
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id.substring(0, 5)}`);

    //create a new socket room with initialized board and assigns 'X' to the player
    socket.on("createGame", () => {
      const roomCode = nanoid(5);
      games[roomCode] = {
        tiles: Array(9).fill(null),
        playerTurn: PLAYER_X,
        strikeClass: null,
        turnPlaces: [],
        players: { [socket.id]: PLAYER_X },
        playerCount: 1,
      };
      socket.join(roomCode);
      socket.emit("gameCreated", roomCode);
      console.log(`Game created with room code: ${roomCode}`);
      console.log(games);
    });

    //joins the 2nd player to the room and assigns the 'O' shape to him
    socket.on("joinGame", (roomCode) => {
      const game = games[roomCode];
      if (game && game.playerCount < 2) {
        game.players[socket.id] = PLAYER_O;
        game.playerCount += 1;
        socket.join(roomCode);
        socket.emit("gameJoined", roomCode);
        io.to(roomCode).emit(
          "isRoomReady",
          game.playerCount !== 2 ? false : true
        );
        io.to(roomCode).emit("initialState", game);
        console.log(
          `User ${socket.id.substring(
            0,
            5
          )} joined game with room code: ${roomCode}`
        );
      } else {
        socket.emit("error", "Room is full or does not exist");
        console.log(
          `User ${socket.id.substring(
            0,
            5
          )} attempted to join full/non-existent room: ${roomCode}`
        );
      }
      console.log(games);
    });

    //handle the board states for each click
    socket.on("click-check", ({ roomId, index }) => {
      const game = games[roomId];
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
      game.playerTurn = game.playerTurn === PLAYER_X ? PLAYER_O : PLAYER_X;
      io.to(roomId).emit("gameState", game);
      console.log(game.tiles);
    });

    //resets the game back to initialized board state
    socket.on("reset", (roomId) => {
      console.log(`${socket.id.substring(0, 5)} reset the game`);
      const game = games[roomId];
      game.tiles = Array(9).fill(null);
      game.playerTurn = PLAYER_X;
      game.strikeClass = null;
      game.turnPlaces = [];
      io.to(roomId).emit("gameState", game);
    });

    //set an alert on player disconnect
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
            io.emit("playerLeft");
          }
          break;
        }
      }
    });
  });
}
