import { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import Board from "./Board";
import Turn from "./Turn";
import checkWinner from "../utils/checkWinner";
import { useSocket } from '../hooks/SocketContext';

const PLAYER_X = 'X';
const PLAYER_O = 'O';

export default function TicTacToe() {
    const { roomId } = useParams();
    const [tiles, setTiles] = useState(Array(9).fill(null));
    const [playerTurn, setPlayerTurn] = useState(PLAYER_X);
    const [strikeClass, setStrikeClass] = useState(null);
    const [turnPlacements, setTurnPlacements] = useState([]);
    const [playerSymbol, setPlayerSymbol] = useState(null);
    const [roomReady, setRoomReady] = useState(false);
    const socket = useSocket();

    useEffect(() => {
        if (!socket) return;

        const handleInitialState = (initialGameData) => {
            setTiles(initialGameData.tiles);
            setPlayerTurn(initialGameData.playerTurn);
            setStrikeClass(initialGameData.strikeClass);
            setTurnPlacements(initialGameData.turnPlaces);
            setPlayerSymbol(initialGameData.players[socket.id]);
        };

        const handleGameState = (updateGameState) => {
            setTiles(updateGameState.tiles);
            setPlayerTurn(updateGameState.playerTurn);
            setStrikeClass(updateGameState.strikeClass);
            setTurnPlacements(updateGameState.turnPlaces);
        };

        const handlePlayerSymbol = (symbol) => {
            setPlayerSymbol(symbol);
        };

        const handlePlayerLeft = () => {
            alert('Your opponent has left the game');
        };

        const handleIsRoomReady = (isFull) => {
            setRoomReady(isFull)
        }

        socket.on('initialState', handleInitialState);
        socket.on('gameState', handleGameState);
        socket.on('playerSymbol', handlePlayerSymbol);
        socket.on('playerLeft', handlePlayerLeft);
        socket.on('isRoomReady', handleIsRoomReady)

        console.log(roomId);
        return () => {
            // socket.off('isRoomReady', handleIsRoomReady);
            socket.off('initialState', handleInitialState);
            socket.off('gameState', handleGameState);
            socket.off('playerSymbol', handlePlayerSymbol);
            socket.off('playerLeft', handlePlayerLeft);
        };
    }, [socket, roomId]);

    useEffect(() => {
        checkWinner(tiles, setStrikeClass);
    }, [tiles]);

    const handleRestartButton = () => {
        setTiles(Array(9).fill(null));
        setTurnPlacements([]);
        setStrikeClass(null);
        setPlayerTurn(PLAYER_X);
        socket.emit('reset', roomId);
    };

    const handleTileClick = (index) => {
        if (!socket) return;
        if (tiles[index] !== null || strikeClass || playerSymbol !== playerTurn) {
            return;
        }
        const newTiles = [...tiles];
        if (turnPlacements.length >= 6) {
            newTiles[turnPlacements[0]] = null;
        }
        setTurnPlacements(prevArr => {
            if (prevArr.length >= 6) {
                return [...prevArr.slice(1), index];
            } else {
                return [...prevArr, index];
            }
        });
        newTiles[index] = playerTurn;
        setTiles(newTiles);

        setPlayerTurn(playerTurn === PLAYER_X ? PLAYER_O : PLAYER_X);
        socket.emit('click-check', { roomId, index });
    };

    const getTurnMessage = () => {
        if (strikeClass) {
            return 'Game Over';
        }
        return playerSymbol === playerTurn ? `Your Turn` : `Opponent's Turn`;
    };

    return (
        <div>
            <h1 className="game-title">TiC <span className="x-color">X</span> TAC <span className="o-color">O</span> TOE</h1>
            {!roomReady ? 
            <>
                <h1>Room code is {roomId}</h1>
            </> : 
            <>
                <Board playerTurn={playerTurn} tiles={tiles} onTileClick={handleTileClick} strikeClass={strikeClass} />
                <div className="buttons">
                    <Turn turn={getTurnMessage()} />
                    <button className="restart-btn" onClick={handleRestartButton}>Play Again</button>
                </div>
            </>
}
        </div>
    );
}