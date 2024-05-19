import { useState, useEffect } from "react";
import Board from "./Board";
import Turn from "./Turn";
import io from 'socket.io-client';

//A socket from the client to the server side
const socket = io.connect('http://localhost:3001')

const PLAYER_X = 'X';
const PLAYER_O = 'O';

const winningCombinations = [
    //rows
    { combo: [0, 1, 2], strikeClass: 'strike-row-1'},
    { combo: [3, 4, 5], strikeClass: 'strike-row-2'},
    { combo: [6, 7, 8], strikeClass: 'strike-row-3'},

    //columns
    { combo: [0, 3, 6], strikeClass: 'strike-column-1'},
    { combo: [1, 4, 7], strikeClass: 'strike-column-2'},
    { combo: [2, 5, 8], strikeClass: 'strike-column-3'},

    //diagonals
    { combo: [0, 4, 8], strikeClass: 'strike-diagonal-1'},
    { combo: [2, 4, 6], strikeClass: 'strike-diagonal-2'},
];

function checkWinner(tiles, setStrikeClass){
    for(const {combo, strikeClass} of winningCombinations){
       const tileValue1 = tiles[combo[0]];
       const tileValue2 = tiles[combo[1]];
       const tileValue3 = tiles[combo[2]];

       if(tileValue1 !== null && 
        tileValue1 === tileValue2 && 
        tileValue1 === tileValue3
        ){
        setStrikeClass(strikeClass);
       }
    }
}

export default function TicTacToe(){
    const [tiles, setTiles] = useState(Array(9).fill(null));
    const [playerTurn, setPlayerTurn] = useState(PLAYER_X);
    const [strikeClass, setStrikeClass] = useState(null);
    const [turnPlacements, setTurnPlacements] = useState([]);
    const [playerSymbol, setPlayerSymbol] = useState(null);
    const [gameFull, setGameFull] = useState(false);

    useEffect(() => {
        checkWinner(tiles, setStrikeClass);
        
    }, [tiles])

    useEffect(() => {
        socket.on('initialState', (initialGameData) => {
            setTiles(initialGameData.tiles);
            setPlayerTurn(initialGameData.playerTurn);
            setStrikeClass(initialGameData.strikeClass);
            setTurnPlacements(initialGameData.turnPlaces);
        });

        socket.on('gameState', (updateGameState) => {
            setTiles(updateGameState.tiles);
            setPlayerTurn(updateGameState.playerTurn);
            setStrikeClass(updateGameState.strikeClass);
            setTurnPlacements(updateGameState.turnPlaces);
        });

        socket.on('playerSymbol', (symbol) => {
            setPlayerSymbol(symbol);
        })

        socket.on('gameFull', () => {
            setGameFull(true);
        })

        return () => {
            socket.off('initialState');
            socket.off('gameState');
            socket.off('playerSmbol');
            socket.off('gameFull');
        }
    }, [])

    //restart button
    const handleRestartButton = () => {
        setTiles(Array(9).fill(null))
        setTurnPlacements([]);
        setStrikeClass(null);
        setPlayerTurn(PLAYER_X);
        socket.emit('reset')
    }

    const handleTileClick = (index) => {
        if(tiles[index] !== null || strikeClass || playerSymbol !== playerTurn){
            return;
        }

        socket.emit('click-check', { index, tiles, playerTurn, turnPlacements });
        
        const currentPlayer = playerTurn === PLAYER_X ? PLAYER_X : PLAYER_O;
        const xCount = tiles.filter(tile => tile === PLAYER_X).length;
        const oCount = tiles.filter(tile => tile === PLAYER_O).length;

        if((currentPlayer === PLAYER_X && xCount >= 3) || (currentPlayer === PLAYER_O && oCount >= 3)){
            const newTiles = [...tiles];
            newTiles[turnPlacements[0]] = null;
            setTurnPlacements(prevArr => {
                if(prevArr.length >= 6){
                    return [...prevArr.slice(1), index];
                } else {
                    return [...prevArr, index];
                }
            })
            newTiles[index] = playerTurn;
            setTiles(newTiles)
        }
        else{
        //update board on each click
        const newTiles = [...tiles];
        newTiles[index] = playerTurn;
        setTurnPlacements(oldArray => [...oldArray, index])
        setTiles(newTiles);
        }
        //Switch players turn
        setPlayerTurn(playerTurn === PLAYER_X ? PLAYER_O : PLAYER_X); 
    }

    const getTurnMessage = () => {
        if(strikeClass){
            return 'Game Over';
        }
        return playerSymbol === playerTurn ? `Your Turn` : `opponents's turn`;
    }

    return ( 
        <div>
            <h1>TiC <span className="x-color">X</span> TAC <span className="o-color">O</span> TOE</h1>
            {gameFull ? (
                <div>Game is full, try again latter</div>
            ) : (
            <>
                <Board playerTurn={playerTurn} tiles={tiles} onTileClick={handleTileClick} strikeClass={strikeClass}/>
                <div className="buttons">
                    <Turn turn={getTurnMessage()}/>
                    <button className="restart-btn" onClick={handleRestartButton}>restart</button>
                </div>
            </>
            )}
        </div>
     );
}
