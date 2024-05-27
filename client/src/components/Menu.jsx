import ButtonStyle from '../styles/Button.styled.js';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useSocket } from '../hooks/SocketContext';

const Menu = () => {
    const navigate = useNavigate();
    const socket = useSocket();
    const [roomCode, setRoomCode] = useState('');

    const handleCreateGame = () => {
        if (!socket) return;

        socket.emit('createGame');
        socket.once('gameCreated', (roomCode) => {
            navigate(`/play/${roomCode}`);
        });
    };

    const handleJoinGame = () => {
        if (!socket) return;

        socket.emit('joinGame', roomCode);
        socket.once('gameJoined', () => {
            navigate(`/play/${roomCode}`);
        });
        socket.once('error', (message) => {
            alert(message);
        });
    };

    return (
        <>
            <h1 className='game-title'>TiC <span className="x-color">X</span> TAC <span className="o-color">O</span> TOE</h1>
            <div className="menu">
                <div className="menu-buttons">
                    <ButtonStyle onClick={handleCreateGame}>Create Game<span></span></ButtonStyle>
                    <input
                        type='text'
                        value={roomCode}
                        onChange={(e) => setRoomCode(e.target.value)}
                        placeholder='Enter Room Code'
                    />
                    <ButtonStyle onClick={handleJoinGame}>Join Game<span></span></ButtonStyle>
                </div>
                <ButtonStyle onClick={() => navigate('./how-to-play')}>How to play<span></span></ButtonStyle>
            </div>
        </>
    );
};

export default Menu;