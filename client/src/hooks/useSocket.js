import { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io.connect('http://localhost:3001')

export default function useSocket(){ 
    const [gameState, setGameState] = useState({
        tiles: Array(9).fill(null),
        playerTurn: 'X',
        strikeClass: null,
        turnPlacements: [],
        playerSymbol: null,
        gameFull: false
    });

    useEffect(() => {
        socket.on('initialState', (initialGameData) => {
            setGameState(initialGameData);
        });

        socket.on('gameState', (updateGameState) => {
            setGameState(updateGameState);
        })

        socket.on('playerSymbol', (symbol) => {
            setGameState(prevState => ({ ...prevState, playerSymbol: symbol}));
        })

        socket.on('gameFull', () => {
            setGameState(prevState => ({...prevState, gameFull: true}));
        })

        return () => {
            socket.off('initialState');
            socket.off('gameState');
            socket.off('playerSymbol');
            socket.off('gameFull');
        }
    }, [])

    const emitClickCheck = (data) => {
        socket.emit('click-check', data);
    }

    const emitReset = () => {
        socket.emit('reset');
    }

    return {gameState, emitClickCheck, emitReset}
}