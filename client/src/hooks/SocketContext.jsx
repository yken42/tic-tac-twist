import { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);
const apiUrl = 'https://tic-tac-twist.onrender.com/';

export const SocketProvider = ({ children }) => {
    
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const newSocket = io.connect(apiUrl);
        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        }
    }, [])

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    )
}