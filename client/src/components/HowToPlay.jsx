import ButtonStyle from "../styles/Button.styled";
import { useNavigate } from 'react-router-dom';

const HowToPlay = () => {
    const navigate = useNavigate();

    return ( 
        <>
            <h1 className="game-title">TiC <span className="x-color">X</span> TAC <span className="o-color">O</span> TOE</h1>
            <div className="guide-frame">
                <h3 className="guide-title">How to play</h3>
                <p className="guide-text">The objective of the game is to track
                players placements on the board. <br />
                Player one places their component (shape) on the board. Next, player two
                places their component, and the game continues. <br />
                There will be no more than three of the same component on the board
                at a given time.<br />
                After a player's fourth component has been placed, the original
                component will be removed. <br />
                The game continues with the same pattern
                until three in a row have been accomplished.</p>
                <ButtonStyle onClick={() => navigate('../')}>Back<span></span></ButtonStyle>
            </div>
        </>
     );
}
 
export default HowToPlay;