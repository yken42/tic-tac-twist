import { useState, useEffect } from "react";
import Board from "./Board";
import Turn from "./Turn";

const PLAYER_X = 'X';
const PLAYER_O = 'O';
let TURNS_PLACES = [];

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

    useEffect(() => {
        checkWinner(tiles, setStrikeClass);
    }, [tiles])


    //restart button
    const handleRestartButton = () => {
        setTiles(Array(9).fill(null))
        TURNS_PLACES = [];
        setStrikeClass(null);
        setPlayerTurn(PLAYER_X);
    }

    const handleTileClick = (index) => {
        if(tiles[index] !== null || strikeClass){
            return;
        }

        const currentPlayer = playerTurn === PLAYER_X ? PLAYER_X : PLAYER_O;
        const xCount = tiles.filter(tile => tile === PLAYER_X).length;
        const oCount = tiles.filter(tile => tile === PLAYER_O).length;

        //keep track of indexes placements
        TURNS_PLACES.push(index);

        if((currentPlayer === PLAYER_X && xCount >= 3) || (currentPlayer === PLAYER_O && oCount >= 3)){
            const newTiles = [...tiles];
            newTiles[TURNS_PLACES[0]] = null;
            TURNS_PLACES.shift();
            newTiles[index] = playerTurn;
            setTiles(newTiles)
        }
        else{
        //update board on each click
        const newTiles = [...tiles];
        newTiles[index] = playerTurn;
        setTiles(newTiles);
        }
        //Switch players turn
        setPlayerTurn(playerTurn === PLAYER_X ? PLAYER_O : PLAYER_X); 
    }

    return ( 
        <div>
            <h1>TiC <span className="x-color">X</span> TAC <span className="o-color">O</span> TOE</h1>
            <Board playerTurn={playerTurn} tiles={tiles} onTileClick={handleTileClick} strikeClass={strikeClass}/>
            <div className="buttons">
                <Turn turn={playerTurn}/>
                <button className="restart-btn" onClick={handleRestartButton}>restart</button>
            </div>
        </div>
     );
}
 